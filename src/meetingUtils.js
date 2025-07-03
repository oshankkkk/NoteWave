// src/meetingUtils.js
export async function createGoogleMeetEvent(accessToken, meetingData) {
  // Ensure gapi is loaded and initialized
  if (!window.gapi || !window.gapi.client) {
    throw new Error("Google API client not loaded");
  }
  // Set the access token
  window.gapi.client.setToken({ access_token: accessToken });
  // Prepare the event object
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
  // Make the API request
  const response = await window.gapi.client.request({
    path: "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: { conferenceDataVersion: 1 },
    body: event,
  });
  return response.result;
} 