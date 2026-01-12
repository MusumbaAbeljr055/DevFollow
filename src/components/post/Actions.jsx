import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import {
  FaRegHeart,
  FaHeart,
  FaComment,
  FaRegComment,
  FaTrash,
} from "react-icons/fa";
import { useAuth } from "../../hooks/auth";
import { Link } from "react-router-dom";
import { useToggleLike, useDeletePost } from "../../hooks/posts";
import React from "react";
import { useShowComments } from "../../hooks/comments";

const Actions = ({ post }) => {
  const { likes, id, userid } = post;
  const { user, isLoading: userLoading } = useAuth();
  const isLiked = post.likes.includes(user?.id);
  const { toggleLike, isLoading: likeLoading } = useToggleLike({
    id,
    isLiked,
    uid: user?.id,
  });
  const { deletePost, isLoading: deleteLoading } = useDeletePost(id);
  const { comments, isLoading: commentsLoading } = useShowComments(id);
  return (
    <Box>
      <Flex justify="space-between">
        <Flex gap="5px">
          <Flex align="center">
            <IconButton
              colorScheme="red"
              variant="ghost"
              isRound
              icon={isLiked ? <FaHeart /> : <FaRegHeart />}
              isLoading={likeLoading || userLoading}
              onClick={toggleLike}
              _loading={{
                cursor: "none",
              }}
            />
            <Text fontWeight="600">{likes.length}</Text>
          </Flex>
          <Flex align="center">
            <IconButton
              colorScheme="teal"
              variant="ghost"
              isRound
              icon={comments?.length === 0 ? <FaRegComment /> : <FaComment />}
              isLoading={likeLoading || userLoading}
              as={Link}
              to={`/protected/comments/${id}`}
              _loading={{
                cursor: "none",
              }}
            />
            <Text fontWeight="600">{comments?.length}</Text>
          </Flex>
        </Flex>
        {!userLoading && user.id === userid && (
          <IconButton
            colorScheme="red"
            variant="ghost"
            isRound
            icon={<FaTrash />}
            isLoading={deleteLoading}
            onClick={deletePost}
            _loading={{
              cursor: "none",
            }}
          />
        )}
      </Flex>
    </Box>
  );
};

export default Actions;
