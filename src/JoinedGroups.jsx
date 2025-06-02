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

export default GroupSideBar;