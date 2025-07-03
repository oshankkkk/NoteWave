const GOOGLE_API_KEY = "AIzaSyCAGgSKVlzcjBpOnaPxticoDAKzCKSR_6Y";

import React, { useEffect, useState } from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewMonthGrid, createViewWeek } from "@schedule-x/calendar";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import "@schedule-x/theme-default/dist/calendar.css";
import "./calendar.css";

function AddMeetingForm({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);

  const handleSubmit = () => {
    if (!title || !date || !time || !duration)
      return alert("Fill in all fields");
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
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
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <div
          className="calendar-modal-actions"
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSubmit}
            style={{ backgroundColor: "#9333ea", color: "white" }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to format datetime for ScheduleX
function formatForScheduleX(dateTimeString) {
  const dt = new Date(dateTimeString);
  return dt.toISOString().replace("T", " ").substring(0, 16);
}

function Calendar() {
  const [accessToken, setAccessToken] = useState(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [events, setEvents] = useState(null); // Start with null to track loading state
  const [toastMessage, setToastMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => console.log("✅ gapi script loaded");
    document.body.appendChild(script);
  }, []);

  const calendar = useCalendarApp({
    views: [createViewMonthGrid(), createViewWeek()],
    selectedDate,
    events: events || [], // fallback to empty array if events is null
    plugins: [createEventModalPlugin(), createDragAndDropPlugin()],
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const fetchGoogleCalendarEvents = (token) => {
    if (!calendar?.events?.set) {
      console.warn("⚠ Calendar not ready yet, skipping fetch");
      return;
    }

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
            const start =
              event.start.dateTime || `${event.start.date}T00:00:00`;
            const end = event.end.dateTime || `${event.end.date}T23:59:00`;
            return {
              id: event.id,
              title: event.summary,
              start: formatForScheduleX(start),
              end: formatForScheduleX(end),
              description: `Join Meeting: ${event.hangoutLink || "None"}`,
            };
          });

          console.log("✅ Events mapped:", mapped);
          calendar.events.set(mapped);
          setEvents(mapped);

          if (mapped.length > 0) {
            setSelectedDate(mapped[0].start.split(" ")[0]);
          }
        })
        .catch((err) => {
          console.error("❌ Fetch Error:", err);
          setEvents([]); // Prevent infinite loading if error
        });
    });
  };

  const createGoogleMeetEvent = (meetingData) => {
    if (!accessToken) return alert("Please sign in first.");

    const event = {
      summary: meetingData.title,
      start: {
        dateTime: meetingData.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: meetingData.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    window.gapi.client
      .request({
        path: "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        method: "POST",
        headers: {
          Authorization: Bearer`${accessToken}`,
        },
        params: { conferenceDataVersion: 1 },
        body: event,
      })
      .then((response) => {
        const result = response.result;
        const meetLink = result.hangoutLink;

        const newEvent = {
          id: result.id,
          title: result.summary,
          start: formatForScheduleX(result.start.dateTime),
          end: formatForScheduleX(result.end.dateTime),
          description: `Join Meeting: ${meetLink}`,
        };

        const updated = [...events, newEvent];
        setEvents(updated);
        calendar?.events?.set?.(updated);
        showToast("✅ Meeting created and added to calendar!");
      })
      .catch((err) => console.error("❌ Meet creation failed:", err));
  };

  useEffect(() => {
    const token = localStorage.getItem("calendarAccessToken");
    if (token) setAccessToken(token);
  }, []);

  useEffect(() => {
    if (accessToken && calendar?.events?.set) {
      fetchGoogleCalendarEvents(accessToken);
    }
  }, [accessToken, calendar]);

  if (events === null) {
    return (
      <div style={{ padding: "20px", fontSize: "18px" }}>
        Loading calendar events...
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
          style={{
            backgroundColor: "#ad5eeb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            padding: "7px",
          }}
        >
          + Add Meeting
        </button>
      </div>

      {showMeetingForm && (
        <AddMeetingForm
          onClose={() => setShowMeetingForm(false)}
          onSubmit={(meetingData) => createGoogleMeetEvent(meetingData)}
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
