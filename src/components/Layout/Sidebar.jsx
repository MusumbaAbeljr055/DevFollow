import React from "react";
import { Link } from "react-router-dom";
import { Box, Button } from "@chakra-ui/react";
import { useAuth } from "../../hooks/auth";
import Avatar from "../Profile/Avatar";
const Sidebar = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return "Loading...";
  return (
    <Box bg="tomato" color="white">
      <Box>
        <Avatar user={user} />
        <Button
          as={Link}
          to={`/protected/profile/${user.id}`}
          colorScheme="blue"
        >
          Edit Profile
        </Button>
      </Box>
      <Box>
        <Button as={Link} to={"/protected/users"} colorScheme="green">
          All Users
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
