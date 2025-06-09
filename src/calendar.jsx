import React, { useState } from 'react';

// ScheduleX core components and plugins
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewMonthGrid, createViewWeek } from '@schedule-x/calendar';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';

// CSS for ScheduleX and custom styling
import '@schedule-x/theme-default/dist/calendar.css';
import './calendar.css';

/**
 * Converts ISO datetime string into ScheduleX format: 'YYYY-MM-DD HH:mm'
 */
const formatForScheduleX = (isoString) => {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    console.warn('⛔ Invalid date format:', isoString);
    return '';
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  const formatted = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  console.log(`📆 ${isoString} → ${formatted}`);
  return formatted;
};

function Calendar() {
  // Local state for events and selected date
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0] // Default to today
  );

  // Google API credentials
  const GOOGLE_API_KEY = 'AIzaSyBOH2oXTIO0MvK-eOgUvsqmiOLBWzm6-Dw';
  const GOOGLE_CLIENT_ID = '19900462508-vbkiucsn95h5kususcc8qc05uf5s00o3.apps.googleusercontent.com';

  // Initialize ScheduleX calendar app with views and plugins
  const calendar = useCalendarApp({
    views: [createViewMonthGrid(), createViewWeek()],
    selectedDate,
    events,
    plugins: [createEventModalPlugin(), createDragAndDropPlugin()],
  });

  /**
   * Fetch events from Google Calendar using accessToken
   */
  const fetchGoogleCalendarEvents = (accessToken) => {
    console.log('📡 Starting fetchGoogleCalendarEvents with token:', accessToken);

    // Load the gapi client
    window.gapi.load('client', () => {
      console.log('✅ gapi client loaded');

      // Initialize Google API client
      window.gapi.client
        .init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
          ],
        })
        .then(() => {
          console.log('✅ gapi client initialized');

          // Request primary calendar events
          return window.gapi.client.request({
            path: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        })
        .then((response) => {
          const allItems = response.result.items || [];
          console.log('📦 Raw items:', allItems.length);

          // Filter only events with a title and start time
          const validEvents = allItems.filter(
            (event) => event.summary && (event.start?.dateTime || event.start?.date)
          );

          console.log('✅ Valid (non-empty) events:', validEvents.length);
          console.table(validEvents.slice(0, 5)); // Show top 5 for quick review

          // Format Google events into ScheduleX format
          const googleEvents = validEvents.map((event) => {
            const rawStart = event.start.dateTime || `${event.start.date}T00:00:00`;
            const rawEnd = event.end.dateTime || `${event.end.date}T23:59:00`;

            return {
              id: event.id,
              title: event.summary || 'No Title',
              start: formatForScheduleX(rawStart),
              end: formatForScheduleX(rawEnd),
            };
          });

          console.log('🧩 Mapped Events for ScheduleX:', googleEvents.slice(0, 5));
          setEvents([...googleEvents]); // Update state with new events

          // Jump calendar to the first event's date
          if (googleEvents.length > 0) {
            const firstDate = googleEvents[0].start.split(' ')[0];
            console.log('📍 Jumping calendar to:', firstDate);
            setSelectedDate(firstDate);
          }
        })
        .catch((err) => {
          console.error('❌ Error in fetchGoogleCalendarEvents:', err);
        });
    });
  };

  /**
   * Handles Google login and token request
   */
  const handleGoogleAuth = () => {
    if (!window.google || !window.google.accounts) {
      alert('Google Identity Services SDK not loaded.');
      return;
    }

    // Initialize token client to request access token
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      prompt: 'consent',
      callback: (tokenResponse) => {
        console.log('✅ Access Token received:', tokenResponse.access_token);
        fetchGoogleCalendarEvents(tokenResponse.access_token);
      },
    });

    tokenClient.requestAccessToken();
  };

  /**
   * Allows user to manually add an event via prompt
   */
  const addEvent = () => {
    const title = prompt('Enter event title:');
    if (!title) return;

    const startInput = prompt('Enter start datetime (YYYY-MM-DDTHH:mm:ss):');
    if (!startInput) return;

    const endInput = prompt('Enter end datetime (YYYY-MM-DDTHH:mm:ss):');
    if (!endInput) return;

    const newEvent = {
      id: Date.now(),
      title,
      start: formatForScheduleX(startInput),
      end: formatForScheduleX(endInput),
    };

    setEvents((prev) => [...prev, newEvent]);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Google Login Button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleGoogleAuth}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sign in with Google
        </button>
      </div>

      {/* Add Event Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button
          onClick={addEvent}
          style={{
            padding: '8px 16px',
            backgroundColor: '#9333ea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          + Add Event
        </button>
      </div>

      {/* Render the calendar, re-renders when selectedDate changes */}
      <ScheduleXCalendar key={selectedDate} calendarApp={calendar} />
    </div>
  );
}

export default Calendar;