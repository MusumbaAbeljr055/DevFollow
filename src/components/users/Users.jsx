import React from "react";
import User from "./User";
import { SimpleGrid } from "@chakra-ui/react";
import { useUsers } from "../../hooks/users";
const Users = () => {
  const { users, isLoading } = useUsers();
  if (isLoading) return "Loading...";
  return (
    <SimpleGrid
      columns={[2, 3, 5]}
      w="95%"
      spacingY="35px"
      spacing="35px"
      mt="30px"
    >
      {users?.map((user) => (
        <User key={user.id} user={user} />
      ))}
    </SimpleGrid>
  );
};

export default Users;
