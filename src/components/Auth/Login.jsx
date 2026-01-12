import React from "react";
import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import { Link as routerLink } from "react-router-dom";
import { Link } from "@chakra-ui/react";
import { useLogin } from "../../hooks/auth";
import { useForm } from "react-hook-form";
import {
  usernameValidate,
  emailValidate,
  passwordValidate,
} from "../../utils/form-validate";

const Login = () => {
  const { login, isLoading } = useLogin();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  async function handleLogin(data) {
    const succeeded = await login({
      email: data.email,
      password: data.password,
      redirectTo: "/protected/dashboard",
    });
    if (succeeded) reset();
  }
  return (
    <Center w="100%" h="100vh">
      <Box w="sm" border="2px solid black" borderRadius="lg" p="4" m="0 35px">
        <Heading textAlign="center">Log in</Heading>
        <form onSubmit={handleSubmit(handleLogin)}>
          <FormControl isInvalid={errors.email} py="4">
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="user@email.com"
              {...register("email", emailValidate)}
            ></Input>
            <FormErrorMessage>
              {errors.email && errors.email.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.password}>
            {" "}
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="password@123"
              {...register("password", passwordValidate)}
            ></Input>
            <FormErrorMessage>
              {errors.password && errors.password.message}
            </FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
            colorScheme="teal"
            size="md"
            w="100%"
            mt="4"
            isLoading={isLoading}
            loadingText="Logging in.."
          >
            Log in
          </Button>
        </form>
        <Text mt="1" textAlign="center">
          Dont have an account? {""}
          <Link
            fontWeight="medium"
            textDecor="underline"
            _hover={{ opacity: "0.9" }}
            as={routerLink}
            to="/register"
          >
            Register
          </Link>
        </Text>
      </Box>
    </Center>
  );
};

export default Login;
