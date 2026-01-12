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
import { useRegister } from "../../hooks/auth";
import { useForm } from "react-hook-form";
import {
  usernameValidate,
  emailValidate,
  passwordValidate,
} from "../../utils/form-validate";

const Register = () => {
  const { register: signup, isLoading } = useRegister();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  async function handleRegister(data) {
    const succeeded = await signup({
      username: data.username,
      email: data.email,
      password: data.password,
      redirectTo: "/protected/dashboard",
    });
    if (succeeded) reset();
  }
  return (
    <Center w="100%" h="100vh">
      <Box w="md" border="2px solid black" borderRadius="lg" p="4" m="0 25px">
        <Heading textAlign="center">Register</Heading>
        <form onSubmit={handleSubmit(handleRegister)}>
          <FormControl isInvalid={errors.username} py="4">
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              placeholder="username"
              {...register("username", usernameValidate)}
            ></Input>
            <FormErrorMessage>
              {errors.username && errors.username.message}
            </FormErrorMessage>
          </FormControl>
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
            loadingText="Signing up.."
          >
            Register
          </Button>
        </form>
        <Text mt="1" textAlign="center">
          Already have an account? {""}
          <Link
            fontWeight="medium"
            textDecor="underline"
            _hover={{ opacity: "0.9" }}
            as={routerLink}
            to="/login"
          >
            Log In
          </Link>
        </Text>
      </Box>
    </Center>
  );
};

export default Register;
