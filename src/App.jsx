import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import "./styles/App.css";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase-config";
import "./index.css";
import NavBar from "./Layout.jsx";
import SignUpPage from "./Authentication/SignUpPage.jsx";
import LoginPage from "./Authentication/LoginPage.jsx";
import Groups from "./components/Groups.jsx";

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

  return (
    // <div>
    //   <Sidebar />
    //   <Groups />
    // </div>
    <BrowserRouter>
      <Routes>
        {/* Protected routes under AppLayout */}
        <Route
          path="/"
          element={isLoggedIn ? <NavBar /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Home />} />
          <Route path="/groups" index element={<Groups />} />
        </Route>

        {/* Public route */}
        <Route
          path="/login"
          element={!isLoggedIn ? <SignUpPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!isLoggedIn ? <SignUpPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/login"
          element={!isLoggedIn ? <LoginPage /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
// import LoginPage from './Authentication/LoginPage.jsx';

// function App(){

// return(
// <LoginPage/>
// )
// }
export default App;
