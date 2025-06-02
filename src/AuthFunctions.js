import { auth, googleProvider } from './firebase-config';
import {db} from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Helper to save user data after signup/login
async function saveUserToFirestore(user) {
  try {
    await setDoc(doc(db, "User", user.uid), {
      name: user.displayName || "",
      email: user.email,
      groupIds: [], // start empty or customize as needed
      
    });
  } catch (err) {
    console.error("Error saving user data:", err);
  }
}

export async function handleEmailSignup(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optionally set displayName in Firebase Auth profile
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    await saveUserToFirestore(user);
    console.log("User signed up and saved:", user.uid);
  } catch (err) {
    console.error("Signup error:", err.message);
  }
}

export async function handleGoogleSignup() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save user data if new user (or just overwrite)
    await saveUserToFirestore(user);
    console.log("Google signup/login successful:", user.uid);
  } catch (err) {
    console.error("Google signup error:", err.message);
  }
}

export async function handleEmailLogin(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Email login successful");
  } catch (err) {
    console.error("Login error:", err.message);
  }
}

export async function handleLogout() {
  try {
    await signOut(auth);
    console.log("Logged out");
  } catch (err) {
    console.error("Logout error:", err.message);
  }
}
