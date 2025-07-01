import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import "./styles/App.css";

import GroupSideBar from "./GroupSideBar/GroupSideBar";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase-config";
import "./index.css";
import NavBar from "./Layout.jsx";
import SignUpPage from "./Authentication/SignUpPage.jsx";
import LoginPage from "./Authentication/LoginPage.jsx";
import Groups from "./Groups.jsx";
import { AuthProvider } from "./AuthContext.jsx"; // ✅ make sure this file exists and is exported
import { Calendar } from "./calendar.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>; // Optional: Show a loading indicator

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Protected routes under NavBar */}
          <Route
            path="/"
            element={isLoggedIn ? <NavBar /> : <Navigate to="/login" replace />}
          >
            <Route index element={<Home />} />
            <Route path="groups" element={<Groups />} />
            <Route path="calendar" element={<Calendar />} />
          </Route>

          {/* Public routes */}
          <Route
            path="/login"
            element={!isLoggedIn ? <LoginPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/signup"
            element={!isLoggedIn ? <SignUpPage /> : <Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
