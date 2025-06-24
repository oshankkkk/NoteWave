// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth,GoogleAuthProvider } from 'firebase/auth';

// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDgRhLBmf1H0r0EUvUkxLVmPyPtRZ4tlOA",
//   authDomain: "notewave-dc5e9.firebaseapp.com",
//   projectId: "notewave-dc5e9",
//   storageBucket: "notewave-dc5e9.firebasestorage.app",
//   messagingSenderId: "637978326195",
//   appId: "1:637978326195:web:cf1611587fe11654932cc6",
//   measurementId: "G-W87L5JN1QT"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// export const auth=getAuth(app)


// export const googleProvider=new GoogleAuthProvider(app)

// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgRhLBmf1H0r0EUvUkxLVmPyPtRZ4tlOA",
  authDomain: "notewave-dc5e9.firebaseapp.com",
  projectId: "notewave-dc5e9",
  storageBucket: "notewave-dc5e9.appspot.com", // fixed ".app" to ".appspot.com"
  messagingSenderId: "637978326195",
  appId: "1:637978326195:web:cf1611587fe11654932cc6",
  measurementId: "G-W87L5JN1QT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
const storage = getStorage(app);

export { db, analytics, auth, googleProvider,storage };


