import { useToast } from "@chakra-ui/react";
import { uuidv4 } from "@firebase/util";
import {
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/Firebase";
import { useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
const useAddComment = ({ uid, postId }) => {
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();
  async function addComment(text) {
    setLoading(true);
    const id = uuidv4();
    const date = Date.now();
    const docRef = doc(db, "comments", id);
    await setDoc(docRef, { text, id, uid, postId, date });

    toast({
      title: "Comment added!",
      status: "success",
      isClosable: "true",
      position: "top",
      duration: 4000,
    });
    setLoading(false);
  }

  return { addComment, isLoading };
};

const useShowComments = (postId) => {
  const q = query(
    collection(db, "comments"),
    where("postId", "==", postId),
    orderBy("date", "desc")
  );
  const [comments, isLoading, error] = useCollectionData(q);
  if (error) throw error;
  return { comments, isLoading };
};

const useDeleteComment = (id) => {
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();
  async function deleteComment() {
    setLoading(true);
    const docRef = doc(db, "comments", id);
    await deleteDoc(docRef);
    toast({
      title: "Comment deleted!",
      status: "success",
      isClosable: "true",
      position: "top",
      duration: 4000,
    });
    setLoading(false);
  }
  return { deleteComment, isLoading };
};
export { useAddComment, useShowComments, useDeleteComment };
