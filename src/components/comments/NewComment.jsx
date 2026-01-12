import { Box, Button, Flex, Input } from "@chakra-ui/react";
import React from "react";
import Avatar from "../Profile/Avatar";
import { useAddComment } from "../../hooks/comments";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/auth";
import "/src/App.css";
const NewComment = ({ post }) => {
  const { id: postId } = post;
  const { user, isLoading: authLoading } = useAuth();
  const { register, handleSubmit, reset } = useForm();
  const { addComment, isLoading: CommentLoading } = useAddComment({
    uid: user?.id,
    postId,
  });
  function handleAddComment(data) {
    addComment(data.text);
    reset();
  }
  if (authLoading) return "Loading...";
  return (
    <Flex align="center" gap="5px" className="flex">
      <Avatar user={user} size="sm" />
      <form
        onSubmit={handleSubmit(handleAddComment)}
        className="newCommentForm"
      >
        <Flex align="center">
          <Input
            type="text"
            placeholder="Write Comment"
            fontSize="14px"
            variant="flushed"
            autoComplete="off"
            {...register("text", { required: true })}
          />
          <Button
            variant="outline"
            color="blue.600"
            size="sm"
            p="0px 25px"
            fontSize="13px"
            borderWidth="1px"
            borderColor="blue.600"
            type="submit"
            isLoading={CommentLoading || authLoading}
          >
            Add Comment
          </Button>
        </Flex>
      </form>
    </Flex>
  );
};

export default NewComment;
