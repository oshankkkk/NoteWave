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

function ChatRoom2({ chatId, chatName, chatIcon }) {
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
  const [adminUids, setAdminUids] = useState([]);
  const isAdmin = user?.uid && adminUids.includes(String(user.uid));

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

  // Fetch admin UIDs
  useEffect(() => {
    if (!chatId) return;

    const fetchAdmins = async () => {
      console.log("📢 fetchAdmins called for chatId:", chatId); // <-- ADD THIS
      const groupRef = doc(db, "Group", chatId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        setAdminUids(groupData.Admin || []);

        // 🧪 Debug logs here
        console.log("Fetched Admin UIDs:", groupData.Admin);
        console.log("Logged-in UID:", auth.currentUser?.uid);
        console.log(
          "Is Admin:",
          groupData.Admin?.includes(String(auth.currentUser?.uid))
        );
      }
    };

    fetchAdmins();
  }, [chatId]);


  // Listen for chat messages
  useEffect(() => {
    if (!chatId) return setMessages([]);

    const q = query(collection(db, "Chat", chatId, "messages"), orderBy("time"));
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
    return AddMeetingForm;
  };

  return (
    <div className="chat-container">
      {!chatId ? (
        <div className="no-chat-selected">
          Please select a group to view its chat.
        </div>
      ) : (
        <>
          <div className="chat-title-c">
            <img src={`/Images/publicGroupIcons/${chatIcon}`} alt="Chat Icon" />
            <h2 className="chat-title">{chatName}</h2>
          </div>
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message-wrapper ${msg.uid === user?.uid ? "right" : "left"
                  }`}
              >
                {/* Dots button LEFT for own (right-aligned) messages */}
                {(msg.uid === user?.uid || isAdmin) && (
                  <div
                    className={`message-actions ${msg.uid === user?.uid ? "left-side-actions" : ""
                      }`}
                  >
                    <button
                      className="dots-button"
                      onClick={(e) => {
                        setMsgId(msg.id);
                        e.stopPropagation();
                        setOpenActionMenuId(openActionMenuId === msg.id ? null : msg.id);
                      }}
                      aria-label="Message options"
                    >
                      ⋮
                    </button>
                    {openActionMenuId === msg.id && (
                      <div
                        className={`dropdown-actions ${msg.uid === user?.uid ? "right-dropdown" : ""
                          }`}
                      >
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
                        {(msg.uid === user?.uid || isAdmin) && (
                          <button
                            onClick={() => {
                              setShowDeletePopup(true);
                              setMessageToDelete(msg.id);
                              setOpenActionMenuId(null);
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}



                <div
                  className={`chat-message ${msg.pinned ? "pinned" : ""
                    } ${msg.uid === user?.uid ? "own-message" : ""}`}
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
                          className={`poll-option ${msg.votes?.[user?.uid] === idx ? "poll-selected" : ""
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

                {/* Dots button RIGHT for other users' messages */}
                {msg.uid !== user?.uid && (
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
                      aria-label="Message options"
                    >
                      ⋮
                    </button>
                    {openActionMenuId === msg.id && (
                      <div className={`dropdown-actions`}>
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
                        {(msg.uid === user?.uid || isAdmin) && (
                          <button
                            onClick={() => {
                              setShowDeletePopup(true);
                              setMessageToDelete(msg.id);
                              setOpenActionMenuId(null);
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}

                      </div>
                    )}
                  </div>
                )}
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
                <button className="close" onClick={() => setShowPollForm(false)}>
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
                  <i className="fa-solid fa-square-poll-horizontal"></i> Poll
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
                    onSubmit={(meetingData) =>
                      createGoogleMeetEvent(meetingData)
                    }
                  />
                )}
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
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default ChatRoom2;
