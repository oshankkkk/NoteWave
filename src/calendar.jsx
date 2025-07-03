import React, { useEffect, useState, useRef } from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewMonthGrid, createViewWeek } from "@schedule-x/calendar";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import "@schedule-x/theme-default/dist/calendar.css";
import "./calendar.css";
import { createGoogleMeetEvent } from "./meetingUtils";

function AddMeetingForm({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!title || !date || !time || !duration) {
      alert("Fill in all fields");
      return;
    }
    
    // Validate duration is a positive number
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      alert("Duration must be a positive number");
      return;
    }
    
    // Validate date and time
    const startDateTime = new Date(`${date}T${time}`);
    if (isNaN(startDateTime.getTime())) {
      alert("Invalid date or time");
      return;
    }
    
    setIsSubmitting(true);
    const endDateTime = new Date(startDateTime.getTime() + durationNum * 60000);
    onSubmit({ title, start: startDateTime, end: endDateTime });
    onClose();
  };

  return (
    <div className="calendar-modal-overlay">
      <div className="calendar-modal-box">
        <h2>Schedule Google Meet</h2>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <label>Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <label>Duration (minutes)</label>
        <input
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
        />
        <div
          className="calendar-modal-actions"
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ backgroundColor: "#9333ea", color: "white" }}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to format datetime for ScheduleX
function formatForScheduleX(dateTimeString) {
  const dt = new Date(dateTimeString);
  const localYear = dt.getFullYear();
  const localMonth = String(dt.getMonth() + 1).padStart(2, '0');
  const localDay = String(dt.getDate()).padStart(2, '0');
  const localHour = String(dt.getHours()).padStart(2, '0');
  const localMinute = String(dt.getMinutes()).padStart(2, '0');

  return `${localYear}-${localMonth}-${localDay} ${localHour}:${localMinute}`;
}

function Calendar() {
  const [accessToken, setAccessToken] = useState(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [events, setEvents] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const scriptRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
      console.log("✅ gapi script already loaded");
      return;
    }

    scriptRef.current = document.createElement("script");
    scriptRef.current.src = "https://apis.google.com/js/api.js";
    scriptRef.current.onload = () => console.log("✅ gapi script loaded");
    document.body.appendChild(scriptRef.current);

    // Cleanup function
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, []);

  const calendar = useCalendarApp({
    views: [createViewMonthGrid(), createViewWeek()],
    selectedDate,
    events: events || [],
    plugins: [createEventModalPlugin(), createDragAndDropPlugin()],
  });

  const showToast = (msg) => {
    // Clear existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(""), 3000);
  };

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("calendarAccessToken");
    if (token) setAccessToken(token);
  }, []);

  useEffect(() => {
    if (accessToken && calendar?.events?.set) {
      fetchGoogleCalendarEvents(accessToken);
    }
  }, [accessToken, calendar]);

  const fetchGoogleCalendarEvents = (token) => {
    if (!calendar?.events?.set) {
      console.warn("⚠ Calendar not ready yet, skipping fetch");
      return;
    }

    setIsLoading(true);

    window.gapi.load("client", () => {
      window.gapi.client
        .init({
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
          ],
        })
        .then(() => {
          window.gapi.client.setToken({ access_token: token });
          return window.gapi.client.load("calendar", "v3");
        })
        .then(() => {
          return window.gapi.client.calendar.events.list({
            calendarId: "primary",
            maxResults: 5000,
            singleEvents: true,
            orderBy: "startTime",
          });
        })
        .then((response) => {
          const validEvents = (response.result.items || []).filter(
            (event) =>
              event.summary && (event.start?.dateTime || event.start?.date)
          );

          const mapped = validEvents.map((event) => {
            const start = event.start.dateTime || `${event.start.date}T00:00:00`;
            const end = event.end.dateTime || `${event.end.date}T23:59:00`;
            const hasLink = Boolean(event.hangoutLink);
            return {
              id: event.id,
              title: event.summary,
              start: formatForScheduleX(start),
              end: formatForScheduleX(end),
              description: event.description || (hasLink ? `Your Meeting link: ${event.hangoutLink}` : ""),
            };
          });

          console.log("✅ Events mapped:", mapped);
          calendar.events.set(mapped);
          setEvents(mapped);

          // Safe access to first event
          if (mapped.length > 0 && mapped[0]?.start) {
            const firstEventDate = mapped[0].start.split(" ")[0];
            if (firstEventDate) {
              setSelectedDate(firstEventDate);
            }
          }
        })
        .catch((err) => {
          console.error("❌ Fetch Error:", err);
          setEvents([]);
          showToast("❌ Failed to load calendar events");
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  const handleCreateMeeting = async (meetingData) => {
    if (!accessToken) {
      alert("Please sign in first.");
      return;
    }
    setIsLoading(true);
    try {
      const event = await createGoogleMeetEvent(accessToken, meetingData);
      const meetLink = event.hangoutLink;

      const newEvent = {
        id: event.id,
        title: event.summary,
        start: formatForScheduleX(event.start.dateTime),
        end: formatForScheduleX(event.end.dateTime),
        description: meetLink ? `Join Meeting: ${meetLink}` : "",
      };

      const updated = [...(events || []), newEvent];
      setEvents(updated);
      calendar?.events?.set?.(updated);
      showToast("✅ Meeting created and added to calendar!");
    } catch (err) {
      console.error("❌ Meet creation failed:", err);
      showToast("❌ Failed to create meeting");
    } finally {
      setIsLoading(false);
    }
  };

  if (events === null || isLoading) {
    return (
      <div style={{ padding: "20px", fontSize: "18px" }}>
        {isLoading ? "Loading..." : "Loading calendar events..."}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
        }}
      >
        <button
          className="calendar-add-meeting-btn"
          onClick={() => setShowMeetingForm(true)}
          disabled={isLoading}
          style={{
            backgroundColor: "#ad5eeb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isLoading ? "not-allowed" : "pointer",
            padding: "7px",
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          + Add Meeting
        </button>
      </div>

      {showMeetingForm && (
        <AddMeetingForm
          onClose={() => setShowMeetingForm(false)}
          onSubmit={handleCreateMeeting}
        />
      )}

      <ScheduleXCalendar key={selectedDate} calendarApp={calendar} />

      {toastMessage && (
        <div
          className="calendar-toast-message"
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#323232",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            zIndex: 999,
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export { Calendar, AddMeetingForm };