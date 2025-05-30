
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import "./App.css";
import LoginPage from './Login.jsx';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase-config'; 
import './index.css';
import NavBar from './Layout.jsx';
function App(){
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
    <BrowserRouter>
      <Routes>
        {/* Protected routes under AppLayout */}
        <Route
          path="/"
          element={isLoggedIn ? <NavBar /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Home />} />
          
        </Route>

        {/* Public route */}
        <Route
          path="/login"
          element={!isLoggedIn ? <LoginPage /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

// import React from "react";
// import { Sidebar } from "./assets/SideBar/Sidebar";
// im
// port Groups from "./Components/Groups";

// function App() {
//   return (
//     <div>
//       <Sidebar />
//       <Groups />
//     </div>
//   );
// }
// export default App;
