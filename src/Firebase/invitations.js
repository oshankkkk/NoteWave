import { db } from "../firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

// 📤 Send invitation
export const sendInvitation = async ({ senderId, receiverEmail, groupId }) => {
  const invitationsRef = collection(db, "Invitations");

  const newInvitation = {
    senderId,
    receiverEmail,
    groupId,
    status: "pending", // other statuses: "accepted", "ignored"
    sentAt: new Date(),
  };

  try {
    await addDoc(invitationsRef, newInvitation);
    console.log("Invitation sent");
  } catch (err) {
    console.error("Failed to send invitation:", err);
  }
};

// 📥 Get invitations received by user
export const getReceivedInvitations = async (userEmail) => {
  const q = query(collection(db, "Invitations"), where("receiverEmail", "==", userEmail));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ Accept invitation
export const acceptInvitation = async (invitationId, userId, groupId, userEmail) => {
  try {
    // 1. Add user to group
    const groupRef = doc(db, "Group", groupId);
    await updateDoc(groupRef, {
      [`Member.${userId}`]: true,
      allowedMembers: arrayRemove(userEmail),
    });
    // Remove email from allowedMembers
    

    // 2. Add group to user
    const userRef = doc(db, "User", userId);
    await updateDoc(userRef, {
      groupIds: arrayUnion(groupId)
    });

    // 3. Delete the invitation
    await deleteDoc(doc(db, "Invitations", invitationId));
    console.log("Invitation accepted and deleted");
  } catch (error) {
    console.error("Failed to accept invitation:", error);
  }
};

// ❌ Ignore invitation
export const ignoreInvitation = async (invitationId) => {
  try {
    await deleteDoc(doc(db, "Invitations", invitationId));
    console.log("Invitation ignored and deleted");
  } catch (error) {
    console.error("Failed to ignore invitation:", error);
  }
};

