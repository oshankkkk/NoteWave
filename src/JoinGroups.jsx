// src/components/JoinGroups.jsx
import { db } from "./firebase-config";
import { updateDoc, arrayUnion, doc } from "firebase/firestore";

/**
 * Join a public group by updating:
 * 1. User's groupIds array
 * 2. Group's Member map
 * 3. Group's unreadCnt map
 */
async function joinPublic(user, groupId) {
  if (!user || !user.uid) {
    console.error("User is not authenticated");
    return;
  }

  try {
    // Update user document: add group ID to groupIds array
    const userRef = doc(db, "User", user.uid);
    await updateDoc(userRef, {
      groupIds: arrayUnion(groupId),
    });

    // Update group document: add user to Member and unreadCnt
    const groupRef = doc(db, "Group", groupId);
    await updateDoc(groupRef, {
      [`Member.${user.uid}`]: true,
      [`unreadCnt.${user.uid}`]: 0,
    });

    console.log("User successfully joined the group.");
  } catch (error) {
    console.error("Failed to join group:", error);
  }
}

export { joinPublic };
