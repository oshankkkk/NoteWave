import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import "../ChatRoom.css";
import { useUser } from "../AuthContext";
import { AddMeetingForm } from "../calendar";
import GroupSideBar from "../GroupSideBar/GroupSideBar";

function ChatRoom2({groupData, chatId, chatName, chatIcon,userId }) {
  const [activeSideBar,setActiveSideBar]=useState(true)
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [msgId, setMsgId] = useState(null);
  const [isMeeting, setMeeting] = useState(false);
  const messagesEndRef = useRef(null);
  const user2 = useUser();
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".dropdown-actions") &&
        !event.target.closest(".dots-button")
      ) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!chatId) return setMessages([]);

    const q = query(
      collection(db, "Chat", chatId, "messages"),
      orderBy("time")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          createdAt: data.time?.toDate() || null,
          time: data.time?.toDate()?.toLocaleTimeString() || "",
          name: data.sender,
          type: data.type || null,
          question: data.question || null,
          votes: data.votes || {},
          options: data.options || [],
          replyTo: data.replyTo || null,
          pinned: data.pinned || false,
          uid: data.uid,
        };
      });
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!text.trim() || !user?.uid || !chatId) return;
    try {
      await addDoc(collection(db, "Chat", chatId, "messages"), {
        text,
        time: serverTimestamp(),
        uid: user.uid,
        sender: user.displayName,
        pinned: false,
        type: "text",
        replyTo: replyTo
          ? {
              id: replyTo.id,
              text: replyTo.text || replyTo.question,
              sender: replyTo.name,
            }
          : null,
      });
      setText("");
      setReplyTo(null);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const pinMessage = async (messageId, currentPinned) => {
    try {
      const messageRef = doc(db, "Chat", chatId, "messages", messageId);
      await updateDoc(messageRef, { pinned: !currentPinned });
    } catch (err) {
      console.error("Failed to pin message:", err);
    }
  };

  const deleteMessage = async (chatId, messageId) => {
    try {
      const messageRef = doc(db, "Chat", chatId, "messages", messageId);
      await updateDoc(messageRef, { text: null });
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const createPoll = async () => {
    const options = pollOptions.filter((opt) => opt.trim() !== "");
    if (!pollQuestion.trim() || options.length < 2 || !user?.uid || !chatId)
      return;
    try {
      await addDoc(collection(db, "Chat", chatId, "messages"), {
        type: "poll",
        question: pollQuestion,
        options: options.map((opt) => ({ text: opt, votes: 0 })),
        votes: {},
        time: serverTimestamp(),
        uid: user.uid,
        sender: user.displayName,
        pinned: false,
      });
      setPollQuestion("");
      setPollOptions(["", ""]);
      setShowPollForm(false);
      setShowDropdown(false);
    } catch (err) {
      console.error("Error creating poll:", err);
    }
  };

  const handleVote = async (messageId, optionIndex) => {
    const msgRef = doc(db, "Chat", chatId, "messages", messageId);
    const snap = await getDoc(msgRef);
if (!snap.exists()) return;

    const data = snap.data();
    const prevVote = data.votes?.[user.uid];
    const updatedVotes = { ...data.votes, [user.uid]: optionIndex };
    const updatedOptions = [...data.options];

    if (prevVote !== undefined && updatedOptions[prevVote]) {
      updatedOptions[prevVote].votes -= 1;
    }
    if (updatedOptions[optionIndex]) {
      updatedOptions[optionIndex].votes += 1;
    }

    await updateDoc(msgRef, { votes: updatedVotes, options: updatedOptions });
  };

  const showMeeting = () => {
    //setMeeting(!isMeeting);
    //if (isMeeting) {
    return AddMeetingForm;
    //}
  };
  return (
    <>
    <div className="chat-container">
      {!chatId ? (
        <div className="no-chat-selected">
          Please select a group to view its chat.
        </div>
      ) : (
        <>
          <div className="chat-title-c">
{/* this button wont work for somereason */}
            {/* <button className="bg-yellow-300" onClick={()=>{setActiveSideBar(true)}} >
              click me
            </button> */}
            <img src={`/Images/publicGroupIcons/${chatIcon}`}></img>
            <h2 className="chat-title">{chatName}</h2>
          </div>
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message-wrapper`}>
                <div
                  className={`chat-message ${msg.pinned ? "pinned" : ""} ${
                    msg.uid === user2?.uid ? "own-message" : ""
                  }`}
                >
                  <p className="message-sender">{msg.name}</p>
                  {msg.replyTo && (
                    <div className="message-reply">
                      ↪ Replying to <strong>{msg.replyTo.sender}:</strong>{" "}
                      {msg.replyTo.text}
                    </div>
                  )}
                  {msg.type === "poll" ? (
                    <>
                      <p>
                        <strong>📊 {msg.question}</strong>
                      </p>
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleVote(msg.id, idx)}
                          className={`poll-option ${
                            msg.votes?.[user?.uid] === idx
                              ? "poll-selected"
                              : ""
                          }`}
                        >
                          {opt.text} ({opt.votes} votes)
                        </button>
                      ))}
                    </>
                  ) : (
                    <p className="message-text">
                      {msg.text === null ? (
                        <em>This message was deleted</em>
                      ) : (
                        msg.text
                      )}
                    </p>
                  )}
                  {msg.createdAt && (
                    <div className="message-timestamp">
                      {msg.createdAt.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="message-actions">
                  <button
                    className="dots-button"
                    onClick={(e) => {
                      setMsgId(msg.id);
                      e.stopPropagation();
                      setOpenActionMenuId(
                        openActionMenuId === msg.id ? null : msg.id
                      );
                    }}
                  >
                    ⋮
                  </button>
                  {openActionMenuId === msg.id && (
                    <div className="dropdown-actions">
                      <button
                        onClick={() => {
                          setReplyTo(msg);
                          setOpenActionMenuId(null);
                        }}
                      >
                        Reply
                      </button>
                      {msg.type !== "poll" && (
                        <button
                          onClick={() => {
                            pinMessage(msg.id, msg.pinned);
                            setOpenActionMenuId(null);
                          }}
                        >
                          {msg.pinned ? "Unpin" : "📌 Pin"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowDeletePopup(true);
                          setOpenActionMenuId(null);
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showDeletePopup && (
            <div
              className="modal-overlay"
              onClick={() => setShowDeletePopup(false)}
            >
              <div
                className="delete-warning"
                onClick={(e) => e.stopPropagation()}
              >
                <p>Delete this message?</p>
                <button
                  className="confirm-btn"
                  onClick={async () => {
                    await deleteMessage(chatId, msgId);
                    setShowDeletePopup(false);
                  }}
                >
                  Delete
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowDeletePopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {replyTo && (
            <div className="reply-preview">
              <small className="rep-msg">
                Replying to: {replyTo.text || replyTo.question}
              </small>
              <button onClick={() => setReplyTo(null)}>Cancel</button>
            </div>
          )}

          {showPollForm && (
            <div className="poll-form">
              <input
                type="text"
                placeholder="Poll question"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
              />
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[idx] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                />
              ))}
              <button
                className="add-option"
                onClick={() => setPollOptions([...pollOptions, ""])}
              >
                Add Option
              </button>
              <div className="poll-action-buttons">
                <button
                  className="close"
                  onClick={() => setShowPollForm(false)}
                >
                  Close
                </button>
                <button onClick={createPoll}>Submit Poll</button>
              </div>
            </div>
          )}

          <form
            className="chat-input-area"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <button
              type="button"
              className="plus-button"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              ➕
            </button>
            {showDropdown && !showPollForm && (
              <div className="dropdown-menu">
                <button
                  onClick={() => {
                    setShowPollForm(true);
                    setShowDropdown(false);
                  }}
                >
                  <i class="fa-solid fa-square-poll-horizontal"></i> Poll
                </button>
                <button
                  className="meeting-btn"
                  onClick={() => setShowMeetingForm(true)}

                >
                <i className="fa-solid fa-video"></i> Meeting
            </button>
            {showMeetingForm && (
              <AddMeetingForm
                  onClose={() => setShowMeetingForm(false)}
                  onSubmit={(meetingData) => createGoogleMeetEvent(meetingData)}
              />
                )}

            {" "}
              </div>
            )}
            <input
              className="chat-input"
              type="text"
              placeholder="Type a message"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              className="send-button"
              type="submit"
              disabled={!text.trim()}
            >
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </>
      )}

    <GroupSideBar groupData={groupData} userId={userId} setActiveSideBar={setActiveSideBar}></GroupSideBar>
{/* {activeSideBar==true &&

    <GroupSideBar groupData={groupData} userId={userId} setActiveSideBar={setActiveSideBar}></GroupSideBar>
} */}
    </div>

    </>
  );
}

export default ChatRoom2;
