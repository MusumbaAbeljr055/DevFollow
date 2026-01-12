import React from "react";
import { Box, Button, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
const UsernameButton = ({ user }) => {
  return (
    <Link
      as={RouterLink}
      to={`/protected/profile/${user.id}`}
      textDecor="none"
      _hover={{ textDecoration: "none", opacity: "0.8" }}
    >
      {user.username}
    </Link>
  );
};

export default UsernameButton;
