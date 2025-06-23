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
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase-config";
import "../ChatRoom.css";
import { auth } from "../firebase-config";
import { getAuth, signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

// Helper function to generate a unique ID for messages client-side
// In a production app, consider a more robust UUID library or server-side ID generation.
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

function ChatRoom({ chatId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  // Removed states related to meeting creation:
  // const [showMeetingForm, setShowMeetingForm] = useState(false);
  // const [meetingTitle, setMeetingTitle] = useState("");
  // const [meetingDescription, setMeetingDescription] = useState("");
  // const [meetingDateTime, setMeetingDateTime] = useState("");
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?.uid) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "User", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setDisplayName(userData.name || user.displayName || "");
          } else {
            setDisplayName(user.displayName || "");
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          setDisplayName(user.displayName || "");
        }
      };
      fetchUserData();
    } else {
      setDisplayName("");
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideMenu = event.target.closest(".dropdown-actions");
      const isClickOnDotsButton = event.target.closest(".dots-button");
      if (!isClickInsideMenu && !isClickOnDotsButton) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const chatDocRef = doc(db, "Chat", chatId);

    const unsubscribe = onSnapshot(
      chatDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const chatData = docSnap.data();
          const rawMessages = chatData.chat || [];

          const formattedMessages = rawMessages
            .map((msg) => ({
              // Use the stored 'id' for React key, fallback if old messages don't have it
              id: msg.id || generateUniqueId(), // Ensure a unique ID for React's key
              ...msg,
              createdAt: msg.createdAt?.toDate ? msg.createdAt.toDate() : null,
            }))
            .sort(
              (a, b) =>
                (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
            );

          setMessages(formattedMessages);
        } else {
          console.log("No such chat document with ID:", chatId);
          setMessages([]);
        }
      },
      (error) => {
        console.error("Error fetching chat messages:", error);
      }
    );

    scrollToBottom();
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!text.trim() || !user?.uid) return;
    if (!chatId) {
      console.error("No chatId provided for sending message.");
      return;
    }

    const newMessage = {
      id: generateUniqueId(), // Assign a unique ID to the message
      Message: text,
      createdAt: serverTimestamp(),
      uid: user.uid,
      displayName: displayName,
      photoURL: user.photoURL || null,
      pinned: false,
      replyTo: replyTo
        ? {
            id: replyTo.id, // Use the unique ID of the message being replied to
            text: replyTo.Message || replyTo.question, // Handle poll replies as well
            sender: replyTo.displayName,
          }
        : null,
    };

    try {
      await updateDoc(doc(db, "Chat", chatId), {
        chat: arrayUnion(newMessage),
      });
      setText("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Function to pin/unpin a message using its unique 'id'
  const pinMessage = async (messageIdToPin, currentPinned) => {
    if (!chatId) return;

    try {
      const chatDocRef = doc(db, "Chat", chatId);
      const docSnap = await getDoc(chatDocRef);

      if (docSnap.exists()) {
        const chatData = docSnap.data();
        const currentChatArray = chatData.chat || [];

        const updatedChatArray = currentChatArray.map((msg) => {
          if (msg.id === messageIdToPin) {
            return { ...msg, pinned: !currentPinned };
          }
          return msg;
        });

        await updateDoc(chatDocRef, {
          chat: updatedChatArray,
        });
      }
    } catch (err) {
      console.error("Failed to pin message:", err);
    }
  };

  // Function to delete a message from the 'chat' array using its unique 'id'
  const deleteMessage = async (messageToDeleteObj) => {
    if (!chatId || !messageToDeleteObj?.id) return; // Ensure messageToDeleteObj and its ID exist

    try {
      const chatDocRef = doc(db, "Chat", chatId);
      const docSnap = await getDoc(chatDocRef);

      if (docSnap.exists()) {
        const chatData = docSnap.data();
        const currentChatArray = chatData.chat || [];

        // Filter out the message based on its unique 'id'
        const updatedChatArray = currentChatArray.filter(
          (msg) => msg.id !== messageToDeleteObj.id
        );

        await updateDoc(chatDocRef, {
          chat: updatedChatArray,
        });
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const createPoll = async () => {
    if (!user?.uid || !chatId) return;
    const options = pollOptions.filter((opt) => opt.trim() !== "");
    if (!pollQuestion.trim() || options.length < 2) return;

    const newPollMessage = {
      id: generateUniqueId(), // Assign a unique ID to the poll message
      type: "poll",
      question: pollQuestion,
      options: options.map((opt) => ({ text: opt, votes: 0 })),
      votes: {},
      createdAt: serverTimestamp(),
      uid: user.uid,
      displayName: displayName,
      photoURL: user.photoURL || null,
      pinned: false,
    };

    try {
      await updateDoc(doc(db, "Chat", chatId), {
        chat: arrayUnion(newPollMessage),
      });
      setPollQuestion("");
      setPollOptions(["", ""]);
      setShowPollForm(false);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  };

  // Removed createMeeting function:
  /*
  const createMeeting = async () => {
    // ... (logic removed)
  };
  */

  // Function to handle voting on a poll using its unique 'id'
  const handleVote = async (pollMessageId, optionIndex) => {
    if (!user?.uid || !chatId) return;

    try {
      const chatDocRef = doc(db, "Chat", chatId);
      const docSnap = await getDoc(chatDocRef);

      if (docSnap.exists()) {
        const chatData = docSnap.data();
        const currentChatArray = chatData.chat || [];

        const updatedChatArray = currentChatArray.map((msg) => {
          if (msg.type === "poll" && msg.id === pollMessageId) {
            const newPoll = { ...msg };
            newPoll.votes = newPoll.votes || {};

            const previousVoteIndex = newPoll.votes[user.uid];

            if (
              previousVoteIndex !== undefined &&
              newPoll.options[previousVoteIndex]
            ) {
              newPoll.options[previousVoteIndex].votes -= 1;
            }

            if (newPoll.options[optionIndex]) {
              newPoll.options[optionIndex].votes += 1;
            }

            newPoll.votes[user.uid] = optionIndex;

            return newPoll;
          }
          return msg;
        });

        await updateDoc(chatDocRef, {
          chat: updatedChatArray,
        });
      }
    } catch (err) {
      console.error("Failed to vote on poll:", err);
    }
  };

  return (
    <div className="chat-container">
      {!chatId ? (
        <div className="no-chat-selected">
          Please select a group to view its chat.
        </div>
      ) : (
        <>
          <h2 className="chat-title">Chat Room (Chat ID: {chatId})</h2>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages-placeholder">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                const messageTextContent =
                  msg.type === "poll" ? null : msg.Message; // Removed meeting type check

                return (
                  <div key={msg.id} className="chat-message-wrapper">
                    <div
                      className={`chat-message ${msg.pinned ? "pinned" : ""} ${
                        msg.uid === user?.uid ? "own-message" : ""
                      }`}
                    >
                      {msg.photoURL && (
                        <img
                          src={msg.photoURL}
                          alt="User Avatar"
                          className="message-avatar"
                        />
                      )}
                      <p className="message-sender">
                        {msg.displayName || "Anonymous"}
                      </p>
                      {msg.replyTo && (
                        <div className="message-reply">
                          ↪ Replying to <strong>{msg.replyTo.sender}:</strong>{" "}
                          {msg.replyTo.text}
                        </div>
                      )}
                      {msg.type === "poll" ? (
                        <div>
                          <p className="message-text">
                            <strong>📊 {msg.question}</strong>
                          </p>
                          {msg.options &&
                            msg.options.map((opt, idx) => {
                              const isSelected = msg.votes?.[user?.uid] === idx;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleVote(msg.id, idx)} // Pass message ID
                                  className={`poll-option ${
                                    isSelected ? "poll-selected" : ""
                                  }`}
                                >
                                  {opt.text} ({opt.votes || 0} votes)
                                </button>
                              );
                            })}
                        </div>
                      ) : (
                        // Regular text message (removed meeting card rendering)
                        <p className="message-text">{messageTextContent}</p>
                      )}
                      {msg.createdAt && (
                        <div className="message-timestamp">
                          {msg.createdAt.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Message Actions (dots button, dropdown) */}
                    {user && msg.uid === user.uid && (
                      <div className="message-actions">
                        <button
                          className="dots-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenuId(
                              openActionMenuId === msg.id ? null : msg.id // Use message ID
                            );
                          }}
                        >
                          ...
                        </button>

                        {openActionMenuId === msg.id && ( // Use message ID
                          <div className="dropdown-actions">
                            <button
                              onClick={() => {
                                setReplyTo(msg);
                                setOpenActionMenuId(null);
                              }}
                            >
                              Reply
                            </button>
                            {msg.type !== "poll" && ( // Only allow pinning regular messages (removed meeting type)
                              <button
                                onClick={() => {
                                  pinMessage(msg.id, msg.pinned); // Pass message ID
                                  setOpenActionMenuId(null);
                                }}
                              >
                                {msg.pinned ? "Unpin" : "📌 Pin"}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setMessageToDelete(msg);
                                setShowDeletePopup(true);
                                setOpenActionMenuId(null);
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          {showDeletePopup && (
            <div
              className="modal-overlay"
              onClick={() => setShowDeletePopup(false)}
            >
              <div
                className="delete-popup"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="popup-title">Delete this message?</p>
                <div className="popup-buttons">
                  <button
                    className="delete-btn"
                    onClick={async () => {
                      await deleteMessage(messageToDelete);
                      setShowDeletePopup(false);
                      setMessageToDelete(null);
                    }}
                  >
                    Delete for Everyone
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowDeletePopup(false);
                      setMessageToDelete(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {replyTo && (
            <div className="reply-preview">
              <small>
                Replying to:{" "}
                {replyTo.Message ||
                  replyTo.question || // Added reply to poll question
                  "a message"}
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
                    const updated = [...pollOptions];
                    updated[idx] = e.target.value;
                    setPollOptions(updated);
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() => setPollOptions([...pollOptions, ""])}
              >
                Add Option
              </button>
              <div className="poll-form-buttons">
                <button
                  className="poll-close-button"
                  onClick={() => setShowPollForm(false)}
                >
                  × Close
                </button>
                <button
                  type="button"
                  onClick={createPoll}
                  className="poll-submit-button"
                >
                  Submit Poll
                </button>
              </div>
            </div>
          )}
          {/* Removed showMeetingForm JSX block:
          {showMeetingForm && (
            // ... (meeting form JSX removed)
          )}
          */}
          <form
            className="chat-input-area"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              ➕
            </button>
            {/* Removed showMeetingForm from dropdown condition */}
            {showDropdown && !showPollForm && (
              <div className="dropdown-menu">
                <button
                  type="button"
                  onClick={() => {
                    setShowPollForm(true);
                    setShowDropdown(false);
                  }}
                >
                  📊 Poll
                </button>
                {/* Removed Meeting button from dropdown menu:
                <button
                  type="button"
                  onClick={() => {
                    setShowMeetingForm(true);
                    setShowDropdown(false);
                  }}
                >
                  📅 Meeting
                </button>
                */}
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
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default ChatRoom;
