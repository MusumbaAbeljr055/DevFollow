// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOV_sTU7PHcjsCfMAsBBnstYPGpJrBJog",
  authDomain: "devfellowmust.firebaseapp.com",
  projectId: "devfellowmust",
  storageBucket: "devfellowmust.firebasestorage.app",
  messagingSenderId: "518977124324",
  appId: "1:518977124324:web:8014d9738468c3c3dbb9f1",
  measurementId: "G-V3N2B7HPQQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
export default { app, db, auth, storage };