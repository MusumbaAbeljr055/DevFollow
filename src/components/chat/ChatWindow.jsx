// src/components/chat/ChatWindow.jsx - UPDATED WITH IMPROVED SCROLLING
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  Text,
  Avatar,
  Button,
  IconButton,
  Flex,
  Badge,
  Input,
  HStack,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Image,
  Progress,
  Alert,
  AlertIcon,
  Tooltip,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from '@chakra-ui/react';
import { CloseIcon, AttachmentIcon } from '@chakra-ui/icons';
import { 
  MdSend, 
  MdMic, 
  MdMicOff,
  MdPlayArrow,
  MdPause,
  MdStop,
  MdVolumeUp
} from 'react-icons/md';
import { FiPaperclip, FiSmile } from 'react-icons/fi';
import { useAuth } from '../../hooks/auth';
import { useChat } from '../../hooks/chat.jsx';
import EmojiPicker from 'emoji-picker-react';

const ChatWindow = ({ selectedUser, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  
  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { user } = useAuth();
  const { chats, sendMessage, listenToChat, markAsRead, sendVoiceMessage, sendAttachment } = useChat();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  // State to track if user is manually scrolling
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Get messages
  const messages = selectedUser && chats && chats[selectedUser.id] 
    ? chats[selectedUser.id].filter(msg => msg && msg.id) 
    : [];

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Check if user is near the bottom (within 100px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // Update state based on scroll position
    if (isNearBottom) {
      setIsUserScrolling(false);
      setShouldScrollToBottom(true);
    } else {
      setIsUserScrolling(true);
      setShouldScrollToBottom(false);
    }
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current && shouldScrollToBottom) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, [shouldScrollToBottom]);

  // Scroll to bottom when new messages arrive AND user is at the bottom
  useEffect(() => {
    if (messages.length > prevMessagesLength) {
      // New message arrived
      if (shouldScrollToBottom) {
        setTimeout(() => scrollToBottom('smooth'), 100);
      }
      setPrevMessagesLength(messages.length);
    }
  }, [messages.length, prevMessagesLength, shouldScrollToBottom, scrollToBottom]);

  // Set up scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      
      // Initial scroll to bottom
      setTimeout(() => scrollToBottom('auto'), 300);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll, scrollToBottom]);

  // Set up chat listener and mark messages as read
  useEffect(() => {
    if (selectedUser && selectedUser.id && user) {
      const unsubscribe = listenToChat(selectedUser.id);
      markAsRead(selectedUser.id);
      
      return () => {
        unsubscribe && unsubscribe();
      };
    }
  }, [selectedUser, listenToChat, markAsRead, user]);

  // Clean up audio resources on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && recording) {
        stopRecording();
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      clearInterval(recordingTimerRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Voice recording functions - WhatsApp-like
  const startRecording = async () => {
    try {
      setError(null);
      
      // Stop any existing recording first
      if (mediaRecorder && recording) {
        stopRecording();
      }
      
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      setAudioStream(stream);
      setRecordingTime(0);
      
      // Create new MediaRecorder
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          console.log('No audio data recorded');
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm' 
        });
        
        // Calculate actual duration
        const duration = Math.round(recordingTime / 1000);
        
        // Convert blob to base64 for Firestore
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          setSending(true);
          
          try {
            // Send voice message with duration
            await sendVoiceMessage(selectedUser.id, base64Audio, duration);
            console.log('Voice message sent successfully');
            // Scroll to bottom after sending
            setShouldScrollToBottom(true);
          } catch (err) {
            console.error('Failed to send voice message:', err);
            setError('Failed to send voice message');
          } finally {
            setSending(false);
          }
        };
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
        clearInterval(recordingTimerRef.current);
      };
      
      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setError('Recording error occurred');
        setRecording(false);
        stream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
        clearInterval(recordingTimerRef.current);
      };
      
      // Start recording
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      
      // Start recording timer
      const startTime = Date.now();
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(Date.now() - startTime);
      }, 100);
      
      // Auto-stop after 2 minutes (max duration like WhatsApp)
      setTimeout(() => {
        if (recording) {
          stopRecording();
        }
      }, 120000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      try {
        mediaRecorder.stop();
        setRecording(false);
        clearInterval(recordingTimerRef.current);
        
        // Stop all tracks
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop());
          setAudioStream(null);
        }
      } catch (err) {
        console.error('Error stopping recording:', err);
      }
    }
  };

  // Audio playback functions
  const playAudio = (audioUrl, audioId, duration) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      clearInterval(progressIntervalRef.current);
    }
    
    // Create new audio element
    audioRef.current = new Audio(audioUrl);
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      setPlayingAudioId(null);
      setAudioProgress(0);
      clearInterval(progressIntervalRef.current);
    });
    
    audioRef.current.addEventListener('loadedmetadata', () => {
      setAudioDuration(audioRef.current.duration || duration || 0);
    });
    
    audioRef.current.addEventListener('error', () => {
      console.error('Error playing audio');
      setIsPlaying(false);
      setPlayingAudioId(null);
      clearInterval(progressIntervalRef.current);
    });
    
    // Start playing
    audioRef.current.play().catch(err => {
      console.error('Error playing audio:', err);
      setIsPlaying(false);
    });
    
    setIsPlaying(true);
    setPlayingAudioId(audioId);
    setAudioDuration(duration || 0);
    
    // Update progress
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setAudioProgress(progress);
      }
    }, 100);
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      clearInterval(progressIntervalRef.current);
    }
  };

  const resumeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('Error resuming audio:', err);
      });
      setIsPlaying(true);
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setAudioProgress(progress);
        }
      }, 100);
    }
  };

  const formatRecordingTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle text message sending - OPTIMIZED
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || !selectedUser || !selectedUser.id || sending) return;
    
    setSending(true);
    setError(null);
    
    // Store values before clearing
    const messageToSend = newMessage.trim();
    const attachmentToSend = attachment;
    const selectedUserId = selectedUser.id;
    
    // Clear input immediately for better UX
    if (!attachmentToSend) {
      setNewMessage('');
    }
    
    try {
      let success = false;
      
      if (attachmentToSend) {
        success = await sendAttachment(selectedUserId, attachmentToSend, (progress) => {
          setUploadProgress(progress);
        });
        
        if (success) {
          setAttachment(null);
          setAttachmentPreview(null);
          setUploadProgress(0);
        }
      } else {
        success = await sendMessage(selectedUserId, messageToSend);
        // No need to clear newMessage here since we already did
      }
      
      if (!success) {
        setError('Failed to send message');
        // Restore message if sending failed (for text messages)
        if (!attachmentToSend) {
          setNewMessage(messageToSend);
        }
      } else {
        // After successful send, ensure we scroll to bottom
        setShouldScrollToBottom(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      // Restore message if error occurred (for text messages)
      if (!attachmentToSend) {
        setNewMessage(messageToSend);
      }
    } finally {
      setSending(false);
    }
  };

  // Handle file attachment
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    e.target.value = '';
    
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large (max 10MB)');
      return;
    }
    
    setAttachment(file);
    setError(null);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  // WhatsApp-like audio message component - IMPROVED
  const AudioMessage = ({ msg, isMe }) => {
    const isPlayingThis = playingAudioId === msg.id && isPlaying;
    const [localDuration, setLocalDuration] = useState(msg.duration || 0);
    const [localProgress, setLocalProgress] = useState(0);
    
    const handlePlayPause = () => {
      if (isPlayingThis) {
        pauseAudio();
      } else if (playingAudioId === msg.id) {
        resumeAudio();
      } else {
        playAudio(msg.content, msg.id, msg.duration || 0);
      }
    };

    // Update local progress when global audio progresses
    useEffect(() => {
      if (playingAudioId === msg.id) {
        setLocalProgress(audioProgress);
      }
    }, [audioProgress, playingAudioId, msg.id]);

    // Set local duration
    useEffect(() => {
      if (msg.duration) {
        setLocalDuration(msg.duration);
      }
    }, [msg.duration]);

    // Format current playback time
    const getCurrentTime = () => {
      if (playingAudioId === msg.id && audioRef.current) {
        return formatDuration(audioRef.current.currentTime || 0);
      }
      return formatDuration(localDuration);
    };

    return (
      <Flex 
        align="center" 
        gap={3} 
        p={3}
        bg={isMe ? 'purple.50' : 'gray.50'} 
        borderRadius="lg" 
        border="1px solid" 
        borderColor={isMe ? 'purple.200' : 'gray.200'}
        maxW="280px"
        minW="200px"
      >
        <IconButton
          icon={isPlayingThis ? <MdPause /> : <MdPlayArrow />}
          size="sm"
          colorScheme={isMe ? 'purple' : 'gray'}
          variant="ghost"
          borderRadius="full"
          onClick={handlePlayPause}
          aria-label={isPlayingThis ? "Pause audio" : "Play audio"}
          fontSize="18px"
        />
        
        <Box flex="1" ml={2}>
          <Slider 
            value={playingAudioId === msg.id ? localProgress : 0} 
            min={0} 
            max={100}
            size="sm"
            isDisabled
            colorScheme={isMe ? 'purple' : 'gray'}
            opacity={playingAudioId === msg.id ? 1 : 0.5}
          >
            <SliderTrack bg={isMe ? 'purple.100' : 'gray.200'}>
              <SliderFilledTrack bg={isMe ? 'purple.500' : 'gray.500'} />
            </SliderTrack>
            <SliderThumb boxSize={3} display="none" />
          </Slider>
          
          <Flex justify="space-between" mt={1}>
            <Text fontSize="xs" color={isMe ? 'purple.600' : 'gray.600'}>
              {getCurrentTime()}
            </Text>
            <Text fontSize="xs" color={isMe ? 'purple.500' : 'gray.500'}>
              {isMe ? 'Voice message' : 'Audio'}
            </Text>
          </Flex>
        </Box>
      </Flex>
    );
  };

  const renderMessageContent = (msg) => {
    if (msg.type === 'voice') {
      return <AudioMessage msg={msg} isMe={msg.senderId === user.id} />;
    } else if (msg.type === 'image') {
      return (
        <Box mt={2}>
          <Image 
            src={msg.content} 
            alt="Attachment" 
            maxW="200px" 
            borderRadius="md" 
            onClick={() => window.open(msg.content, '_blank')}
            cursor="pointer"
          />
          {msg.text && <Text fontSize="sm" mt={2}>{msg.text}</Text>}
        </Box>
      );
    } else if (msg.type === 'file') {
      return (
        <HStack 
          p={2} 
          bg="gray.100" 
          borderRadius="md" 
          cursor="pointer"
          onClick={() => window.open(msg.content, '_blank')}
        >
          <AttachmentIcon />
          <Text fontSize="sm" fontWeight="medium">
            {msg.filename || 'Attachment'}
          </Text>
          <Badge fontSize="xs">
            {msg.filesize ? `${(msg.filesize / 1024).toFixed(1)}KB` : 'File'}
          </Badge>
        </HStack>
      );
    }
    
    // Regular text message
    return <Text fontSize="sm">{msg.text}</Text>;
  };

  if (!selectedUser || !selectedUser.id || !user) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex={9998}
          onClick={onClose}
        />
      )}
      
      {/* Chat Container */}
      <Box
        position="fixed"
        top={isMobile ? "50%" : "20px"}
        left={isMobile ? "50%" : "auto"}
        right={isMobile ? "auto" : "20px"}
        bottom={isMobile ? "auto" : "20px"}
        transform={isMobile ? "translate(-50%, -50%)" : "none"}
        width={isMobile ? "90vw" : "420px"}
        height={isMobile ? "85vh" : "550px"}
        maxWidth={isMobile ? "420px" : "420px"}
        bg="white"
        borderRadius="lg"
        boxShadow="2xl"
        border="1px solid"
        borderColor="gray.200"
        zIndex={9999}
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Flex p={3} bg="purple.600" color="white" borderTopRadius="lg" align="center">
          <Avatar
            size="sm"
            name={selectedUser.name}
            src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=purple&color=white`}
            mr={3}
            bg="white"
            color="purple.600"
          />
          <Box flex="1">
            <Text fontWeight="bold">{selectedUser.name}</Text>
            <Badge fontSize="xx-small">{selectedUser.status || 'online'}</Badge>
          </Box>
          <IconButton
            icon={<CloseIcon />}
            size="sm"
            variant="ghost"
            color="white"
            onClick={onClose}
            aria-label="Close chat"
          />
        </Flex>

        {/* Messages Area - IMPROVED SCROLLING */}
        <Box 
          ref={messagesContainerRef}
          flex="1" 
          p={3} 
          overflowY="auto" 
          bg="gray.50"
          css={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#CBD5E0',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#A0AEC0',
            },
            // Better mobile scrolling
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {messages.length === 0 ? (
            <VStack justify="center" height="100%" color="gray.500">
              <Text>No messages yet. Start the conversation!</Text>
              <Text fontSize="xs">Send your first message to {selectedUser.name}</Text>
            </VStack>
          ) : (
            <VStack align="stretch" spacing={3}>
              {messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <Box
                    key={msg.id}
                    alignSelf={isMe ? 'flex-end' : 'flex-start'}
                    maxWidth="85%"
                  >
                    <Box
                      bg={isMe ? 'purple.500' : 'white'}
                      color={isMe ? 'white' : 'black'}
                      p={3}
                      borderRadius="lg"
                      boxShadow="sm"
                      border={!isMe ? '1px solid' : 'none'}
                      borderColor="gray.200"
                      minWidth="120px"
                    >
                      {renderMessageContent(msg)}
                      <Text fontSize="xs" opacity={0.7} mt={1} textAlign="right">
                        {formatTime(msg.timestamp)}
                        {isMe && ' • '}
                        {isMe && (msg.read ? '✓✓' : '✓')}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </VStack>
          )}
        </Box>

        {/* Error Display */}
        {error && (
          <Alert status="error" size="sm" borderRadius="md" mx={3} mt={2}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Attachment Preview */}
        {attachmentPreview && (
          <Box p={3} borderTop="1px solid" borderColor="gray.200">
            <Flex align="center" justify="space-between">
              <Image 
                src={attachmentPreview} 
                alt="Preview" 
                maxH="60px" 
                borderRadius="md" 
              />
              <Text fontSize="sm" ml={2} flex="1">
                {attachment.name}
              </Text>
              <IconButton
                icon={<CloseIcon />}
                size="xs"
                onClick={() => {
                  setAttachment(null);
                  setAttachmentPreview(null);
                }}
                aria-label="Remove attachment"
              />
            </Flex>
          </Box>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Box p={2} px={3}>
            <Progress value={uploadProgress} size="xs" colorScheme="purple" />
            <Text fontSize="xs" textAlign="center" mt={1}>
              Uploading... {uploadProgress}%
            </Text>
          </Box>
        )}

        {/* Input Area - WhatsApp-like */}
        <Box p={3} borderTop="1px solid" borderColor="gray.200">
          {/* Recording Indicator - WhatsApp Style */}
          {recording && (
            <Flex 
              mb={2} 
              p={2} 
              bg="red.50" 
              borderRadius="md" 
              align="center" 
              justify="space-between"
              border="1px solid"
              borderColor="red.200"
            >
              <HStack>
                <Box 
                  w="12px" 
                  h="12px" 
                  bg="red.500" 
                  borderRadius="full" 
                  style={{ 
                    animation: 'pulse 0.8s infinite'
                  }} 
                />
                <Text fontSize="sm" color="red.600" fontWeight="bold">
                  {formatRecordingTime(recordingTime)}
                </Text>
              </HStack>
              
              <Flex gap={2}>
                <IconButton
                  icon={<CloseIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => {
                    stopRecording();
                    setRecording(false);
                  }}
                  aria-label="Cancel recording"
                />
                <Button
                  size="sm"
                  colorScheme="purple"
                  borderRadius="full"
                  onClick={stopRecording}
                  aria-label="Send recording"
                >
                  Send
                </Button>
              </Flex>
            </Flex>
          )}

          {/* Input Field and Buttons */}
          <Flex align="center" gap={2}>
            {/* Emoji Button */}
            <Popover
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
              placement="top-start"
            >
              <PopoverTrigger>
                <IconButton
                  icon={<FiSmile />}
                  size="sm"
                  variant="ghost"
                  color="gray.600"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  aria-label="Add emoji"
                  isDisabled={sending || recording}
                />
              </PopoverTrigger>
              <PopoverContent width="auto">
                <PopoverBody p={0}>
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    width={300}
                    height={350}
                  />
                </PopoverBody>
              </PopoverContent>
            </Popover>

            {/* Text Input */}
            <InputGroup size="md" flex="1">
              <InputLeftElement width="auto">
                <IconButton
                  icon={<FiPaperclip />}
                  size="sm"
                  variant="ghost"
                  color="gray.600"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach file"
                  isDisabled={sending || recording}
                />
              </InputLeftElement>
              
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                size="md"
                pl="40px"
                pr="40px"
                borderRadius="full"
                bg="white"
                border="1px solid"
                borderColor="gray.300"
                _focus={{
                  borderColor: "purple.400",
                  boxShadow: "0 0 0 1px purple.400"
                }}
                isDisabled={sending || recording}
              />
            </InputGroup>

            {/* Mic/Send Button - Now outside the input field */}
            {newMessage.trim() || attachment ? (
              <IconButton
                icon={<MdSend />}
                size="md"
                colorScheme="purple"
                borderRadius="full"
                onClick={handleSendMessage}
                isLoading={sending}
                aria-label="Send message"
                isDisabled={sending || recording}
              />
            ) : (
              <IconButton
                icon={recording ? <MdStop /> : <MdMic />}
                size="md"
                variant="ghost"
                colorScheme={recording ? "red" : "gray"}
                borderRadius="full"
                onMouseDown={startRecording}
                onTouchStart={startRecording}
                onMouseUp={stopRecording}
                onTouchEnd={stopRecording}
                aria-label={recording ? "Stop recording" : "Hold to record"}
                isDisabled={sending}
              />
            )}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </Flex>

          {/* Helper Text */}
          <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
            Press <Text as="span" fontWeight="bold">Enter</Text> to send •{' '}
            <Text as="span" fontWeight="bold">Hold mic icon</Text> to record voice message
          </Text>
        </Box>
      </Box>
    </>
  );
};

export default ChatWindow;