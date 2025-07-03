import GroupDescription from "./GroupDes";
import GroupNameAndAvatar from "./GroupNameAvatar";
import MemberList from "./MemberList";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { ExitGroup } from "./ExitGroup";
export default function GroupSideBar({ groupData, userId, setActiveSideBar }) {
  const [groupInfo, setGroupInfo] = useState(null);

  // useEffect(() => {
  //     const fetchGroupInfo = async () => {
  //       const docRef = doc(db, "Group", groupData.id);
  //       const docSnap = await getDoc(docRef);

  //       if (docSnap.exists()) {
  //         const data = docSnap.data();
  //         setGroupInfo({
  //           adminId: data.Admin,
  //           members: Object.keys(data.Member || {}),
  //           icon: data.Icon,
  //           description: data.Description,
  //           name: data.Name,
  //         });
  //       } else {
  //         console.log("No such group!");
  //       }
  //     };

  //     fetchGroupInfo();
  //   }, [groupId]);

  return (

    <div className="right-0 w-1/4 fixed h-screen bg-white shadow">
      <div className="bg-[#ae49c5] text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Group info</h2>
        <button
          onClick={() => setActiveSideBar(false)}
          className="text-2xl cursor-pointer hover:bg-purple-700 rounded p-1"
        >
          ×
        </button>
      </div>

      <div className="flex flex-col h-[calc(92vh-64px)]">
        {/* Adjust 64px if your header is a different height */}

        <GroupNameAndAvatar
          groupMembers={groupData.Member}
          adminId={groupData.Admin}
          name={groupData.Name}
          groupId={groupData.id}
          groupIcon={groupData.Icon}
        />
        <GroupDescription
          description={groupData.Description}
          groupId={groupData.id}
        />

        {/* Make only the member list scrollable */}
        <div className="overflow-y-auto grow">
          <MemberList
            members={groupData.Member}
            adminId={groupData.Admin}
          />
        </div>

        {/* Exit button always visible at the bottom */}
        <ExitGroup groupId={groupData.id} userId={userId} />
      </div>
    </div>
  );

}