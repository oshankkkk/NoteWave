import { useState } from "react";
import { auth, googleProvider } from "../firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [showPassword, setShowPassword] = useState(false);

  async function handleEmailSignup() {
    await createUserWithEmailAndPassword(auth, email, password).then(
      ()=>{

      console.log("user handuwa email eken")      }
    ).catch("wade kela una")

  }
  async function handleGoogleSignup() {
    try{

    await signInWithPopup(auth, googleProvider)
    }catch{
  console.log("kela una")      
    }
  }
  async function handleEmailLogin() {
    try{
    await signInWithEmailAndPassword(auth, email, password)
    }catch{

  console.log("kela una")      
    }
     }
  async function handleLogout() {
    try {
      await signOut(auth);
      console.log("Logged out");
    } catch (err) {
      console.log("Logout error:", err.message);
    }
  }

  return (
    
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
  <div className="w-full max-w-sm bg-white p-6 rounded shadow">
    <h2 className="text-2xl font-semibold text-center mb-4">Login Page</h2>
    
    <input
      type="text"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <button
      onClick={handleEmailLogin}
      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-2"
    >
      Login
    </button>

    <button
      onClick={handleGoogleSignup}
      className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 mb-2"
    >
      Google Sign-In
    </button>

    <button
      onClick={handleEmailSignup}
      className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 mb-2"
    >
      Sign Up
    </button>

    <button
      onClick={handleLogout}
      className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
    >
      Log Out
    </button>
  </div>
</div>

  );
}
export default LoginPage;