import React from "react";
import { useUpdateAvatar } from "../../hooks/users";
import Avatar from "./Avatar";
import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useAuth } from "../../hooks/auth";

const EditProfile = ({ isOpen, onClose }) => {
  const { user, isLoading: authLoading } = useAuth();

  const {
    setFile,
    updateAvatar,
    isLoading: fileLoading,
    fileURL,
  } = useUpdateAvatar(user?.id);

  function handleChange(e) {
    setFile(e.target.files[0]);
  }
  if (authLoading) return "Loading...";
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p="20px">
        <Avatar user={user} overrideAvatar={fileURL} />
        <FormControl py="4">
          <FormLabel htmlFor="picture">Change picture</FormLabel>
          <input type="file" accept="image/*" onChange={handleChange} />
        </FormControl>
        <Button
          loadingText="Uploading"
          w="full"
          colorScheme="teal"
          onClick={updateAvatar}
          isLoading={fileLoading}
        >
          Save
        </Button>
        <ModalCloseButton />
      </ModalContent>
    </Modal>
  );
};

export default EditProfile;
