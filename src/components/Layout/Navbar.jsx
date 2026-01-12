import React from "react";
import "/src/App.css";
import { LuUsers } from "react-icons/lu";
import { GoHome } from "react-icons/go";
import { AiOutlineLogout } from "react-icons/ai";
import Avatar from "../Profile/Avatar";
import { useAuth } from "../../hooks/auth";
import { Button, Flex, Box } from "@chakra-ui/react";
import { Link as routerLink } from "react-router-dom";
import { useLogout } from "../../hooks/auth";
const Navbar = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { logout, isLoading } = useLogout();
  return (
    <Flex
      bg="black"
      w="full"
      height="80px"
      justify="center"
      align="center"
      mx={0}
    >
      <Flex
        justify="space-between"
        alignItems="center"
        w="35%"
        h="75%"
        px="25px"
        borderRadius="55px"
        bg="rgba(48, 48, 48)"
        className="navFlex"
      >
        <Flex gap="17px">
          <Button
            className="navBtn"
            as={routerLink}
            w="45px"
            h="45px"
            _hover={{ opacity: "0.9" }}
            to="/protected/dashboard"
            textDecor="none"
            borderRadius="50%"
          >
            <Box
              fontSize="20px"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <GoHome />
            </Box>
          </Button>
          <Button
            className="navBtn"
            w="45px"
            h="45px"
            borderRadius="50%"
            as={routerLink}
            to={"/protected/users"}
          >
            <Box
              fontSize="20px"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <LuUsers />
            </Box>
          </Button>
          {!authLoading && (
            <Box
              className="navBox"
              w="45px"
              h="45px"
              borderRadius="50%"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              {" "}
              <Avatar user={user} size="md" />
            </Box>
          )}
        </Flex>
        <Button
          className="navBtn"
          w="45px"
          h="45px"
          onClick={logout}
          isLoading={isLoading}
          borderRadius="50%"
        >
          <Box
            fontSize="20px"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <AiOutlineLogout />
          </Box>
        </Button>
      </Flex>
    </Flex>
  );
};

export default Navbar;
