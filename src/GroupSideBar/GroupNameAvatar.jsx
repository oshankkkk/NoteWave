import { db } from "../firebase-config";
import { useEffect, useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export default function GroupNameAndAvatar({ groupMembers, adminId, name, groupId, groupIcon }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(null);

  const handleNameSubmit = async (e) => {
    if (e.key === 'Enter') {
      setIsEditingName(false);

      try {
        const groupRef = doc(db, "Group", groupId); // you need the groupId
        await updateDoc(groupRef, {
          Name: groupName,
        });
        console.log("Group name updated");
      } catch (error) {
        console.error("Error updating group name:", error);
      }
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(!isEditingName);
  };
  const [AdminName, setAdminName] = useState("")
  useEffect(() => {
    //   if (!user) return;
    const fetchUser = async () => {
      const userRef = doc(db, "User", adminId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        console.log("fff")
        console.log(data);
        console.log("HHH")
        setAdminName(data.name)
        // setUserData(data); // or whatever you want to do
      } else {
        console.log("No such user");
      }
    };

    fetchUser();
  }, []);
  useEffect(() => {
    const fetchGroup = async () => {
      const groupRef = doc(db, "Group", groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const data = groupSnap.data();
        setGroupName(data.Name || ""); // ✅ fetch fresh name
      } else {
        console.log("No such group");
      }
    };

    fetchGroup();
  }, [groupId]);


  return (
    <div className="p-6 border-b bg-fuchsia-50 border-gray-200">
      <div className="flex flex-col items-center">
        {/* Group Avatar */}
        <div className="relative mb-4">
          <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-4xl">
            <img className="rounded-full" src={`/Images/publicGroupIcons/${groupIcon}`}></img>
          </div>

        </div>

        {/* Group Name */}
        <div className="w-full">
          {isEditingName ? (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyPress={handleNameSubmit}
              onBlur={() => setIsEditingName(false)}
              className="text-xl font-semibold text-center w-full border-b-2 border-purple-600 outline-none bg-transparent"
              autoFocus
            />
          ) : (
            <div className="flex items-center group">
              <h3 className="text-xl font-semibold text-center">{groupName}</h3>
              <span
                className="text-sm opacity-0 group-hover:opacity-100 cursor-pointer ml-2"
                onClick={handleNameEdit}
              >✏️</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500 mt-2 text-center">
          <p className="flex items-center justify-center">
            <span className="text-sm mr-1">👥</span>
            {Object.keys(groupMembers).length} members
          </p>
          <p className="mt-1">
            {/* Created by {groupMembers.find(m => m.isCreator)?.name}, 12/15/2023 */}
            Created by {AdminName}
          </p>
        </div>
      </div>
    </div>
  )
}