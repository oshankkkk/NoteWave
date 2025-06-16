import React, { useEffect, useState } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewMonthGrid, createViewWeek } from '@schedule-x/calendar';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import '@schedule-x/theme-default/dist/calendar.css';
import './calendar.css';

const GOOGLE_API_KEY = 'AIzaSyBOH2oXTIO0MvK-eOgUvsqmiOLBWzm6-Dw';
const GOOGLE_CLIENT_ID = '19900462508-vbkiucsn95h5kususcc8qc05uf5s00o3.apps.googleusercontent.com';

const formatForScheduleX = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 🔹 AddMeetingForm component
function AddMeetingForm({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);

  const handleSubmit = () => {
    if (!title || !date || !time || !duration) return alert('Fill in all fields');
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    onSubmit({ title, start: startDateTime, end: endDateTime });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Schedule Google Meet</h2>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <label>Time</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <label>Duration (minutes)</label>
        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit} style={{ backgroundColor: '#9333ea', color: 'white' }}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function Calendar() {
  const [accessToken, setAccessToken] = useState(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const calendar = useCalendarApp({
    views: [createViewMonthGrid(), createViewWeek()],
    selectedDate,
    events,
    plugins: [createEventModalPlugin(), createDragAndDropPlugin()],
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchGoogleCalendarEvents = (token) => {
    window.gapi.load('client', () => {
      window.gapi.client
        .init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        })
        .then(() => {
          return window.gapi.client.request({
            path: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            headers: { Authorization: `Bearer ${token}` },
          });
        })
        .then((response) => {
          const validEvents = (response.result.items || []).filter(
            (event) => event.summary && (event.start?.dateTime || event.start?.date)
          );

          const mapped = validEvents.map((event) => {
            const start = event.start.dateTime || `${event.start.date}T00:00:00`;
            const end = event.end.dateTime || `${event.end.date}T23:59:00`;
            const meetLink = event.hangoutLink;
            return {
              id: event.id,
              title: event.summary,
              start: formatForScheduleX(start),
              end: formatForScheduleX(end),
              description: `Join Meeting: ${meetLink}`,
            };
          });

          calendar.events.set(mapped);
          setEvents(mapped);
          if (mapped.length > 0) {
            setSelectedDate(mapped[0].start.split(' ')[0]);
          }
        })
        .catch((err) => console.error('❌ Fetch Error:', err));
    });
  };

  const createGoogleMeetEvent = (meetingData) => {
    if (!accessToken) return alert('Please sign in first.');

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
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    window.gapi.client.request({
      path: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
          description: `Join Meeting: ${meetLink}`, // ✅ plain text now
        };

        const updated = [...events, newEvent];
        setEvents(updated);
        calendar.events.set(updated);

        showToast('✅ Meeting created and added to calendar!');
      })
      .catch((err) => console.error('❌ Meet creation failed:', err));
  };

  const handleGoogleAuth = () => {
    if (!window.google?.accounts) {
      alert('Google Identity Services SDK not loaded.');
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      prompt: 'consent',
      callback: (tokenResponse) => {
        setAccessToken(tokenResponse.access_token);
        fetchGoogleCalendarEvents(tokenResponse.access_token);
      },
    });

    tokenClient.requestAccessToken();
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 🔸 Aligned Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          onClick={handleGoogleAuth}
          style={{
            
            backgroundColor: '#ad5eeb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            
          }}
        >
          Sign in with Google
        </button>

        <button
          onClick={() => setShowMeetingForm(true)}
          style={{
            
            backgroundColor: '#ad5eeb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          + Add Meeting
        </button>
      </div>

      {showMeetingForm && (
        <AddMeetingForm
          onClose={() => setShowMeetingForm(false)}
          onSubmit={(meetingData) => {
            createGoogleMeetEvent(meetingData);
          }}
        />
      )}

      <ScheduleXCalendar key={selectedDate} calendarApp={calendar} />

      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#323232',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            zIndex: 999,
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default Calendar;