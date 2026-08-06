import { google } from "googleapis";

// Marker stored on every event we create, so we can find "our" events later
// without needing our own database.
const MARKER_KEY = "subscriptionReminder";

function getCalendarClient(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

function addDays(date, delta) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

export async function listSubscriptions(accessToken) {
  const calendar = getCalendarClient(accessToken);
  const res = await calendar.events.list({
    calendarId: "primary",
    // Only the "due date" event per subscription — the linked day-before
    // reminder event is intentionally not listed here to avoid duplicates.
    privateExtendedProperty: [`${MARKER_KEY}=true`, "role=due"],
    singleEvents: false, // return recurring masters once, not every instance
    maxResults: 250,
  });

  return (res.data.items || [])
    .filter((e) => e.status !== "cancelled")
    .map((e) => {
      const props = e.extendedProperties?.private || {};
      return {
        id: e.id,
        name: props.name || e.summary,
        price: props.price,
        currency: props.currency,
        day: props.day,
        summary: e.summary,
        due: e.start?.date || e.start?.dateTime,
      };
    });
}

export async function createSubscription(accessToken, { name, price, currency, day }) {
  const calendar = getCalendarClient(accessToken);
  const dayNum = Number(day);

  const now = new Date();
  let due = new Date(now.getFullYear(), now.getMonth(), dayNum);
  if (due < now) {
    due = new Date(now.getFullYear(), now.getMonth() + 1, dayNum);
  }
  const dueDateStr = toDateStr(due);

  // --- 1. The due-date event itself ---
  // Also carries Google's own background email/popup reminders as a bonus
  // (2 days / 1 day before), though those aren't guaranteed to be obvious.
  const dueEvent = {
    summary: `💳 ${name} payment due (${currency} ${price})`,
    description: `Monthly subscription payment: ${name}, ${currency} ${price}`,
    start: { date: dueDateStr },
    end: { date: dueDateStr },
    recurrence: [`RRULE:FREQ=MONTHLY;BYMONTHDAY=${dayNum}`],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 2880 }, // 2 days before
        { method: "popup", minutes: 1440 }, // 1 day before
      ],
    },
    extendedProperties: {
      private: {
        [MARKER_KEY]: "true",
        role: "due",
        name: String(name),
        price: String(price),
        currency: String(currency),
        day: String(day),
      },
    },
  };

  const dueRes = await calendar.events.insert({
    calendarId: "primary",
    requestBody: dueEvent,
  });

  // --- 2. A separate, clearly visible reminder event the day before ---
  // This is the entry that actually shows up on the calendar a day early,
  // rather than relying on a background notification most people never
  // notice on all-day events.
  const reminderDate = addDays(due, -1);
  const reminderDateStr = toDateStr(reminderDate);
  // BYMONTHDAY can't be 0, so "the day before the 1st" recurs on the last
  // day of the month instead (RRULE supports negative day-of-month values).
  const reminderMonthDay = dayNum === 1 ? -1 : dayNum - 1;

  const reminderEvent = {
    summary: `⏰ ${name} payment due tomorrow (${currency} ${price})`,
    description: `Reminder: ${name} (${currency} ${price}) is due tomorrow.`,
    start: { date: reminderDateStr },
    end: { date: reminderDateStr },
    recurrence: [`RRULE:FREQ=MONTHLY;BYMONTHDAY=${reminderMonthDay}`],
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 0 }],
    },
    extendedProperties: {
      private: {
        [MARKER_KEY]: "true",
        role: "reminder",
        relatedEventId: dueRes.data.id,
        name: String(name),
        price: String(price),
        currency: String(currency),
        day: String(day),
      },
    },
  };

  const reminderRes = await calendar.events.insert({
    calendarId: "primary",
    requestBody: reminderEvent,
  });

  return { due: dueRes.data, reminder: reminderRes.data };
}

export async function deleteSubscription(accessToken, eventId) {
  const calendar = getCalendarClient(accessToken);

  // Find and remove the linked day-before reminder event too.
  const linked = await calendar.events.list({
    calendarId: "primary",
    privateExtendedProperty: [`relatedEventId=${eventId}`],
    singleEvents: false,
  });
  for (const e of linked.data.items || []) {
    await calendar.events.delete({ calendarId: "primary", eventId: e.id });
  }

  await calendar.events.delete({ calendarId: "primary", eventId });
}
