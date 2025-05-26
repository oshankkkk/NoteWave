// Groups.jsx
import React, { useState, useEffect } from "react";

function GroupSideBar() {
  const [joinedGroups, setJoinedGroups] = useState([]);

  useEffect(() => {
    fetch("/Data/joinedGroups.json")
      .then((res) => res.json())
      .then((data) => setJoinedGroups(data))
      .catch((err) => console.error("Error loading groups:", err));
  }, []);

  return (
    <aside className="group-sidebar">
      <ul className="bg-white w-[230px] h-[100vh]">
        {joinedGroups.map((group, index) => (
          <li
            key={index}
            className="flex items-center pl-[10px] mb-[20px] bg-white w-[230px] h-[66px] cursor-pointer hover:bg-fuchsia-200"
          >
            <img
              src={group.image}
              alt={group.name}
              className="w-[47px] h-[47px] rounded-full object-cover mr-[9px] border-1 border-slate-100"
            />
            <div className="flex flex-col">
              <span className="text-[15px]-bold font-inter font-medium">
                {group.name}
              </span>
              <span className="text-sm text-gray-500 truncate w-[150px]">
                {group.lastMessage}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function GroupsCards() {
  const [publicGroups, setPublicGroups] = useState([]);

  useEffect(() => {
    fetch("/Data/publicGroups.json")
      .then((res) => res.json())
      .then((data) => setPublicGroups(data))
      .catch((err) => console.error("Error loading public groups:", err));
  }, []);

  return (
    <div className="ml-[25px] mr-[15px] pt-[10px]">
      <h1 className="text-2xl font-sans font-bold mb-[10px]">Popular Groups</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[20px]">
        {publicGroups.map((group, index) => (
          <div
            key={index}
            className="bg-fuchsia-200 w-[294px] h-[230px] rounded-[10px] p-4 flex flex-col items-center justify-between"
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
              <button className="font-[14px] text-white bg-fuchsia-800 px-3 py-1 rounded shadow-sm hover:bg-fuchsia-900">
                View
              </button>
              <span className="text-sm text-gray-600">
                {group.members} members
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Groups() {
  return (
    <div className="flex bg-fuchsia-50 ml-[69px] mt-[46px]">
      <GroupSideBar />
      <GroupsCards />
    </div>
  );
}

export default Groups;
