import React, { useState } from "react";
import { db } from "./firebase-config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useUser } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const iconOptions = [
  "Icon1.png", "Icon2.png", "Icon3.png", "Icon4.png",
  "Icon5.png", "Icon6.png", "Icon7.png", "Icon8.png"
];

function AddGroups({ closeModal }) {
  const [selectedIcon, setSelectedIcon] = useState("");
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [emailQuery, setEmailQuery] = useState("");
  const [allowedMembers, setAllowedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedIcon) {
      alert("Please select a group icon.");
      return;
    }

    if (loading) return; // Prevent multiple submits

  setLoading(true); // Show loading state


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

      if (!isPublic) groupData.allowedMembers = allowedMembers;

      
      const groupRef = await addDoc(collection(db, "Group"), groupData);

      
      const userRef = doc(db, "User", user.uid);
      await updateDoc(userRef, {
        groupIds: arrayUnion(groupRef.id),
      });

      alert("Group and chat created successfully!");
      navigate("/", { state: { autoOpenChatId: chatId } });
    } catch (error) {
      console.error("Error creating group and chat:", error);
      alert("Failed to add group. Please try again.");
    } finally {
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

        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4 text-center">Create a Group</h2>

          {/* Icon selection */}
          <label className="block mb-4">
            <span className="block mb-2 font-semibold">Select a Group Icon</span>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((icon, idx) => (
                <img
                  key={idx}
                  src={`/Images/publicGroupIcons/${icon}`}
                  alt={`Group Icon ${idx + 1}`}
                  className={`w-[74px] h-[74px] rounded-full object-cover cursor-pointer border-2 ${
                    selectedIcon === icon ? "border-fuchsia-800" : "border-transparent"
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

          {/* Private members */}
          {!isPublic && (
            <div className="mb-4">
              <label className="block font-semibold mb-1">Add Member by Email</label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={emailQuery}
                  onChange={(e) => setEmailQuery(e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!emailQuery) return;
                    try {
                      const q = query(collection(db, "User"), where("email", "==", emailQuery));
                      const querySnapshot = await getDocs(q);
                      if (!querySnapshot.empty) {
                        if (!allowedMembers.includes(emailQuery)) {
                          setAllowedMembers((prev) => [...prev, emailQuery]);
                          setEmailQuery("");
                        } else {
                          alert("Already added.");
                        }
                      } else {
                        alert("No user found.");
                      }
                    } catch (error) {
                      console.error("Error checking email:", error);
                      alert("Try again.");
                    }
                  }}
                  className="bg-fuchsia-700 text-white px-3 py-1 rounded hover:bg-fuchsia-800"
                >
                  Add
                </button>
              </div>

              {allowedMembers.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-gray-800">
                  {allowedMembers.map((email, idx) => (
                    <li key={idx}>{email}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-fuchsia-800 text-white rounded hover:bg-fuchsia-900 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating...": "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddGroups;
