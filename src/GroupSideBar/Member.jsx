import { db } from "../firebase-config";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
export default function Member({ memberID, adminId }) {
  const [memberName, setMemberName] = useState("")
  const [memberMail, setMemberMail] = useState("")
  useEffect(() => {
    //   if (!user) return;
    const fetchUser = async () => {
      const userRef = doc(db, "User", memberID);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        console.log(data);
        console.log("HHH")
        setMemberName(data.name)
        setMemberMail(data.email)
        // setUserData(data); // or whatever you want to do
      } else {
        console.log("No such user");
      }
    };

    fetchUser();
  }, []);

  return (
    <div
      key={memberID}
      className="flex items-center space-x-3 py-3 px-2 hover:bg-gray-50 rounded-lg cursor-pointer"
    >

      <div className="flex-1 ">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900">{memberName}</p>
          {/* {member.isCreator && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Creator
            </span>
          )}
          {member.isAdmin && !member.isCreator && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Admin
            </span>
          )} */}
        </div>
        <p className="text-xs text-gray-500">{memberMail}</p>
      </div>
      {memberID === adminId && <span className="text-blue-600 text-sm">🛡️</span>}
    </div >
  );
}
