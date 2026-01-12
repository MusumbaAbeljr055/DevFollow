import React from "react";
import { Box } from "@chakra-ui/react";
import { Avatar as ChakraAvatar } from "@chakra-ui/react";
import { Link } from "react-router-dom";
const Avatar = ({ user, size = "xl", overrideAvatar = null }) => {
  return (
    <ChakraAvatar
      name={user.username}
      src={overrideAvatar || user.avatar}
      size={size}
      as={Link}
      to={`/protected/profile/${user.id}`}
      _hover={{ cursor: "pointer", opacity: "0.8" }}
    />
  );
};

export default Avatar;
