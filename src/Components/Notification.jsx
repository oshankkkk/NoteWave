import React, { useState, useEffect } from "react";
import {collection,query,where,onSnapshot,doc,getDoc,} from "firebase/firestore";
import { db } from "../firebase-config";
import { useUser } from "../AuthContext";
import { acceptInvitation } from "../Firebase/Invitations";

function Notification() {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [activeTab, setActiveTab] = useState("received");
  const [invitationsReceived, setInvitationsReceived] = useState([]);
  const [invitationsSent, setInvitationsSent] = useState([]);

  const { user } = useUser();

  // Realtime listener for Invitations
  useEffect(() => {
    if (!user) return;

    const receivedQuery = query(
      collection(db, "Invitations"),
      where("receiverEmail", "==", user.email)
    );
    const sentQuery = query(
      collection(db, "Invitations"),
      where("senderId", "==", user.uid)
    );

    const unsubReceived = onSnapshot(receivedQuery, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const groupSnap = await getDoc(doc(db, "Group", data.groupId));
          const groupName = groupSnap.exists() ? groupSnap.data().Name : "Unknown Group";
          return { id: docSnap.id, groupName, ...data };
        })
      );
      setInvitationsReceived(data);
    });

    const unsubSent = onSnapshot(sentQuery, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const groupSnap = await getDoc(doc(db, "Group", data.groupId));
          const groupName = groupSnap.exists() ? groupSnap.data().Name : "Unknown Group";
          return { id: docSnap.id, groupName, ...data };
        })
      );
      setInvitationsSent(data);
    });

    return () => {
      unsubReceived();
      unsubSent();
    };
  }, [user]);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".notification-wrapper")) {
        setShowNotificationModal(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);


  return (
    <div className="ml-3 relative notification-wrapper">
      <i
        className="fa-solid fa-bell text-xl hover:cursor-pointer hover:text-fuchsia-700"
        onClick={() => setShowNotificationModal(!showNotificationModal)}
      ></i>

      {showNotificationModal && (
        <div className="absolute right-0 top-full mt-4 w-[460px] max-h-[500px] overflow-y-auto bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowNotificationModal(false)}
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          <h2 className="text-lg font-bold px-4 pt-4 pb-2 text-center text-gray-800">
            Notifications
          </h2>

          {/* Tabs */}
          <div className="flex justify-around px-4 pt-2 pb-3 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("received")}
              className={`text-sm font-semibold px-3 py-1 rounded-t ${
                activeTab === "received"
                  ? "text-fuchsia-800 border-b-2 border-fuchsia-800"
                  : "text-gray-600 hover:text-fuchsia-800"
              }`}
            >
              Invitations Received
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`text-sm font-semibold px-3 py-1 rounded-t ${
                activeTab === "sent"
                  ? "text-fuchsia-800 border-b-2 border-fuchsia-800"
                  : "text-gray-600 hover:text-fuchsia-800"
              }`}
            >
              Invitations Sent
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-3 text-gray-700 text-sm space-y-3">
            {activeTab === "received" && invitationsReceived.length === 0 && (
              <p className="text-center text-gray-500">No received invitations.</p>
            )}
            {activeTab === "sent" && invitationsSent.length === 0 && (
              <p className="text-center text-gray-500">No sent invitations.</p>
            )}

            {activeTab === "received" &&
              invitationsReceived.map((inv) => (
                <div key={inv.id} className="bg-fuchsia-50 p-3 rounded border shadow-sm">
                  <p>
                    <strong>{inv.senderName || "Someone"}</strong> invited you to{" "}
                    <strong>{inv.groupName}</strong>
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={async () => {
                        await acceptInvitation(inv.id, user.uid, inv.groupId, user.email);
                      }}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Join
                    </button>
                    <button className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500">
                      Ignore
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "sent" &&
              invitationsSent.map((inv) => (
                <div key={inv.id} className="bg-gray-50 p-3 rounded border shadow-sm">
                  <p>
                    You invited <strong>{inv.receiverEmail}</strong> to{" "}
                    <strong>{inv.groupName}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Status: {inv.status}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notification;
