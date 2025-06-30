import GroupDescription from "./GroupDes";
import GroupNameAndAvatar from "./GroupNameAvatar";
import MemberList from "./MemberList";
import { useState,useEffect } from "react";
import { db } from "../firebase-config";
import { ExitGroup } from "./ExitGroup";
export default function GroupSideBar({groupData,userId,setActiveSideBar}){
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

    return(
<div className=" inset-y-0 right-0  w-1/4 absolute">
      <div className="bg-green-600 text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Group info</h2>

        {/* <button className="text-2xl cursor-pointer hover:bg-green-700 rounded p-1">×</button> */}
        <button onClick={setActiveSideBar(false)} className="text-2xl cursor-pointer hover:bg-green-700 rounded p-1">×</button>
      </div>
 <div className="flex-1 overflow-y-auto">

<GroupNameAndAvatar groupMembers={groupData.Member} adminId={groupData.Admin} name={groupData.Name} groupId={groupData.id}></GroupNameAndAvatar>
<GroupDescription description={groupData.Description} groupId={groupData.id}></GroupDescription>
<MemberList members={groupData.Member} adminId={groupData.Admin}></MemberList>
<ExitGroup groupId={groupData.id} userId={userId} ></ExitGroup>
 </div>
</div>
    )
}