// src/components/AddGroups.jsx
import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function AddGroups() {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Create a new Chat document (empty for now)
      const chatRef = await addDoc(collection(db, "Chat"), {
        messages: [] // optional: start with an empty messages array
      });

      // Step 2: Get the auto-generated chatId
      const chatId = chatRef.id;

      // Step 3: Create the Group with chatId included
      await addDoc(collection(db, "Group"), {
        Admin: "",
        Icon: "",
        Member: 0,
        Name: groupName,
        Description: description,
        Public: isPublic,
        unreadCnt: {},
        chatId: chatId
      });

      alert("Group and chat created successfully!");
      setGroupName("");
      setDescription("");
      setIsPublic(true);
    } catch (error) {
      console.error("Error creating group and chat:", error);
      alert("Failed to add group. Please try again.");
      
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto bg-white rounded shadow">
      <label className="block mb-4">
        Group Name
        <input
          type="text"
          placeholder="Enter the name of the group"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
          className="w-full p-2 mt-1 border rounded"
        />
      </label>

      <label className="block mb-4">
        Description
        <input
          type="text"
          placeholder="Enter group description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full p-2 mt-1 border rounded"
        />
      </label>

      <label className="block mb-4">
        Visibility
        <select
          value={isPublic}
          onChange={(e) => setIsPublic(e.target.value === "true")}
          className="w-full p-2 mt-1 border rounded"
        >
          <option value="true">Public</option>
          <option value="false">Private</option>
        </select>
      </label>

      <button
        type="submit"
        className="w-full bg-fuchsia-800 text-white rounded py-2 hover:bg-fuchsia-900"
      >
        Submit
      </button>
    </form>
  );
}

export default AddGroups;
