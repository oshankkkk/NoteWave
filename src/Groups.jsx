// src/components/Groups.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // ✅ Adjust path if needed
import { useNavigate } from "react-router-dom";
import { joinPublic } from "./JoinGroups";
import { useUser } from "./AuthContext";

function GroupsCards() {
  const [publicGroups, setPublicGroups] = useState([]);
  const {user}=useUser();
  const handleJoin = async (groupId) => {
    await joinPublic(user, groupId); // pass user here
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
              image: data.Icon ? `/Images/publicGroupIcons/${data.Icon}` : "/default-group-icon.png", // fallback icon
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
            <button className="font-[14px] text-white bg-fuchsia-800 px-3 py-1 rounded shadow-sm cursor-pointer hover:bg-fuchsia-900" onClick={()=>{handleJoin(group.id)}}>
              Join
            </button>
            {console.log(group)}
            
            <span className="text-sm text-gray-600">{Object.keys(group.members || {}).length} users</span>
          </div>
        </div>
      ))}
    </>
  );
}

function AddGroupsButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/add-group");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-1/2 bg-fuchsia-800 text-white rounded cursor-pointer hover:bg-fuchsia-900 py-2 px-4"
    >
      Add a group
    </button>
  );
}

function Groups() {
  return (
    <div className="bg-fuchsia-100 pt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-[20px] md:grid-cols-[repeat(3,294px)] gap-y-5 md:gap-x-[20px] justify-center px-4">
        <div className="grid grid-cols-2 justify-between col-span-3">
          <h1 className="text-2xl font-sans font-bold mb-[10px]">Popular Groups</h1>
          <AddGroupsButton />
        </div>

        <GroupsCards />
      </div>
    </div>
  );
}

export default Groups;
