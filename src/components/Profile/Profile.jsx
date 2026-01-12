// FINAL FIXED Profile.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../hooks/users";
import PostsList from "../post/PostsList";
import { useShowPosts } from "../../hooks/posts";
import { useTotalLikes } from "../../hooks/posts";
import {
  Button,
  Flex,
  Text,
  useDisclosure,
  useMediaQuery,
  Box,
  Spinner,
  Container
} from "@chakra-ui/react";
import Avatar from "./Avatar";
import EditProfile from "./EditProfile";
import { format } from "date-fns";
import { useAuth } from "../../hooks/auth";
import UsernameButton from "./UsernameButton";

const Profile = () => {
  const { id } = useParams();
  
  // Get user data
  const { user, isLoading: userLoading, error: userError } = useUser(id);
  
  // Get posts WITH ERROR HANDLING
  const { posts, isLoading: postsLoading, error: postsError } = useShowPosts(id);
  
  // Get auth data
  const { user: authUser, isLoading: authLoading } = useAuth();
  
  // Get likes WITH ERROR HANDLING
  const { total, isLoading: likesLoading, error: likesError } = useTotalLikes(id);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSmallScreen] = useMediaQuery("(max-width: 595px)");

  // Handle loading state
  if (userLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  // Handle user error
  if (userError) {
    return (
      <Container maxW="container.md" py={10}>
        <Text color="red.500">Error loading user: {userError.message}</Text>
      </Container>
    );
  }

  // Check if user exists
  if (!user) {
    return (
      <Container centerContent py={10}>
        <Text fontSize="xl">User not found</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Flex
        justify="space-between"
        w={{ base: "100%", md: "50%" }}
        align="end"
        mt="30px"
        flexDirection={{ base: "column", md: "row" }}
        gap={4}
      >
        <Flex direction="column" align="center">
          <Avatar user={user} size="lg" />
          <UsernameButton user={user} />
        </Flex>
        
        {/* Safe auth check */}
        {!authLoading && authUser && authUser.id === user.id && (
          <Button
            onClick={onOpen}
            variant="outline"
            color="blue.600"
            size={isSmallScreen ? "sm" : "md"}
            borderWidth="1px"
            borderColor="blue.600"
          >
            Change Picture
          </Button>
        )}
      </Flex>
      
      <Flex 
        gap="55px" 
        pt="5px" 
        mb="30px" 
        flexWrap="wrap"
        direction={{ base: "column", md: "row" }}
      >
        <Text>
          <strong>Posts:</strong> {postsError ? "Error" : (posts?.length || 0)}
        </Text>
        <Text>
          <strong>Likes:</strong> {likesError ? "Error" : (likesLoading ? "Loading..." : (total || 0))}
        </Text>
        <Text>
          {/* Safe date formatting */}
          <strong>Joined:</strong> {user.date ? format(user.date, "MMM yyy") : "Unknown"}
        </Text>
        <EditProfile isOpen={isOpen} onClose={onClose} />
      </Flex>
      
      {/* Posts section - handle error */}
      {postsError ? (
        <Box textAlign="center" py={4} color="orange.500">
          <Text>Posts temporarily unavailable</Text>
          <Text fontSize="sm">
            Firestore index is being created. This may take a few minutes.
          </Text>
        </Box>
      ) : postsLoading ? (
        <Text textAlign="center">Loading posts...</Text>
      ) : posts && posts.length > 0 ? (
        <PostsList posts={posts} />
      ) : (
        <Text textAlign="center" py={10} color="gray.500">
          No posts yet...
        </Text>
      )}
    </Container>
  );
};

export default Profile;