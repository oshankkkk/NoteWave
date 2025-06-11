// Imports remain unchanged
import React, { useState, useEffect } from "react";
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
} from "firebase/firestore";
import { db } from "../firebase";
import "../ChatRoom.css";

function ChatRoom({ user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [meetingDateTime, setMeetingDateTime] = useState("");
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  // NEW: State for displayName fetched from Firestore "User" collection
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  // NEW: Fetch user display name from Firestore on user.uid change
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
    const q = query(collection(db, "Chat"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, "Chat"), {
        text,
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: displayName, // use Firestore name here
        photoURL: user.photoURL,
        pinned: false,
        replyTo: replyTo?.id || null,
      });
      setText("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const pinMessage = async (id, currentPinned) => {
    try {
      await updateDoc(doc(db, "Chat", id), { pinned: !currentPinned });
    } catch (err) {
      console.error("Failed to pin message:", err);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await deleteDoc(doc(db, "Chat", id));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const createPoll = async () => {
    const options = pollOptions.filter((opt) => opt.trim() !== "");
    if (!pollQuestion.trim() || options.length < 2) return;

    await addDoc(collection(db, "Chat"), {
      type: "poll",
      question: pollQuestion,
      options: options.map((opt) => ({ text: opt, votes: 0 })),
      votes: {},
      createdAt: serverTimestamp(),
      uid: user.uid,
      displayName: displayName, // Firestore name here
    });

    setPollQuestion("");
    setPollOptions(["", ""]);
    setShowPollForm(false);
    setShowDropdown(false);
  };

  const createMeeting = async () => {
    if (!meetingTitle || !meetingDateTime) return;

    const meetLink = `https://meet.google.com/lookup/${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    await addDoc(collection(db, "Chat"), {
      type: "meeting",
      title: meetingTitle,
      description: meetingDescription,
      dateTime: meetingDateTime,
      meetLink,
      createdAt: serverTimestamp(),
      uid: user.uid,
      displayName: displayName, // Firestore name here
    });

    setMeetingTitle("");
    setMeetingDescription("");
    setMeetingDateTime("");
    setShowMeetingForm(false);
    setShowDropdown(false);
  };

  const handleVote = async (pollId, optionIndex) => {
    const refDoc = doc(db, "Chat", pollId);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) return;
    const poll = snap.data();

    const previousVoteIndex = poll.votes[user.uid];
    if (previousVoteIndex !== undefined) {
      poll.options[previousVoteIndex].votes -= 1;
    }
    poll.options[optionIndex].votes += 1;
    poll.votes[user.uid] = optionIndex;

    await updateDoc(refDoc, {
      options: poll.options,
      votes: poll.votes,
    });
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Chat Room</h2>

      <div className="chat-messages">
        {messages.map((msg) => {
          const isOwnMessage = msg.uid === user.uid;

          return (
            <div key={msg.id} className="chat-message-wrapper">
              <div className={`chat-message ${msg.pinned ? "pinned" : ""}`}>
                <p className="message-sender">{msg.displayName}</p>

                {msg.replyTo && (
                  <div className="message-reply">
                    ↪ Reply to{" "}
                    {messages.find((m) => m.id === msg.replyTo)?.text ||
                      "Unknown"}
                  </div>
                )}

                {msg.type === "poll" ? (
                  <div>
                    <p className="message-text">
                      <strong>{msg.question}</strong>
                    </p>
                    {msg.options.map((opt, idx) => {
                      const isSelected = msg.votes?.[user.uid] === idx;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleVote(msg.id, idx)}
                          className={`poll-option ${
                            isSelected ? "poll-selected" : ""
                          }`}
                        >
                          {opt.text} ({opt.votes} votes)
                        </button>
                      );
                    })}
                  </div>
                ) : msg.type === "meeting" ? (
                  <div className="meeting-card">
                    <h4>{msg.title}</h4>
                    <p>{msg.description}</p>
                    <p>
                      <strong>Scheduled:</strong>{" "}
                      {new Date(msg.dateTime).toLocaleString()}
                    </p>
                    {msg.meetLink && (
                      <a
                        href={msg.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="join-link"
                      >
                        🔗 Join
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="message-text">{msg.text}</p>
                )}

                {msg.createdAt?.toDate && (
                  <div className="message-timestamp">
                    {msg.createdAt.toDate().toLocaleString()}
                  </div>
                )}
              </div>

              <div className="message-actions">
                <button
                  className="dots-button"
                  onClick={() =>
                    setOpenActionMenuId(
                      openActionMenuId === msg.id ? null : msg.id
                    )
                  }
                >
                  ...
                </button>

                {openActionMenuId === msg.id && (
                  <div className="dropdown-actions">
                    <button onClick={() => setReplyTo(msg)}>Reply</button>
                    <button onClick={() => pinMessage(msg.id, msg.pinned)}>
                      {msg.pinned ? "Unpin" : "📌 Pin"}
                    </button>
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
            </div>
          );
        })}
      </div>

      {showDeletePopup && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeletePopup(false)}
        >
          <div className="delete-popup" onClick={(e) => e.stopPropagation()}>
            <p className="popup-title">Delete this message?</p>
            <div className="popup-buttons">
              <button
                className="delete-btn"
                onClick={async () => {
                  await deleteMessage(messageToDelete.id);
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
          <small>Replying to: {replyTo.text}</small>
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
          <button onClick={() => setPollOptions([...pollOptions, ""])}>
            Add Option
          </button>
          <div className="poll-form-buttons">
            <button
              className="poll-close-button"
              onClick={() => setShowPollForm(false)}
            >
              × Close
            </button>
            <button onClick={createPoll} className="poll-submit-button">
              Submit Poll
            </button>
          </div>
        </div>
      )}

      {showMeetingForm && (
        <div className="poll-form">
          <input
            type="text"
            placeholder="Meeting Title"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
          />
          <textarea
            placeholder="Meeting Description"
            value={meetingDescription}
            onChange={(e) => setMeetingDescription(e.target.value)}
          />
          <input
            type="datetime-local"
            value={meetingDateTime}
            onChange={(e) => setMeetingDateTime(e.target.value)}
          />
          <div className="poll-form-buttons">
            <button
              className="poll-close-button"
              onClick={() => setShowMeetingForm(false)}
            >
              × Close
            </button>
            <button onClick={createMeeting} className="poll-submit-button">
              Schedule Meeting
            </button>
          </div>
        </div>
      )}

      {/* ✅ Updated to use <form> for sending messages */}
      <form
        className="chat-input-area"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <button type="button" onClick={() => setShowDropdown((prev) => !prev)}>
          ➕
        </button>
        {showDropdown && !showPollForm && !showMeetingForm && (
          <div className="dropdown-menu">
            <button type="button" onClick={() => setShowPollForm(true)}>
              📊 Poll
            </button>
            <button type="button" onClick={() => setShowMeetingForm(true)}>
              📅 Meeting
            </button>
          </div>
        )}
        <input
          className="chat-input"
          type="text"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="send-button" type="submit" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
