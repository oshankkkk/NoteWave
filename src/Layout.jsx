import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from 'react-router-dom';
import SearchGroups from './SearchGroups';
import { auth } from './firebase-config';
import { getAuth, signOut } from "firebase/auth";
import "./styles/Home.css"; // Make sure it has the layout CSS
import { onAuthStateChanged } from "firebase/auth";
import Notification from "./Components/Notification";

function NavBar() {
  const [isVisible, setVisible] = useState(true);
  const toggleSidebar = () => setVisible(prev => !prev);

  const [showProfile, setProfile] = useState(false);
  const handleProfile = () => setProfile(prev => !prev);

  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);
  const [imgSrc, setImgSrc] = React.useState('/Images/spare-avatar.png');

  React.useEffect(() => {
    if (user?.photoURL) {
      setImgSrc(user.photoURL);
    }
  }, [user]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      
      setUser(currentUser);
    
    });

    return () => unsubscribe(); 
  }, []);
    
    const handleLogout = async () => {
      try {
        await signOut(auth);
        navigate("/login"); // or whatever your login route is
      } catch (err) {
        console.error("Logout error:", err);
      }
    };
  
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
         {/*} <img id="logo" src="Images/logo.png" alt="Logo" /> */}
          <span className="app-name">NoteWave</span>
          <button className="btn" id="collapse-btn" onClick={toggleSidebar}>
            {isVisible&&(<i className="fa-solid fa-chevron-left"></i>)}
            {!isVisible&&(<i className="fa-solid fa-chevron-right"></i>)}
          </button>
        </div>

        <div className="header-center">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>

            <input
              type="text"
              placeholder="Search for study guides, groups and more..."
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query.length > 0 && (
              <button className="close" onClick={() => setQuery('')}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
          {query.length > 0 && (
            <div className="search-feedback">
              <SearchGroups query={query} />
            </div>
          )}
        </div>
        <Notification/>
 {/* <div className="min-h-screen fixed inset-y-0 py-5  right-3 w-[30%] flex flex-col items-center justify-center bg-purple-600 ">  */}
        <div className="header-right">
         
          <img src={imgSrc} alt="User" onError={() => setImgSrc('/Images/spare-avatar.png')} className="img-h"
          onClick={handleProfile} />
        </div>
      </header>

      <div className="content-wrapper">
        <aside className={`side-bar ${isVisible ? ' ':'collapsed' }`}>
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fa-solid fa-house"></i>
                <span className="side-text">Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/groups" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fa-solid fa-user-group"></i>
                <span className="side-text">Groups</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/calendar" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fa-solid fa-calendar-days"></i>
                <span className="side-text">Calendar</span>
              </NavLink>
            </li>
          </ul>
          <ul id="settings">
            <li>
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fa-solid fa-gear"></i>
                <span className="side-text">Settings</span>
              </NavLink>
            </li>
          </ul>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {showProfile && user && (
        <div className="profile">
          <button id="close" onClick={handleProfile}><i className="fa-solid fa-xmark"></i></button>
          <p id="img-container">
            <img src={imgSrc} alt="User" onError={() => setImgSrc('/Images/spare-avatar.png')} className="img" />
          </p>
          <h1 id="name">
            <i className="fa-solid fa-user icons"></i>&nbsp;{user.displayName}
          </h1>
          <p id="email">
            <i className="fa-solid fa-envelope icons"></i>&nbsp;{user.email}
          </p>
          <button id="logout" onClick={handleLogout}><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
        </div>
      )}
    </div>
  );
}

export default NavBar;