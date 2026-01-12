// src/components/chat/ChatSidebar.jsx - FIXED REAL STATUS VERSION
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Avatar,
  Text,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Flex,
  Divider,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SkeletonCircle,
  SkeletonText
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/auth';
import { useUsers } from '../../hooks/users';
import { useChat } from '../../hooks/chat.jsx';
import { 
  FiSearch, 
  FiBell, 
  FiSettings,
  FiMessageSquare
} from 'react-icons/fi';

const ChatSidebar = ({ onSelectUser, activeChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notificationCount, setNotificationCount] = useState(0);
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { users = [], isLoading: usersLoading } = useUsers();
  const { getUnreadCount, chats, listenToAllChats } = useChat();
  
  // Listen to all chats for real-time updates
  useEffect(() => {
    if (currentUser && listenToAllChats) {
      try {
        const unsubscribe = listenToAllChats();
        return () => {
          unsubscribe && unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up chat listener:', error);
      }
    }
  }, [currentUser, listenToAllChats]);

  // Update unread counts whenever chats change
  useEffect(() => {
    if (Array.isArray(users) && currentUser && getUnreadCount) {
      try {
        let totalUnread = 0;
        const counts = {};
        
        // FILTER OUT UNDEFINED USERS FIRST
        const validUsers = users.filter(user => user && user.id);
        
        validUsers.forEach(user => {
          if (user.id !== currentUser.id) {
            const count = getUnreadCount(user.id) || 0;
            counts[user.id] = count;
            totalUnread += count;
          }
        });
        
        setUnreadCounts(counts);
        setNotificationCount(totalUnread);
      } catch (error) {
        console.error('Error updating unread counts:', error);
      }
    }
  }, [users, currentUser, chats, getUnreadCount]);

  // Filter out current user from the list - WITH SAFETY CHECKS
  const filteredUsers = React.useMemo(() => {
    if (!Array.isArray(users) || !currentUser?.id) return [];
    
    try {
      return users
        .filter(user => {
          // SAFETY: Check if user exists and has required properties
          if (!user || !user.id) return false;
          if (user.id === currentUser.id) return false;
          
          const username = user.username || '';
          const email = user.email || '';
          const searchLower = (searchTerm || '').toLowerCase();
          
          return (
            username.toLowerCase().includes(searchLower) ||
            email.toLowerCase().includes(searchLower)
          );
        });
    } catch (error) {
      console.error('Error filtering users:', error);
      return [];
    }
  }, [users, currentUser, searchTerm]);

  const handleUserSelect = (selectedUser) => {
    if (!selectedUser || !selectedUser.id || !onSelectUser) {
      console.error('Invalid user selected:', selectedUser);
      return;
    }
    
    console.log('ChatSidebar: User selected:', selectedUser);
    console.log('ChatSidebar: User date field:', selectedUser.date);
    
    if (onSelectUser) {
      onSelectUser({
        id: selectedUser.id,
        name: selectedUser.username || selectedUser.email || 'User',
        status: getStatus(selectedUser),
        avatar: selectedUser.avatar || null,
        email: selectedUser.email,
        username: selectedUser.username
      });
    }
  };

  // REAL STATUS CHECK - Based on user.date field
  const getStatus = (user) => {
    if (!user || !user.id) return 'offline';
    
    // If it's the current user, always show as online
    if (currentUser && user.id === currentUser.id) {
      return 'online';
    }
    
    // Check if user has a date field
    if (user.date) {
      try {
        console.log(`Checking status for ${user.username}: date = ${user.date}`);
        const userDate = new Date(user.date);
        const now = new Date();
        const diffMinutes = Math.floor((now - userDate) / (1000 * 60));
        
        console.log(`Time difference for ${user.username}: ${diffMinutes} minutes`);
        
        if (diffMinutes < 5) {
          console.log(`${user.username} is ONLINE (${diffMinutes} minutes ago)`);
          return 'online';
        }
        if (diffMinutes < 30) {
          console.log(`${user.username} is AWAY (${diffMinutes} minutes ago)`);
          return 'away';
        }
        console.log(`${user.username} is OFFLINE (${diffMinutes} minutes ago)`);
        return 'offline';
      } catch (error) {
        console.error(`Error checking status for ${user.username}:`, error);
        return 'offline';
      }
    }
    
    // If no date field, user is offline
    console.log(`${user.username} has NO DATE FIELD - showing as offline`);
    return 'offline';
  };

  const getLastSeen = (user) => {
    if (!user || !user.id) return 'offline';
    
    // If it's the current user
    if (currentUser && user.id === currentUser.id) {
      return 'online now';
    }
    
    // If user has date field
    if (user.date) {
      try {
        const userDate = new Date(user.date);
        const now = new Date();
        const diffMs = now - userDate;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return userDate.toLocaleDateString();
      } catch {
        return 'long time ago';
      }
    }
    
    // If no date field
    return 'offline';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'green.500';
      case 'away': return 'yellow.500';
      case 'offline': return 'gray.400';
      default: return 'gray.400';
    }
  };

  // Calculate actual online users based on date field
  const onlineUsersCount = React.useMemo(() => {
    return filteredUsers.filter(user => {
      const status = getStatus(user);
      console.log(`${user.username}: status = ${status}`);
      return status === 'online';
    }).length;
  }, [filteredUsers]);

  // DEBUG: Log all users and their dates
  useEffect(() => {
    if (Array.isArray(users) && users.length > 0) {
      console.log('=== ALL USERS DEBUG ===');
      users.forEach(user => {
        if (user && user.id) {
          console.log(`User: ${user.username || user.email}`);
          console.log(`  ID: ${user.id}`);
          console.log(`  Date field: ${user.date}`);
          console.log(`  Date type: ${typeof user.date}`);
          if (user.date) {
            try {
              const dateObj = new Date(user.date);
              console.log(`  Parsed date: ${dateObj.toString()}`);
              console.log(`  Is valid date: ${!isNaN(dateObj.getTime())}`);
            } catch (e) {
              console.log(`  Error parsing date: ${e.message}`);
            }
          }
          console.log(`---`);
        }
      });
    }
  }, [users]);

  if (usersLoading || authLoading) {
    return (
      <Box 
        width="100%"
        bg="white" 
        borderRadius="lg" 
        boxShadow="lg" 
        p={4}
        mb={4}
      >
        <VStack align="stretch" spacing={4}>
          <SkeletonText noOfLines={1} width="100px" />
          <Divider />
          {[1, 2, 3].map((i) => (
            <Flex key={i} align="center" p={2}>
              <SkeletonCircle size="10" />
              <Box ml={3} flex="1">
                <SkeletonText noOfLines={2} />
              </Box>
            </Flex>
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box 
      width="100%"
      bg="white" 
      borderRadius="lg" 
      boxShadow="lg" 
      p={4}
      mb={4}
    >
      <VStack align="stretch" spacing={4}>
        <Flex justify="space-between" align="center">
          <Heading size="md" color="purple.600">
            <FiMessageSquare style={{ display: 'inline', marginRight: '8px' }} />
            Chat
          </Heading>
          <Flex>
            <Tooltip label="Notifications">
              <Box position="relative">
                <IconButton
                  icon={<FiBell />}
                  size="sm"
                  variant="ghost"
                  aria-label="Notifications"
                  mr={2}
                />
                {notificationCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-2px"
                    right="0"
                    colorScheme="red"
                    borderRadius="full"
                    fontSize="10px"
                    minW="5"
                    height="5"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    px={1}
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Box>
            </Tooltip>
            <Menu>
              <Tooltip label="Chat Settings">
                <MenuButton
                  as={IconButton}
                  icon={<FiSettings />}
                  size="sm"
                  variant="ghost"
                  aria-label="Chat Settings"
                />
              </Tooltip>
              <MenuList>
                <MenuItem>Mute all</MenuItem>
                <MenuItem>Mark all as read</MenuItem>
                <MenuItem>Chat settings</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius="full"
            focusBorderColor="purple.400"
          />
        </InputGroup>

        <Divider />

        <Text fontSize="sm" fontWeight="bold" color="gray.600">
          Online Now ({onlineUsersCount})
        </Text>

        <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((chatUser) => {
              // SAFETY CHECK: Skip if chatUser is undefined
              if (!chatUser || !chatUser.id) return null;
              
              const status = getStatus(chatUser);
              const lastSeen = getLastSeen(chatUser);
              const unreadCount = unreadCounts[chatUser.id] || 0;
              
              return (
                <Flex
                  key={chatUser.id}
                  p={2}
                  borderRadius="md"
                  align="center"
                  cursor="pointer"
                  bg={activeChat === chatUser.id ? 'purple.50' : 'transparent'}
                  border={activeChat === chatUser.id ? '1px solid' : 'none'}
                  borderColor={activeChat === chatUser.id ? 'purple.200' : 'transparent'}
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleUserSelect(chatUser)}
                  transition="all 0.2s"
                >
                  <Box position="relative">
                    <Avatar
                      size="sm"
                      name={chatUser.username || chatUser.email || 'User'}
                      src={chatUser.avatar}
                      bg="purple.500"
                      color="white"
                    />
                    <Box
                      position="absolute"
                      bottom="0"
                      right="0"
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      bg={getStatusColor(status)}
                      border="2px solid white"
                    />
                    {unreadCount > 0 && (
                      <Box
                        position="absolute"
                        top="-2px"
                        right="-2px"
                        w="18px"
                        h="18px"
                        borderRadius="full"
                        bg="red.500"
                        border="2px solid white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="10px" color="white" fontWeight="bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                      </Box>
                    )}
                  </Box>
                  
                  <Box ml={3} flex="1" overflow="hidden">
                    <Flex align="center">
                      <Text 
                        fontWeight="medium" 
                        fontSize="sm"
                        noOfLines={1}
                        flex="1"
                      >
                        {chatUser.username || chatUser.email || 'User'}
                      </Text>
                      {unreadCount > 0 && (
                        <Badge 
                          colorScheme="red" 
                          borderRadius="full" 
                          fontSize="10px"
                          ml={2}
                          minW="5"
                          height="5"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Flex>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {lastSeen}
                    </Text>
                  </Box>
                </Flex>
              );
            })
          ) : (
            <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
              {searchTerm ? 'No users found' : 'No other users available'}
            </Text>
          )}
        </VStack>

        <Divider />

        <Flex justify="space-between" align="center">
          <Text fontSize="sm" fontWeight="bold" color="gray.600">
            Your Status
          </Text>
          <Badge colorScheme="green" fontSize="xs">
            Online
          </Badge>
        </Flex>

        {currentUser && (
          <Flex align="center" p={2} bg="gray.50" borderRadius="md">
            <Avatar
              size="sm"
              name={currentUser.username || currentUser.email || 'You'}
              src={currentUser.avatar}
              mr={3}
            />
            <Box>
              <Text fontSize="sm" fontWeight="bold">
                {currentUser.username || currentUser.email || 'You'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                status
              </Text>
            </Box>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export default ChatSidebar;