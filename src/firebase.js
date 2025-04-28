import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCO1NO2v4T7timoY5_tZJgTug5JUVOXW0Q",
  authDomain: "personal-portfolio-89b18.firebaseapp.com",
  projectId: "personal-portfolio-89b18",
  storageBucket: "personal-portfolio-89b18.firebasestorage.app",
  messagingSenderId: "152147517165",
  appId: "1:152147517165:web:1bc7308cee22e8659976e4",
  measurementId: "G-XGN7Z1890G",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, getDoc, setDoc, updateDoc, increment };
