import { doc, updateDoc, deleteField,arrayRemove } from "firebase/firestore";
import { db } from "../firebase-config";
export function ExitGroup({groupId,userId}){

const handleLeaveGroup = async () => {
  const groupRef = doc(db, "Group", groupId);
  const userRef = doc(db, "User", userId);

  try {
    // Remove user entry from group.members object
    await updateDoc(groupRef, {
      [`members.${userId}`]: deleteField(),
    });

    // Remove group from user's group list (assuming it's still an array)
    await updateDoc(userRef, {
      groupIds: arrayRemove(groupId),
    });

    alert("You have left the group");
  } catch (error) {
    console.error("Error leaving group:", error);
  }
};
    return(
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-1">
            <button className="w-full text-left py-3 px-2 hover:bg-gray-50 rounded-lg" onClick={handleLeaveGroup}>
              <span className="text-sm text-red-600">Exit group</span>
            </button>
            {/* <button className="w-full text-left py-3 px-2 hover:bg-gray-50 rounded-lg">
              <span className="text-sm text-red-600">Report group</span>
            </button> */}
          </div>
        </div>
    )
}