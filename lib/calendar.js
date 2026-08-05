import { google } from "googleapis";

// Marker stored in every event we create, so we can find "our" events later
// without needing our own database.
const MARKER = "[subscription-reminder]";

function getCalendarClient(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

export async function listSubscriptions(accessToken) {
  const calendar = getCalendarClient(accessToken);
  const res = await calendar.events.list({
    calendarId: "primary",
    q: MARKER,
    singleEvents: false, // return recurring masters once, not every instance
    maxResults: 250,
  });

  return (res.data.items || [])
    .filter((e) => e.status !== "cancelled" && e.description?.includes(MARKER))
    .map((e) => ({
      id: e.id,
      summary: e.summary,
      due: e.start?.date || e.start?.dateTime,
    }));
}

export async function createSubscription(accessToken, { name, price, currency, day }) {
  const calendar = getCalendarClient(accessToken);

  const now = new Date();
  let due = new Date(now.getFullYear(), now.getMonth(), Number(day));
  if (due < now) {
    due = new Date(now.getFullYear(), now.getMonth() + 1, Number(day));
  }
  const dateStr = due.toISOString().slice(0, 10);

  const event = {
    summary: `💳 ${name} payment due (${currency} ${price})`,
    description: `${MARKER} Monthly subscription payment: ${name}, ${currency} ${price}`,
    start: { date: dateStr },
    end: { date: dateStr },
    recurrence: [`RRULE:FREQ=MONTHLY;BYMONTHDAY=${day}`],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 2880 }, // 2 days before
        { method: "popup", minutes: 1440 }, // 1 day before
      ],
    },
  };

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });
  return res.data;
}

export async function deleteSubscription(accessToken, eventId) {
  const calendar = getCalendarClient(accessToken);
  await calendar.events.delete({ calendarId: "primary", eventId });
}
