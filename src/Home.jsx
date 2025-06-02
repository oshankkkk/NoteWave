import React, { useState,useEffect } from "react";
import "./Home.css";

import SearchGroups from './SearchGroups';
import {auth} from './firebase-config';

import { getAuth, signOut } from "firebase/auth";
import "./Home.css"; // Make sure it has the layout CSS
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import {db} from "./firebase.js";


function Home(){
const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserGroups = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const allGroups = [];

      try {
        
        const userRef = doc(db, 'User', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.warn("User doc not found");
          setGroups([]);
          return;
        }

        const userData = userSnap.data();
        const groupIds = userData.groupIds || [];

        if (groupIds.length === 0) {
          setGroups([]);
          return;
        }

       
        const chunks = []; //fkin firestore only allows max 10 per chunk
        for (let i = 0; i < groupIds.length; i += 10) {
          chunks.push(groupIds.slice(i, i + 10));
        }

        

        for (const chunk of chunks) {
          const q = query(collection(db, 'Group'), where('__name__', 'in', chunk));
          const querySnap = await getDocs(q);
          querySnap.forEach(doc => {
            allGroups.push({ id: doc.id, ...doc.data() });
          });
        }

        setGroups(allGroups);
      } catch (err) {
        console.error("Error loading groups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGroups();
  }, []);

    
   
    if (loading) {
  return (
    <p id="loading-s">
      <i className="fa-solid fa-spinner" style={{ marginLeft: '8px' }} id="spinner"></i>&nbsp;
      Loading groups...
    </p>
  );
}
  return (
    
    <div>
     
      {groups.length === 0 ? (
       
       <div className="par"> <img src="/Images/no-groups.png"></img>
       <p>Bro enough being an introvert, get the f up and join some groups</p>

       </div>
       
      ) : (
        <ul id="grp-container">
          <h2 id="main-title">Conversations</h2>
          {console.log(groups)}
  {groups.map(group => (
    <div key={group.id} className="img-msg">
      <img className="grp-icon" src="/Images/spare-avatar.png" alt="Group icon" />
      <span>{group.Name}</span>
    </div>
  ))}
</ul>

      )}
    </div>
  );
}
export default Home;