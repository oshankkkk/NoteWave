// src/components/AddGroups.jsx
import React, { useState } from "react";
import { db } from "./firebase-config";
import { collection, addDoc } from "firebase/firestore";

import { useUser } from "./AuthContext";

const iconOptions = [
  "Icon1.png",
  "Icon2.png",
  "Icon3.png",
  "Icon4.png",
  "Icon5.png",
  "Icon6.png",
  "Icon7.png",
  "Icon8.png",
];

function AddGroups() {
  const [selectedIcon, setSelectedIcon] = useState("");
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const { user } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedIcon) {
      alert("Please select a group icon.");
      return;
    }

    try {
      const chatRef = await addDoc(collection(db, "Chat"), {
        messages: [],
      });

      const chatId = chatRef.id;

      await addDoc(collection(db, "Group"), {
        Admin: "",
        Icon: selectedIcon,
        Member: { [user.uid]: true },
        Name: groupName,
        Description: description,
        Public: isPublic,
        unreadCnt: {},
        chatId: chatId,
      });

      alert("Group and chat created successfully!");
      setSelectedIcon("");
      setGroupName("");
      setDescription("");
      setIsPublic(true);
    } catch (error) {
      console.error("Error creating group and chat:", error);
      alert("Failed to add group. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 max-w-md mx-auto bg-white rounded shadow"
    >
      {/* Icon Selection */}
      <label className="block mb-4">
        <span className="block mb-2 font-semibold">Select a Group Icon</span>
        <div className="grid grid-cols-4">
          {iconOptions.map((icon, idx) => (
            <img
              key={idx}
              src={`/Images/publicGroupIcons/${icon}`}
              alt={`Group Icon ${idx + 1}`}
              className={`w-[74px] h-[74px] rounded-full object-cover cursor-pointer border-2 ${
                selectedIcon === icon
                  ? "border-fuchsia-800"
                  : "border-transparent"
              }`}
              onClick={() => setSelectedIcon(icon)}
            />
          ))}
        </div>
      </label>

      {/* Group Name */}
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

      {/* Description */}
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

      {/* Visibility */}
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

      {/* Submit Button */}
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
