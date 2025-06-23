// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // your keys
  apiKey: "AIzaSyDgRhLBmf1H0r0EUvUkxLVmPyPtRZ4tlOA",
  authDomain: "notewave-dc5e9.firebaseapp.com",
  projectId: "notewave-dc5e9",
  storageBucket: "notewave-dc5e9.firebasestorage.app",
  messagingSenderId: "637978326195",
  appId: "1:637978326195:web:cf1611587fe11654932cc6",
  measurementId: "G-W87L5JN1QT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

