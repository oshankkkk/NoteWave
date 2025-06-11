import React, { useEffect, useState } from 'react';

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

  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

function Calendar({ initialEvents = [] }) {
  // Local state for events and selected date
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Initialize ScheduleX calendar app with views and plugins
  const calendar = useCalendarApp({
    views: [createViewMonthGrid(), createViewWeek()],
    selectedDate,
    events,
    plugins: [createEventModalPlugin(), createDragAndDropPlugin()],
  });

  // Sync ScheduleX calendar events whenever `events` state changes
  useEffect(() => {
    if (events && events.length > 0 && calendar) {
      console.log('🔄 Syncing events with ScheduleX');
      calendar.events.update(events);

      const currentEvents = calendar.events.getAll();
      console.log('📋 Events currently shown in the calendar:', currentEvents);
    }
  }, [events, calendar]);

  // When component mounts or initialEvents change, load them
  useEffect(() => {
    if (initialEvents.length > 0) {
      console.log('⏳ Loading initial events passed as prop:', initialEvents.length);

      // Assume initialEvents are in Google event format, so map and format
      const googleEvents = initialEvents.map((event) => {
        const rawStart = event.start?.dateTime || `${event.start?.date}T00:00:00`;
        const rawEnd = event.end?.dateTime || `${event.end?.date}T23:59:00`;

        return {
          id: event.id || Date.now().toString(),
          title: event.summary || 'No Title',
          start: formatForScheduleX(rawStart),
          end: formatForScheduleX(rawEnd),
        };
      });

      setEvents(googleEvents);

      // Jump to first event's start date if available
      if (googleEvents.length > 0) {
        setSelectedDate(googleEvents[0].start.split(' ')[0]);
      }
    }
  }, [initialEvents]);

  // Google API credentials
  const GOOGLE_API_KEY = 'AIzaSyBOH2oXTIO0MvK-eOgUvsqmiOLBWzm6-Dw';
  const GOOGLE_CLIENT_ID =
    '19900462508-vbkiucsn95h5kususcc8qc05uf5s00o3.apps.googleusercontent.com';

  /**
   * Fetch events from Google Calendar using accessToken
   */
  const fetchGoogleCalendarEvents = (accessToken) => {
    console.log('📡 Starting fetchGoogleCalendarEvents with token:', accessToken);

    window.gapi.load('client', () => {
      console.log('✅ gapi client loaded');

      window.gapi.client
        .init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
          ],
        })
        .then(() => {
          console.log('✅ gapi client initialized');

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

          // Filter out events with no summary or no start time
          const validEvents = allItems.filter(
            (event) => event.summary && (event.start?.dateTime || event.start?.date)
          );

          console.log('✅ Valid (non-empty) events:', validEvents.length);
          console.table(validEvents.slice(0, 5));

          // Map Google events into ScheduleX event format
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

          // Update local state with Google events
          //setEvents();
          const scheduleXEvents = googleEvents.map(event => ({
            id: event.id,
            title: event.title,
            start: formatForScheduleX(event.start),
            end: formatForScheduleX(event.end),
          }));
          
          // Then update the calendar once with the full array
          calendar.events.set(scheduleXEvents);
          //calendar.events.set([event]);
          console.log(googleEvents);

          // Update selectedDate to first event's start date if available
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

    const start = prompt('Enter start datetime (YYYY-MM-DD HH:mm):');
    if (!start) return;

    const end = prompt('Enter end datetime (YYYY-MM-DD HH:mm):');
    if (!end) return;

    const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!dateTimeRegex.test(start) || !dateTimeRegex.test(end)) {
      alert('❌ Please use the format: YYYY-MM-DD HH:mm');
      return;
    }

    const newEvent = {
      id: Date.now().toString(),
      title,
      start,
      end,
    };

    if (calendar?.events) {
      const updatedEvents = [...calendar.events.getAll(), newEvent];
      calendar.events.update(updatedEvents);
      setEvents(updatedEvents);
      console.log('✅ Added new event:', newEvent);
    } else {
      console.warn('⛔ Calendar not ready yet. Try again in a few seconds.');
    }
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
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}
      >
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

      {/* Render the calendar */}
      {calendar && <ScheduleXCalendar calendarApp={calendar} />}
    </div>
  );
}

export default Calendar;