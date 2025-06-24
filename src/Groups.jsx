import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase-config";
import { joinPublic } from "./JoinGroups";
import { useUser } from "./AuthContext";
import AddGroups from "./AddGroups";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import JoinPrivateGroupModal from "./JoinPrivateGroups";

function GroupsCards() {
  const [publicGroups, setPublicGroups] = useState([]);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const handleJoin = async (groupId) => {

    if (joining) return; // Prevent multiple submits

  setJoining(true); // Show loading state

  try {
    await joinPublic(user, groupId);

    const groupDoc = await getDoc(doc(db, "Group", groupId));
    const chatId = groupDoc.exists() ? groupDoc.data().chatId : null;

    navigate("/", { state: { autoOpenChatId: chatId } });
  } catch (err) {
    console.error("Error joining and redirecting:", err);
  }finally{
    setJoining(false)
  }
};

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Group"));
        const groups = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.Public === true) {
            groups.push({
              id: doc.id,
              name: data.Name,
              description: data.Description,
              members: data.Member,
              image: data.Icon
                ? `/Images/publicGroupIcons/${data.Icon}`
                : "/default-group-icon.png", // fallback icon
            });
          }
        });

        setPublicGroups(groups);
      } catch (error) {
        console.error("Error fetching groups from Firebase:", error);
      }
    };

    fetchGroups();
  }, []);

  return (
    <>
      {publicGroups.map((group, index) => (
        <div
          key={group.id || index}
          className="bg-fuchsia-200 rounded-[10px] p-4 flex flex-col items-center justify-between w-full sm:w-full md:w-[294px] shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <img
            src={group.image}
            alt={group.name}
            className="w-[74px] h-[74px] rounded-full object-cover"
          />
          <div className="text-center mt-2">
            <div className="text-[20px] font-semibold">{group.name}</div>
            <div className="text-[16px] font-normal text-gray-700 mt-1">
              {group.description}
            </div>
          </div>
          <div className="w-full flex justify-between mt-4 px-1">
            <button
              className="font-[14px] text-white bg-fuchsia-800 px-3 py-1 rounded shadow-sm cursor-pointer hover:bg-fuchsia-900 disabled:opacity-50"
              onClick={() => {
                handleJoin(group.id);
              }}
              disabled={joining}
            >
              {joining ? "...": "Join"}
            </button>
            {console.log(group)}

            <span className="text-sm text-gray-600">
              {Object.keys(group.members || {}).length} users
            </span>
          </div>
        </div>
      ))}
    </>
  );
}

function AddGroupsButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[42px] h-[42px] bg-fuchsia-800 text-white rounded cursor-pointer hover:bg-fuchsia-900 relative group"
    >
      <i className="fa-solid fa-plus"></i>
      <div className="absolute top-[115%] left-1/2 -translate-x-1/2 bg-fuchsia-800 text-white text-[14px] font-medium px-2 py-[6px] rounded-md shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-in-out whitespace-nowrap z-20">
        Create a Group
      </div>
    </button>
  );
}

function JoinPrivateGroupButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="relative group">
        <span className="absolute top-[115%] left-1/2 -translate-x-1/2 bg-fuchsia-800 text-white text-[14px] font-medium px-2 py-[6px] rounded-md shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-in-out whitespace-nowrap z-20">
          Join a Private Group
        </span>
        <button
          type="button"
          onClick={handleClick}
          className="w-[42px] h-[42px] bg-fuchsia-800 text-white rounded cursor-pointer hover:bg-fuchsia-900 flex items-center justify-center"
        >
          <i className="fa-solid fa-circle-up"></i>
        </button>
      </div>

      {isModalOpen && (
        <JoinPrivateGroupModal closeModal={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

function Groups() {
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  return (
    <div className="bg-fuchsia-100 pt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-[20px] md:grid-cols-[repeat(3,294px)] gap-y-5 md:gap-x-[20px] justify-center px-4">
        <div className="grid grid-cols-2 justify-between col-span-3">
          <h1 className="text-2xl font-sans font-bold mb-[10px]">
            Popular Groups
          </h1>
          <div className="flex gap-2 justify-end-safe">
            <AddGroupsButton onClick={() => setShowAddGroupModal(true)} />
            <JoinPrivateGroupButton />
          </div>
        </div>

        <GroupsCards />
      </div>

      {showAddGroupModal && (
        <AddGroups closeModal={() => setShowAddGroupModal(false)} />
      )}
    </div>
  );
}

export default Groups;
