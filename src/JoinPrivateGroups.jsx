import React, { useState } from "react";
import { db } from "./firebase-config";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useUser } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function JoinPrivateGroupModal({ closeModal }) {
  const [groupIdInput, setGroupIdInput] = useState("");
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!groupIdInput.trim()) return alert("Please enter a Group ID");

    if (loading) return; // Prevent multiple submits

  setLoading(true); // Show loading state

    try {
      const groupRef = doc(db, "Group", groupIdInput);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        alert("Incorrect GroupId or Group does not exist");
        return;
      }

      const groupData = groupSnap.data();

      // Check if user's email is in allowedMembers
      if (
        !groupData.allowedMembers ||
        !groupData.allowedMembers.includes(user.email)
      ) {
        alert("You don't have access or Incorrect GroupId");
        return;
      }

      // Remove email from allowedMembers
      const updatedAllowed = groupData.allowedMembers.filter(
        (email) => email !== user.email
      );

      // Add user's UID to Member map
      const updatedMembers = {
        ...groupData.Member,
        [user.uid]: true,
      };

      await updateDoc(groupRef, {
        allowedMembers: updatedAllowed,
        Member: updatedMembers,
      });

      // Append groupId to user's groupIds
      const userRef = doc(db, "User", user.uid);
      await updateDoc(userRef, {
        groupIds: arrayUnion(groupIdInput),
      });

      alert("Successfully joined the private group!");
      closeModal();
      navigate("/");
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to join group. Try again.");
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={closeModal}
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Join Private Group</h2>

        <input
          type="text"
          placeholder="Enter Group ID"
          value={groupIdInput}
          onChange={(e) => setGroupIdInput(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <div className="flex justify-between">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="px-4 py-2 bg-fuchsia-800 text-white rounded hover:bg-fuchsia-900 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "...": "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinPrivateGroupModal;
