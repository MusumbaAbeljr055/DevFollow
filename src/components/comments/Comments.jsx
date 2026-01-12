import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Post from "../post/Post";
import { usePost } from "../../hooks/posts";
import NewComment from "./NewComment";
import CommentsList from "./CommentsList";
import { Box, Heading } from "@chakra-ui/react";
const Comments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { post, isLoading } = usePost(id);
  if (isLoading) return "Loading...";
  console.log(post);
  return (
    <Box pt="30px">
      {post ? (
        <>
          <Post post={post} />
          <NewComment post={post} />
          <Heading m="35px 0 5px 0">Comments</Heading>
          <CommentsList post={post} />
        </>
      ) : (
        navigate("/protected/dashboard")
      )}
    </Box>
  );
};

export default Comments;
