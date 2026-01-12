import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import Post from "./Post";
const PostsList = ({ posts }) => {
  return (
    <Box>
      {posts?.length === 0 ? (
        <Flex w="50%" justify="center" className="flex">
          <Text fontWeight="700" fontSize="18px">
            No Posts...
          </Text>
        </Flex>
      ) : (
        posts?.map((post) => <Post key={post.id} post={post} />)
      )}
    </Box>
  );
};

export default PostsList;
