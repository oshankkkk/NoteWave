import React, { useState, useEffect } from "react";
import SearchGroups from "./SearchGroups";
import { auth } from "./firebase-config";
import { getAuth, signOut } from "firebase/auth";
import "./styles/Home.css"; // Make sure it has the layout CSS
import { onAuthStateChanged } from "firebase/auth";
import ChatRoom2 from "./components/ChatRoom2";
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  updateDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase-config";

function Home() {
  const [grp, setGrp] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Track auth state to get user
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let groupUnsubscribes = [];

    const userRef = doc(db, "User", user.uid);

    const unsubscribeUser = onSnapshot(userRef, (userSnap) => {
      if (!userSnap.exists()) {
        if (isMounted) {
          setGroups([]);
          setLoading(false);
        }
        return;
      }

      const userData = userSnap.data();
      const groupIds = userData.groupIds || [];

      if (groupIds.length === 0) {
        if (isMounted) {
          setGroups([]);
          setLoading(false);
        }
        return;
      }

      // Clean old group listeners
      groupUnsubscribes.forEach((unsub) => unsub());
      groupUnsubscribes = [];

      // Firestore 'in' query max 10
      const chunks = [];
      for (let i = 0; i < groupIds.length; i += 10) {
        chunks.push(groupIds.slice(i, i + 10));
      }

      let allGroupsMap = {};

      chunks.forEach((chunk) => {
        const q = query(
          collection(db, "Group"),
          where("__name__", "in", chunk)
        );

        const unsubscribeGroup = onSnapshot(q, (querySnap) => {
          querySnap.forEach((doc) => {
            const data = doc.data();
            const unreadCount = data.unreadCnt?.[user.uid] ?? 0;
            allGroupsMap[doc.id] = {
              id: doc.id,

              ...data,
              unreadCount,
            };
          });

          if (isMounted) {
            setGroups(Object.values(allGroupsMap));
            setLoading(false);
          }
        });

        groupUnsubscribes.push(unsubscribeGroup);
      });
    });

    return () => {
      isMounted = false;
      unsubscribeUser(); // stop listening to user doc
      groupUnsubscribes.forEach((unsub) => unsub()); // stop listening to groups
    };
  }, [user]);

  const loadChat = async (chatID, groupId) => {
    if (!user) return;
    const groupRef = doc(db, "Group", groupId);
    try {
      await updateDoc(groupRef, {
        [`unreadCnt.${user.uid}`]: 0,
      });

      console.log("Unread count reset to 0");
      setGrp(chatID);
      console.log(chatID);
    } catch (e) {
      console.error("Failed to reset unread count:", e);
    }
  };

  if (loading) {
    return (
      <p id="loading-s">
        <i
          className="fa-solid fa-spinner"
          style={{ marginLeft: "8px" }}
          id="spinner"
        ></i>
        &nbsp; Loading groups...
      </p>
    );
  }

  return (
    <div>
      {groups.length === 0 ? (
        <div className="par">
          <img src="/Images/no-groups.png" alt="No groups" className="alert" />
          <p>You haven't joined any grp so far</p>
        </div>
      ) : (
        <ul id="grp-container">
          <h2 id="main-title">Conversations</h2>
          {groups.map((group) => (
            <div
              key={group.id}
              className="img-msg"
              onClick={() => loadChat(group.chatId, group.id)}
            >
              <img
                className="grp-icon"
                src={`/Images/publicGroupIcons/${group.Icon}`}
                alt="Group icon"
              />
              <span>{group.Name}</span>
              {group.unreadCount > 0 && (
                <span className="unread-cnt">{group.unreadCount}</span>
              )}
              {group.Admin.includes(user.uid) && (
                <button id="admin-edit">
                  <i class="fa-solid fa-pen"></i>
                </button>
              )}
            </div>
          ))}
        </ul>
      )}
      {grp && <ChatRoom2 chatId={grp}></ChatRoom2>}
    </div>
  );
}

export default Home;
