import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuthState, useSignOut } from 'react-firebase-hooks/auth';
import { auth, db } from "../lib/Firebase";
import { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { setDoc, doc, getDoc } from "firebase/firestore";
import isUsernameExists from "../utils/isUsernameExists";
const useAuth = () => {
  const [authUser, authLoading, error] = useAuthState(auth);
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const ref = doc(db, "users", authUser.uid);
      const docSnap = await getDoc(ref);
      setUser(docSnap.data());
      setLoading(false);
    }

    if (!authLoading) {
      if (authUser) fetchData();
      else setLoading(false); // Not signed in
    }
  }, [authLoading]);

  return { user, isLoading, error };
};

const useLogin = () => {
    const [isLoading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    async function login({ email, password, redirectTo = "/protected/dashboard" }) {
        setLoading(true);
        try{
        await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: "You are loged in",
            status: "success",
            isClosable: "true",
            position: "top",
            duration: 4000,
        });
        navigate (redirectTo);
        } catch (error) {
            toast({
                title: "Logging in failed!",
                status: "error",
                description: error.message,
                isClosable: "true",
                position: "top",
                duration: 4000,
            });
            setLoading(false);
            return false //if login failed
        }
        setLoading(false);
        return true //if login succeeded
    }
    return{login, isLoading};
};

 const useRegister = ()=> {
    const [isLoading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
  
    async function register({
      username,
      email,
      password,
      redirectTo = "/protected/dashboard",
    }) {
      setLoading(true);
  
      const usernameExists = await isUsernameExists(username);
  
      if (usernameExists) {
        toast({
          title: "Username already exists, choose different username",
          status: "error",
          isClosable: true,
          position: "top",
          duration: 5000,
        });
        setLoading(false);
      } else {
        try {
          const res = await createUserWithEmailAndPassword(auth, email, password);
  
          await setDoc(doc(db, "users", res.user.uid), {
            id: res.user.uid,
            username: username.toLowerCase(),
            avatar: "",
            date: Date.now(),
          });
  
          toast({
            title: "Account created",
            description: "You are logged in",
            status: "success",
            isClosable: true,
            position: "top",
            duration: 5000,
          });
  
          navigate(redirectTo);
        } catch (error) {
          toast({
            title: "Signing Up failed",
            description: error.message,
            status: "error",
            isClosable: true,
            position: "top",
            duration: 5000,
          });
        } finally {
          setLoading(false);
        }
      }
    }
  
    return { register, isLoading };
  }
const useLogout = () => {
    const [signOut, isLoading, error] = useSignOut(auth);
    const toast = useToast();
    const navigate = useNavigate();

    async function logout(){
        if(await signOut()){
            toast({
                title: "Successfully logged out",
                status: "success",
                isClosable:true,
                position:"top",
                duration: 4000,
            })
            navigate("/login")
        }
        else{
            toast({
                title: "Logging out error!",
                status: "error",
                isClosable:true,
                position:"top",
                duration: 4000,
            })
            return false;
        }
        return true;
    }
    return {logout, isLoading};
}


export { useAuth, useLogin, useRegister, useLogout };