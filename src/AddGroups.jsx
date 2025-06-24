import React, { useState } from "react";
import { db } from "./firebase-config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
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
  const [emailQuery, setEmailQuery] = useState("");
  const [allowedMembers, setAllowedMembers] = useState([]);

  const { user } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedIcon) {
      alert("Please select a group icon.");
      return;
    }

    try {
      const chatRef = await addDoc(collection(db, "Chat"), {});

      const chatId = chatRef.id;

      const groupData = {
        Admin: user.uid,
        Icon: selectedIcon,
        Member: { [user.uid]: true },
        Name: groupName,
        Description: description,
        Public: isPublic,
        unreadCnt: {},
        chatId: chatId,
      };

      if (!isPublic) {
        groupData.allowedMembers = allowedMembers;
      }

      await addDoc(collection(db, "Group"), groupData);

      alert("Group and chat created successfully!");
      setSelectedIcon("");
      setGroupName("");
      setDescription("");
      setIsPublic(true);
      setAllowedMembers([]);
      setEmailQuery("");
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
        <div className="grid grid-cols-4 gap-2">
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

      {/* Add Members by Email (only for Private groups) */}
      {!isPublic && (
        <div className="mb-4">
          <label className="block font-semibold mb-1">Add Member by Email</label>
          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="Enter full email address"
              value={emailQuery}
              onChange={(e) => setEmailQuery(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              type="button"
              onClick={async () => {
                if (!emailQuery) return;

                try {
                  const q = query(
                    collection(db, "User"),
                    where("email", "==", emailQuery)
                  );
                  const querySnapshot = await getDocs(q);
                  if (!querySnapshot.empty) {
                    if (!allowedMembers.includes(emailQuery)) {
                      setAllowedMembers((prev) => [...prev, emailQuery]);
                      setEmailQuery("");
                    } else {
                      alert("This user is already added.");
                    }
                  } else {
                    alert("No user found with that email.");
                  }
                } catch (error) {
                  console.error("Error checking email:", error);
                  alert("An error occurred. Please try again.");
                }
              }}
              className="bg-fuchsia-700 text-white px-3 py-1 rounded hover:bg-fuchsia-800"
            >
              Add
            </button>
          </div>

          {/* Display allowed members */}
          {allowedMembers.length > 0 && (
            <div className="mt-2 text-sm text-gray-800">
              <strong>Allowed Members:</strong>
              <ul className="list-disc list-inside">
                {allowedMembers.map((email, idx) => (
                  <li key={idx}>{email}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
