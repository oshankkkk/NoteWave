import { auth, googleProvider } from "./firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
    export  async function handleEmailSignup() {
    await createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log(auth.currentUser);
        console.log("user handuwa email eken");
      })
      .catch("wade kela una");
  }
    export async function handleGoogleSignup() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      console.log("kela una");
    }
  }
    export async function handleEmailLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      console.log("kela una");
    }
  }
    export async function handleLogout() {
    try {
      await signOut(auth);
      console.log("Logged out");
    } catch (err) {
      console.log("Logout error:", err.message);
    }
  }

