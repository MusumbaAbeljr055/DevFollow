import React from "react";
import Avatar from "../Profile/Avatar";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useUser } from "../../hooks/users";
import { formatDistanceToNow } from "date-fns";
import UsernameButton from "../Profile/UsernameButton";
const Header = ({ post }) => {
  const { userid, date } = post;
  const { user, isLoading } = useUser(userid);
  if (isLoading) return "Loading user...";
  return (
    <Box px="15px" pt="15px">
      <Flex gap="5px">
        <Avatar user={user} size="md" />
        <Flex direction="column" justify="start">
          {" "}
          <UsernameButton user={user} />{" "}
          <Text color="gray.500" fontSize="11px">
            {formatDistanceToNow(date)} ago
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
