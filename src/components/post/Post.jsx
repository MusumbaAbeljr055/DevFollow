// src/components/post/Post.jsx - HIDE "Attachments (1)" LABEL
import { Box, Text, Link, Image, Flex, Badge, IconButton, VStack, HStack } from "@chakra-ui/react";
import React from "react";
import Header from "./Header";
import Actions from "./Actions";
import { ExternalLinkIcon, AttachmentIcon } from '@chakra-ui/icons';
import { FaImage, FaVideo, FaFile, FaPlay } from 'react-icons/fa';

const Post = ({ post }) => {
  // Function to make URLs clickable WITHOUT duplication
  const renderClickableLinks = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    
    if (!urls || urls.length === 0) {
      return text;
    }
    
    const result = [];
    let lastIndex = 0;
    
    urls.forEach((url, index) => {
      const urlIndex = text.indexOf(url, lastIndex);
      
      if (urlIndex > lastIndex) {
        result.push(text.substring(lastIndex, urlIndex));
      }
      
      result.push(
        <Link
          key={`link-${index}`}
          href={url}
          color="blue.500"
          isExternal
          fontWeight="medium"
          textDecoration="underline"
          _hover={{ color: "blue.600", textDecoration: "none" }}
          display="inline"
          wordBreak="break-all"
          mr={1}
        >
          {url}
          <ExternalLinkIcon ml={1} boxSize={3} />
        </Link>
      );
      
      lastIndex = urlIndex + url.length;
    });
    
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }
    
    return result;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    switch(type) {
      case 'image': return <FaImage />;
      case 'video': return <FaVideo />;
      case 'audio': return <FaFile />;
      default: return <FaFile />;
    }
  };

  // Render attachments - SHOW ATTACHMENTS BUT WITHOUT "Attachments (1)" LABEL
  const renderAttachments = () => {
    if (!post.attachments || post.attachments.length === 0) return null;
    
    return (
      <Box mt={3}>
        {/* REMOVED: The "Attachments (X)" header */}
        {/* <Flex align="center" gap={2} mb={2}>
          <AttachmentIcon color="gray.500" />
          <Text fontSize="sm" fontWeight="medium" color="gray.600">
            Attachments ({post.attachments.length})
          </Text>
        </Flex> */}
        
        <VStack align="stretch" spacing={3}>
          {post.attachments.map((attachment, index) => (
            <Box key={index} border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
              {attachment.type === 'image' ? (
                <Box position="relative">
                  <Image 
                    src={attachment.url} 
                    alt={attachment.name}
                    width="100%"
                    maxHeight="400px"
                    objectFit="contain"
                    backgroundColor="gray.50"
                    cursor="pointer"
                    onClick={() => window.open(attachment.url, '_blank')}
                  />
                </Box>
              ) : attachment.type === 'video' ? (
                <Box position="relative">
                  <video 
                    src={attachment.url}
                    controls
                    style={{ width: '100%', maxHeight: '400px' }}
                  />
                  <Box 
                    position="absolute"
                    top="10px"
                    left="10px"
                    bg="rgba(0,0,0,0.7)"
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                  >
                    <Flex align="center" gap={1}>
                      <FaPlay /> Video
                    </Flex>
                  </Box>
                </Box>
              ) : (
                <Flex 
                  align="center" 
                  justify="space-between"
                  p={3}
                  bg="gray.50"
                  cursor="pointer"
                  onClick={() => window.open(attachment.url, '_blank')}
                  _hover={{ bg: "gray.100" }}
                >
                  <Flex align="center" gap={3}>
                    <Box fontSize="20px" color="gray.500">
                      {getFileIcon(attachment.type)}
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">
                        {attachment.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatFileSize(attachment.size)} • {attachment.type}
                      </Text>
                    </Box>
                  </Flex>
                  <ExternalLinkIcon color="gray.400" />
                </Flex>
              )}
            </Box>
          ))}
        </VStack>
      </Box>
    );
  };

  return (
    <Box
      w="100%"
      maxW="600px"
      className="box"
      p="4"
      bg="white"
      borderRadius="12px"
      mb="15px"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      transition="transform 0.3s ease"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
    >
      <Header post={post} />
      
      {/* POST TEXT */}
      {post.text && (
        <Text p="15px" fontSize="md" color="gray.800" lineHeight="1.6" whiteSpace="pre-wrap">
          {renderClickableLinks(post.text)}
        </Text>
      )}
      
      {/* ATTACHMENTS - Now without the "Attachments (1)" label */}
      {renderAttachments()}
      
      <Actions post={post} />
    </Box>
  );
};

export default Post;