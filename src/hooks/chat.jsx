// src/hooks/chat.jsx - FIXED VERSION
import { useState, useEffect, useContext, createContext, useRef } from 'react';
import { db, storage } from '../lib/Firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  where,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  limit
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { useAuth } from './auth';

// Create the context
const ChatContext = createContext();

// Export the hook
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

// Export the provider component
export function ChatProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth();
  const [chats, setChats] = useState({});
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);
  
  // Use refs to track listeners and prevent re-renders
  const activeListeners = useRef({});
  const isInitialized = useRef(false);

  // Get chat ID between two users
  const getChatId = (user1Id, user2Id) => {
    return [user1Id, user2Id].sort().join('_');
  };

  // Create or get chat room
  const createChatRoom = async (user1Id, user2Id) => {
    try {
      const chatId = getChatId(user1Id, user2Id);
      const chatRef = doc(db, 'chats', chatId);
      
      // Check if chat room exists
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        // Create new chat room
        await setDoc(chatRef, {
          participants: [user1Id, user2Id],
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageTime: null,
          lastMessageSender: null,
          participantsInfo: {
            [user1Id]: { hasUnread: false },
            [user2Id]: { hasUnread: false }
          }
        });
        console.log('✅ Created new chat room:', chatId);
      }
      
      return chatId;
    } catch (error) {
      console.error('❌ Error creating chat room:', error);
      return null;
    }
  };

  // Send a text message
  const sendMessage = async (receiverId, text) => {
    if (!user || !text.trim()) {
      console.error('❌ Cannot send message: User not logged in or empty text');
      return false;
    }

    console.log('📤 Sending message from', user.id, 'to', receiverId);
    
    try {
      // Create chat room if it doesn't exist
      const chatId = await createChatRoom(user.id, receiverId);
      if (!chatId) {
        console.error('❌ Failed to create chat room');
        return false;
      }
      
      console.log('💬 Using chat ID:', chatId);
      
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const timestamp = serverTimestamp();
      
      // Add the message
      await addDoc(messagesRef, {
        text: text.trim(),
        senderId: user.id,
        receiverId: receiverId,
        timestamp: timestamp,
        read: false,
        type: 'text'
      });
      
      console.log('✅ Message sent successfully');
      
      // Update chat room with last message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: text.trim(),
        lastMessageTime: timestamp,
        lastMessageSender: user.id,
        [`participantsInfo.${receiverId}.hasUnread`]: true,
        [`participantsInfo.${receiverId}.lastChecked`]: null
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  };

  // Send a voice message
  const sendVoiceMessage = async (receiverId, audioBase64, audioDuration = 0) => {
    if (!user || !audioBase64) {
      console.error('❌ Cannot send voice message: User not logged in or no audio');
      return false;
    }

    console.log('🎤 Sending voice message from', user.id, 'to', receiverId);
    
    try {
      // Create chat room if it doesn't exist
      const chatId = await createChatRoom(user.id, receiverId);
      if (!chatId) {
        console.error('❌ Failed to create chat room');
        return false;
      }
      
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const timestamp = serverTimestamp();
      
      // Add the voice message
      await addDoc(messagesRef, {
        content: audioBase64,
        senderId: user.id,
        receiverId: receiverId,
        timestamp: timestamp,
        read: false,
        type: 'voice',
        duration: audioDuration
      });
      
      console.log('✅ Voice message sent successfully');
      
      // Update chat room with last message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: '🎤 Voice message',
        lastMessageTime: timestamp,
        lastMessageSender: user.id,
        [`participantsInfo.${receiverId}.hasUnread`]: true,
        [`participantsInfo.${receiverId}.lastChecked`]: null
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error sending voice message:', error);
      return false;
    }
  };

  // Send an attachment
  const sendAttachment = async (receiverId, file, onProgress) => {
    if (!user || !file) {
      console.error('❌ Cannot send attachment: User not logged in or no file');
      return false;
    }

    console.log('📎 Sending attachment from', user.id, 'to', receiverId);
    
    try {
      // Create chat room if it doesn't exist
      const chatId = await createChatRoom(user.id, receiverId);
      if (!chatId) {
        console.error('❌ Failed to create chat room');
        return false;
      }
      
      // Create a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `attachment_${user.id}_${timestamp}.${fileExtension}`;
      const storagePath = `attachments/${chatId}/${fileName}`;
      
      // Create storage reference
      const storageRef = ref(storage, storagePath);
      
      // Upload file to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Return a promise to handle upload progress
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Track upload progress
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            console.error('❌ Error uploading attachment:', error);
            reject(false);
          },
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Determine message type
              let type = 'file';
              let previewText = '📎 Attachment';
              
              if (file.type.startsWith('image/')) {
                type = 'image';
                previewText = '🖼️ Image';
              } else if (file.type.startsWith('video/')) {
                type = 'video';
                previewText = '🎥 Video';
              } else if (file.type.includes('pdf')) {
                previewText = '📄 PDF';
              }
              
              const messagesRef = collection(db, 'chats', chatId, 'messages');
              const timestamp = serverTimestamp();
              
              // Add the attachment message
              await addDoc(messagesRef, {
                content: downloadURL,
                senderId: user.id,
                receiverId: receiverId,
                timestamp: timestamp,
                read: false,
                type: type,
                filename: file.name,
                filesize: file.size,
                filetype: file.type
              });
              
              console.log('✅ Attachment sent successfully');
              
              // Update chat room with last message
              const chatRef = doc(db, 'chats', chatId);
              await updateDoc(chatRef, {
                lastMessage: previewText,
                lastMessageTime: timestamp,
                lastMessageSender: user.id,
                [`participantsInfo.${receiverId}.hasUnread`]: true,
                [`participantsInfo.${receiverId}.lastChecked`]: null
              });
              
              resolve(true);
            } catch (error) {
              console.error('❌ Error saving attachment to Firestore:', error);
              reject(false);
            }
          }
        );
      });
      
    } catch (error) {
      console.error('❌ Error sending attachment:', error);
      return false;
    }
  };

  // Delete an attachment (optional)
  const deleteAttachment = async (fileUrl) => {
    try {
      if (!fileUrl) return false;
      
      // Extract path from URL
      const urlParts = fileUrl.split('/');
      const encodedPath = urlParts.slice(urlParts.indexOf('o') + 1).join('/');
      const filePath = decodeURIComponent(encodedPath.split('?')[0]);
      
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      console.log('✅ Attachment deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting attachment:', error);
      return false;
    }
  };

  // Listen to messages in a specific chat
  const listenToChat = (receiverId) => {
    if (!user || authLoading) {
      console.log('⏳ User not available for listenToChat');
      return () => {};
    }

    const chatId = getChatId(user.id, receiverId);
    console.log('📡 Setting up listener for chat:', chatId);
    
    // Clean up existing listener for this chat
    if (activeListeners.current[chatId]) {
      console.log('🧹 Cleaning up existing listener for:', chatId);
      activeListeners.current[chatId]();
    }
    
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📨 Real-time update for', receiverId, 'Messages:', snapshot.docs.length);
          
          const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp?.toDate() || new Date()
            };
          });
          
          // Update chats state
          setChats(prev => ({
            ...prev,
            [receiverId]: messages
          }));
          
          // Calculate unread messages from this user
          const unread = messages.filter(
            msg => msg.senderId === receiverId && !msg.read
          ).length;
          
          console.log(`📬 Unread from ${receiverId}: ${unread}`);
          
          // Update unread counts
          setUnreadCounts(prev => ({
            ...prev,
            [receiverId]: unread
          }));
          
          // Update total unread
          setTotalUnread(prev => {
            const newUnreadCounts = {...prev, [receiverId]: unread};
            const newTotal = Object.values(newUnreadCounts).reduce((sum, count) => sum + count, 0);
            return newTotal;
          });
          
          setLoading(false);
        }, 
        (error) => {
          console.error('❌ Error listening to chat:', error);
          setLoading(false);
        }
      );
      
      // Store the unsubscribe function in ref
      activeListeners.current[chatId] = unsubscribe;
      
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Failed to set up chat listener:', error);
      return () => {};
    }
  };

  // Listen to all chats for the current user
  const listenToAllChats = () => {
    if (!user || authLoading || isInitialized.current) {
      console.log('⏳ User not available or already initialized');
      return () => {};
    }
    
    console.log('👂 Setting up main chat listener for user:', user.id);
    isInitialized.current = true;
    
    // Listen to all chat rooms where this user is a participant
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.id));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('📊 Found', snapshot.docs.length, 'chats for user');
        
        // Track which chats we're currently listening to
        const currentChatIds = new Set();
        
        snapshot.docs.forEach((docSnap) => {
          const chatData = docSnap.data();
          const otherUserId = chatData.participants.find(id => id !== user.id);
          
          if (otherUserId) {
            const chatId = getChatId(user.id, otherUserId);
            currentChatIds.add(chatId);
            
            // Only set up listener if not already listening
            if (!activeListeners.current[chatId]) {
              console.log(`🔗 Setting up listener for chat with ${otherUserId}`);
              listenToChat(otherUserId);
            }
          }
        });
        
        // Clean up listeners for chats that no longer exist
        Object.keys(activeListeners.current).forEach(chatId => {
          if (!currentChatIds.has(chatId)) {
            console.log(`🧹 Cleaning up unused listener for: ${chatId}`);
            activeListeners.current[chatId]();
            delete activeListeners.current[chatId];
          }
        });
        
        setLoading(false);
      }, 
      (error) => {
        console.error('❌ Error listening to all chats:', error);
        setLoading(false);
        isInitialized.current = false;
      }
    );

    return unsubscribe;
  };

  // Mark messages as read
  const markAsRead = async (senderId) => {
    if (!user) return;
    
    try {
      const chatId = getChatId(user.id, senderId);
      
      // Update chat room participant info
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`participantsInfo.${user.id}.lastChecked`]: serverTimestamp(),
        [`participantsInfo.${senderId}.hasUnread`]: false
      });
      
      // Mark individual messages as read
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(
        messagesRef, 
        where('read', '==', false), 
        where('senderId', '==', senderId)
      );
      
      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map(docSnap => 
        updateDoc(doc(db, 'chats', chatId, 'messages', docSnap.id), {
          read: true
        })
      );
      
      await Promise.all(updatePromises);
      
      console.log(`✅ Marked ${querySnapshot.docs.length} messages as read from ${senderId}`);
      
      // Update local state
      setUnreadCounts(prev => ({
        ...prev,
        [senderId]: 0
      }));
      
      // Update total unread
      setTotalUnread(prev => {
        const newUnreadCounts = {...prev, [senderId]: 0};
        return Object.values(newUnreadCounts).reduce((sum, count) => sum + count, 0);
      });
      
      // Update chats state to show messages as read
      setChats(prev => {
        const chatMessages = prev[senderId];
        if (!chatMessages) return prev;
        
        const updatedMessages = chatMessages.map(msg => 
          msg.senderId === senderId ? { ...msg, read: true } : msg
        );
        
        return {
          ...prev,
          [senderId]: updatedMessages
        };
      });
      
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  };

  // Get unread count for a specific user
  const getUnreadCount = (senderId) => {
    return unreadCounts[senderId] || 0;
  };

  // Get total unread count for badge
  const getTotalUnreadCount = () => {
    return totalUnread;
  };

  // Get chat history
  const getChatHistory = async (receiverId, messagesLimit = 50) => {
    if (!user) return [];
    
    try {
      const chatId = getChatId(user.id, receiverId);
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(
        messagesRef, 
        orderBy('timestamp', 'desc'), 
        limit(messagesLimit)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })).reverse();
      
    } catch (error) {
      console.error('❌ Error getting chat history:', error);
      return [];
    }
  };

  // Initialize only once when user is available
  useEffect(() => {
    if (user && !authLoading && !isInitialized.current) {
      console.log('🚀 Initializing chat system for user:', user.id);
      
      const cleanup = listenToAllChats();
      
      return () => {
        console.log('🧹 Cleaning up chat listeners');
        cleanup && cleanup();
        Object.values(activeListeners.current).forEach(unsub => {
          unsub && unsub();
        });
        activeListeners.current = {};
        isInitialized.current = false;
      };
    }
    
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  // Provide the context value
  const value = {
    chats,
    sendMessage,
    sendVoiceMessage,
    sendAttachment,
    deleteAttachment,
    listenToChat,
    listenToAllChats,
    getUnreadCount,
    getTotalUnreadCount,
    markAsRead,
    getChatHistory,
    loading
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}