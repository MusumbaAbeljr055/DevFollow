// src/hooks/posts.js - UPDATED WITH PROPER RETURN VALUES
import { uuidv4 } from "@firebase/util";
import {
  setDoc,
  doc,
  collection,
  orderBy,
  query,
  updateDoc,
  arrayRemove,
  arrayUnion,
  deleteDoc,
  where,
  getDocs,
  onSnapshot,
  increment
} from "firebase/firestore";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { useToast } from "@chakra-ui/react";
import { db, storage } from "../lib/Firebase";
import { useState, useEffect, useCallback } from "react";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const useAddPost = () => {
  const [isLoading, setLoading] = useState();
  const toast = useToast();
  
  async function addPost(postData, onProgress) {
    setLoading(true);
    const id = uuidv4();
    
    try {
      let attachmentsData = [];
      
      // Check if it's FormData (with attachments) or regular object
      if (postData instanceof FormData) {
        // Extract data from FormData
        const text = postData.get('text') || '';
        const userid = postData.get('userid');
        
        // Validate user
        if (!userid) {
          throw new Error('User ID is required');
        }
        
        console.log('Creating post with text:', text, 'userid:', userid);
        
        // Get attachments from form data
        const attachments = postData.getAll('attachments');
        const attachmentTypes = postData.getAll('attachmentTypes');
        const attachmentNames = postData.getAll('attachmentNames');
        
        console.log('Number of attachments:', attachments.length);
        
        // Upload each attachment to Firebase Storage
        if (attachments.length > 0) {
          for (let i = 0; i < attachments.length; i++) {
            const file = attachments[i];
            const type = attachmentTypes[i];
            const name = attachmentNames[i];
            
            console.log(`Uploading attachment ${i + 1}:`, name, 'type:', type, 'size:', file.size);
            
            // Create unique filename
            const fileExtension = name.split('.').pop();
            const fileName = `${id}_${i}_${Date.now()}.${fileExtension}`;
            const storageRef = ref(storage, `posts/${userid}/${fileName}`);
            
            // Upload file with progress tracking
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            await new Promise((resolve, reject) => {
              uploadTask.on('state_changed',
                (snapshot) => {
                  // Calculate progress for this file
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  if (onProgress) {
                    // Calculate overall progress
                    const overallProgress = ((i + (progress / 100)) / attachments.length) * 100;
                    onProgress(overallProgress);
                  }
                },
                reject,
                async () => {
                  // Upload completed, get download URL
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  
                  console.log(`Attachment ${i + 1} uploaded successfully:`, downloadURL);
                  
                  attachmentsData.push({
                    url: downloadURL,
                    type: type,
                    name: name,
                    size: file.size,
                    fileName: fileName,
                    storagePath: `posts/${userid}/${fileName}`
                  });
                  
                  resolve();
                }
              );
            });
          }
        }
        
        // Create post in Firestore with attachments
        const postDataToSave = {
          text: text,
          userid: userid,
          id,
          date: Date.now(),
          likes: [],
          attachments: attachmentsData,
          attachmentCount: attachmentsData.length
        };
        
        console.log('Saving post to Firestore:', postDataToSave);
        
        await setDoc(doc(db, "posts", id), postDataToSave);
        
        console.log('Post created successfully with ID:', id);
        
      } else {
        // Regular text-only post (backward compatibility)
        console.log('Creating text-only post:', postData);
        
        await setDoc(doc(db, "posts", id), {
          ...postData,
          id,
          date: Date.now(),
          likes: [],
          attachments: [],
          attachmentCount: 0
        });
        
        console.log('Text-only post created successfully with ID:', id);
      }
      
      toast({
        title: "Post added!",
        status: "success",
        isClosable: "true",
        position: "top",
        duration: 4000,
      });
      
      // IMPORTANT: Return true on success
      return true;
      
    } catch (error) {
      console.error("Error adding post:", error);
      console.error("Error stack:", error.stack);
      
      toast({
        title: "Error adding post",
        description: error.message,
        status: "error",
        isClosable: "true",
        position: "top",
        duration: 4000,
      });
      
      // IMPORTANT: Return false on error
      return false;
      
    } finally {
      setLoading(false);
    }
  }
  
  return { addPost, isLoading };
};

const useToggleLike = ({ id, isLiked, uid }) => {
  const [isLoading, setLoading] = useState(false);

  async function toggleLike() {
    setLoading(true);
    const docRef = doc(db, "posts", id);
    await updateDoc(docRef, {
      likes: isLiked ? arrayRemove(uid) : arrayUnion(uid),
    });
    setLoading(false);
  }

  return { toggleLike, isLoading };
};

const useShowPosts = (uid = null) => {
  const q = uid
    ? query(
        collection(db, "posts"),
        orderBy("date", "desc"),
        where("userid", "==", uid)
      )
    : query(collection(db, "posts"), orderBy("date", "desc"));
  
  const [posts, isLoading, error] = useCollectionData(q);
  
  // Transform posts to ensure attachments array exists
  const transformedPosts = posts?.map(post => ({
    ...post,
    attachments: post.attachments || [],
    attachmentCount: post.attachmentCount || 0
  })) || [];
  
  if (error) throw error;
  return { posts: transformedPosts, isLoading };
};

const usePost = (id) => {
  const q = doc(db, "posts", id);
  const [post, isLoading] = useDocumentData(q);
  
  // Transform post to ensure attachments array exists
  const transformedPost = post ? {
    ...post,
    attachments: post.attachments || [],
    attachmentCount: post.attachmentCount || 0
  } : null;
  
  return { post: transformedPost, isLoading };
};

const useDeletePost = (id) => {
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();

  async function deletePost() {
    setLoading(true);
    
    try {
      // First, get the post to check for attachments
      const q = query(collection(db, "posts"), where("id", "==", id));
      const postSnapshot = await getDocs(q);
      
      if (!postSnapshot.empty) {
        const postDoc = postSnapshot.docs[0];
        const postData = postDoc.data();
        
        // Delete all attachments from storage
        if (postData.attachments && Array.isArray(postData.attachments)) {
          for (const attachment of postData.attachments) {
            if (attachment.storagePath) {
              try {
                const storageRef = ref(storage, attachment.storagePath);
                await deleteObject(storageRef);
              } catch (error) {
                console.error("Error deleting attachment:", error);
                // Continue deleting other attachments even if one fails
              }
            }
          }
        }
        
        // Delete post from Firestore
        await deleteDoc(doc(db, "posts", id));
      } else {
        // If post doesn't exist, just delete the doc
        await deleteDoc(doc(db, "posts", id));
      }
      
      // Delete comments related to the post
      const commentsQuery = query(collection(db, "comments"), where("postId", "==", id));
      const querySnapshot = await getDocs(commentsQuery);
      
      // Delete all comments
      const deletePromises = querySnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      });
      await Promise.all(deletePromises);

      toast({
        title: "Post deleted!",
        status: "success",
        isClosable: "true",
        position: "top",
        duration: 4000,
      });
      
      return true;
      
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error deleting post",
        description: error.message,
        status: "error",
        isClosable: "true",
        position: "top",
        duration: 4000,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { deletePost, isLoading };
};

const useTotalLikes = (id) => {
  const [isLoading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "posts"), where("userid", "==", id));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let totalLikes = 0;
      querySnapshot.forEach((doc) => {
        let postData = doc.data();
        totalLikes += postData.likes.length;
      });
      setTotal(totalLikes);
      setLoading(false);
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [id]);

  return { total, isLoading };
};

// New hook to delete attachment from a post
const useDeleteAttachment = () => {
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();

  async function deleteAttachment(postId, attachment) {
    setLoading(true);
    
    try {
      // Delete from storage
      if (attachment.storagePath) {
        const storageRef = ref(storage, attachment.storagePath);
        await deleteObject(storageRef);
      }
      
      // Remove from post attachments array
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        attachments: arrayRemove(attachment),
        attachmentCount: increment(-1)
      });
      
      toast({
        title: "Attachment deleted",
        status: "success",
        isClosable: true,
        position: "top",
        duration: 3000,
      });
      
      return true;
      
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast({
        title: "Error deleting attachment",
        description: error.message,
        status: "error",
        isClosable: true,
        position: "top",
        duration: 4000,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { deleteAttachment, isLoading };
};

export {
  useAddPost,
  useShowPosts,
  useToggleLike,
  useDeletePost,
  usePost,
  useTotalLikes,
  useDeleteAttachment,
};