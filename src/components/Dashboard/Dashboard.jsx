// src/components/dashboard/Dashboard.jsx - FIXED CLEARING ISSUE
import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  Heading, 
  Textarea, 
  Text,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Badge,
  Portal,
  Avatar,
  Image,
  Progress,
  Alert,
  AlertIcon,
  VStack,
  useToast
} from "@chakra-ui/react";
import { ChatIcon, BellIcon, AttachmentIcon, CloseIcon } from '@chakra-ui/icons';
import { FaImage, FaVideo, FaFile } from 'react-icons/fa';
import { useForm } from "react-hook-form";
import { useAddPost, useShowPosts } from "../../hooks/posts";
import { useAuth } from "../../hooks/auth";
import { useChat } from "../../hooks/chat.jsx";
import PostsList from "../post/PostsList";
import NewsSidebar from "./NewsSidebar";
import ChatSidebar from "../chat/ChatSidebar";
import ChatWindow from "../chat/ChatWindow";
import "/src/App.css";

const Dashboard = () => {
  const { register, reset, handleSubmit } = useForm();
  const { addPost, isLoading: addingPostLoading } = useAddPost();
  const { user, isLoading: authLoading } = useAuth();
  const { posts, isLoading } = useShowPosts();
  const { getTotalUnreadCount } = useChat();
  const toast = useToast();
  
  // Local state for attachments
  const [attachments, setAttachments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // Local state for chat
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  
  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure();
  const { isOpen: isNewsOpen, onOpen: onNewsOpen, onClose: onNewsClose } = useDisclosure();

  // Get total unread messages for badge
  const totalUnreadCount = getTotalUnreadCount ? getTotalUnreadCount() : 0;

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    e.target.value = '';
    setError(null);
    
    // Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 50 * 1024 * 1024; // 50MB total
    
    if (totalSize > maxTotalSize) {
      setError('Total file size too large (max 50MB)');
      return;
    }
    
    files.forEach((file) => {
      // Check individual file size
      if (file.size > 20 * 1024 * 1024) {
        setError(`File "${file.name}" is too large (max 20MB)`);
        return;
      }
      
      const attachmentId = Date.now() + Math.random();
      
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const attachment = {
            file,
            preview: e.target.result,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name,
            size: file.size,
            id: attachmentId
          };
          setAttachments(prev => [...prev, attachment]);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image/video files
        const attachment = {
          file,
          type: 'file',
          name: file.name,
          size: file.size,
          id: attachmentId
        };
        setAttachments(prev => [...prev, attachment]);
      }
    });
  };

  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
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

  // Clear form completely
  const clearForm = () => {
    console.log('Clearing form...');
    console.log('Before clear - attachments:', attachments.length);
    
    // Clear react-hook-form
    reset();
    
    // Clear local state
    setAttachments([]);
    setUploadProgress(0);
    setError(null);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    console.log('After clear - attachments should be 0');
  };

  async function handleAddPost(data) {
    console.log('handleAddPost called with text:', data.text);
    console.log('Attachments count before posting:', attachments.length);
    
    if ((!data.text?.trim() && attachments.length === 0) || !user?.id) {
      setError('Please add text or attachment');
      return;
    }
    
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Create form data for file uploads
      const formData = new FormData();
      formData.append('text', data.text?.trim() || '');
      formData.append('userid', user.id);
      
      // Add attachments if any
      if (attachments.length > 0) {
        attachments.forEach((attachment, index) => {
          formData.append(`attachments`, attachment.file);
          formData.append(`attachmentTypes`, attachment.type);
          formData.append(`attachmentNames`, attachment.name);
        });
      }
      
      console.log('FormData created with', attachments.length, 'attachments');
      
      // IMPORTANT: Store attachments count before clearing
      const attachmentsCountBeforeClear = attachments.length;
      
      // Upload with progress tracking
      const success = await addPost(formData, (progress) => {
        console.log('Upload progress:', progress);
        setUploadProgress(progress);
      });
      
      console.log('Post success:', success);
      console.log('Attachments count after post:', attachments.length);
      
      // ONLY clear form if post was successful
      if (success !== false) {
        clearForm();
        
        toast({
          title: "Post created!",
          description: "Your post has been published.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
      
    } catch (error) {
      console.error('Error adding post:', error);
      console.error('Error details:', error.message, error.stack);
      
      // DON'T clear form on error
      setError('Failed to add post: ' + error.message);
      
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      console.log('Final attachments count:', attachments.length);
    }
  }

  const handleSelectUser = (user) => {
    setSelectedChatUser(user);
    onChatClose(); // Close the drawer
  };

  const handleCloseChat = () => {
    setSelectedChatUser(null);
  };

  if (isLoading) return "Loading Posts...";
  
  return (
    <Box position="relative" minHeight="100vh">
      {/* Mobile Header Buttons */}
      <Flex 
        display={{ base: 'flex', lg: 'none' }}
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={100}
        gap={2}
      >
        <Box position="relative">
          <IconButton
            icon={<ChatIcon />}
            colorScheme="purple"
            isRound
            size="lg"
            onClick={onChatOpen}
            aria-label="Open chat"
            position="relative"
          />
          {/* Chat Badge - Shows unread message count */}
          {totalUnreadCount > 0 && (
            <Badge
              position="absolute"
              top="-8px"
              right="-8px"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              minWidth="22px"
              height="22px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={101}
            >
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </Badge>
          )}
        </Box>
        <IconButton
          icon={<BellIcon />}
          colorScheme="blue"
          isRound
          size="lg"
          onClick={onNewsOpen}
          aria-label="Open news"
        />
      </Flex>

      <Box 
        maxWidth="1200px" 
        mx="auto" 
        px={4}
        display="flex"
        gap={8}
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        {/* Main Content */}
        <Box flex="1" minWidth="0" my="30px">
          <Box className="box" maxWidth="800px" mx="auto">
            {/* Error Display */}
            {error && (
              <Alert status="error" size="sm" borderRadius="md" mb={3}>
                <AlertIcon />
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit(handleAddPost)}>
              <Flex justifyContent="space-between" align="end">
                <Heading pb="25px" size="lg">New Post</Heading>
                <Button
                  mb="5px"
                  variant="outline"
                  color="blue.600"
                  size="sm"
                  borderColor="blue.600"
                  type="submit"
                  isLoading={authLoading || addingPostLoading || uploading}
                  loadingText="Posting..."
                  style={{ lineHeight: "normal" }}
                >
                  Add Post
                </Button>
              </Flex>
              
              <Textarea
                borderRadius="12px"
                resize="none"
                placeholder="What's on your mind today as a developer?"
                {...register("text", { required: false })}
                minHeight="120px"
                fontSize="md"
                mb={3}
                isDisabled={uploading}
              />
              
              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <Box mb={3} p={3} border="1px dashed" borderColor="gray.300" borderRadius="md">
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Attachments ({attachments.length})
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {attachments.map((attachment) => (
                      <Flex 
                        key={attachment.id}
                        align="center"
                        justify="space-between"
                        p={2}
                        bg="gray.50"
                        borderRadius="md"
                      >
                        <Flex align="center" gap={3}>
                          {attachment.preview && attachment.type === 'image' ? (
                            <Image 
                              src={attachment.preview} 
                              alt="Preview" 
                              boxSize="40px"
                              objectFit="cover"
                              borderRadius="md"
                            />
                          ) : (
                            <Box fontSize="20px" color="gray.500">
                              {getFileIcon(attachment.type)}
                            </Box>
                          )}
                          <Box>
                            <Text fontSize="sm" fontWeight="medium">
                              {attachment.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {formatFileSize(attachment.size)} • {attachment.type}
                            </Text>
                          </Box>
                        </Flex>
                        <IconButton
                          icon={<CloseIcon />}
                          size="xs"
                          variant="ghost"
                          onClick={() => removeAttachment(attachment.id)}
                          aria-label="Remove attachment"
                          isDisabled={uploading}
                        />
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}
              
              {/* Upload Progress */}
              {uploading && uploadProgress > 0 && (
                <Box mb={3}>
                  <Progress value={uploadProgress} size="sm" colorScheme="blue" />
                  <Text fontSize="xs" textAlign="center" mt={1}>
                    {uploadProgress < 100 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Processing...'}
                  </Text>
                </Box>
              )}
              
              {/* Attachment Button */}
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.500">
                  {attachments.length > 0 ? `${attachments.length} file(s) selected` : 'Add images, videos, or files'}
                </Text>
                <IconButton
                  icon={<AttachmentIcon />}
                  size="sm"
                  variant="ghost"
                  color="gray.600"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add attachment"
                  isDisabled={uploading}
                />
              </Flex>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
                multiple
              />
            </form>
            
            <Box mt={8}>
              <PostsList posts={posts} />
            </Box>
          </Box>
        </Box>

        {/* Sidebars - Desktop */}
        <Box 
          display={{ base: 'none', lg: 'block' }}
          width="320px"
          flexShrink={0}
          position="sticky"
          top="100px"
          alignSelf="flex-start"
          maxHeight="calc(100vh - 120px)"
          overflowY="auto"
          pr={2}
        >
          <ChatSidebar onSelectUser={handleSelectUser} />
          <Box mt={4}>
            <NewsSidebar />
          </Box>
        </Box>
      </Box>

      {/* Mobile Chat Drawer */}
      <Drawer
        isOpen={isChatOpen}
        placement="right"
        onClose={onChatClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Chat</DrawerHeader>
          <DrawerBody>
            <ChatSidebar onSelectUser={handleSelectUser} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Mobile News Drawer */}
      <Drawer
        isOpen={isNewsOpen}
        placement="right"
        onClose={onNewsClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Tech News</DrawerHeader>
          <DrawerBody>
            <NewsSidebar />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Chat Window - USING PORTAL for proper positioning */}
      {selectedChatUser && (
        <Portal>
          <ChatWindow 
            selectedUser={selectedChatUser} 
            onClose={handleCloseChat}
          />
        </Portal>
      )}

      {/* DEVELOPED BY MUSUMBA WITH PICTURE */}
      <Box 
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        py={3}
        bg="gray.50"
        borderTop="1px solid"
        borderColor="gray.200"
        textAlign="center"
      >
        <Flex justify="center" align="center" gap={2}>
          <Avatar 
            size="xs"
            name="Ssenkubuge Abbey Musumba"
            src="/abbey.jpeg"
            bg="purple.500"
            color="white"
          />
          <Text fontSize="sm" color="gray.600" fontStyle="italic">
            Developed by Ssenkubuge Abbey Musumba
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default Dashboard;