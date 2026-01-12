import React from "react";
import { useShowComments } from "../../hooks/comments";
import { Box } from "@chakra-ui/react";
import Comment from "./Comment";

const CommentsList = ({ post }) => {
  const { id } = post;
  const { comments, isLoading } = useShowComments(id);
  if (isLoading) return "Loading...";

  return (
    <Box p="15px" w="35%" borderRadius="12px" className="box">
      {comments.map((comment, index) => (
        <Comment key={index} comment={comment} />
      ))}
    </Box>
  );
};

export default CommentsList;
