import { getISTDateInfo } from './istTime';

/**
 * Live calendar access for Google Calendar (Calendar API v3) and Microsoft 365 /
 * Outlook (Microsoft Graph). Both are normalised into one event shape so the rest
 * of the app does not care which calendar the user connected.
 */

export type CalendarProvider = 'google' | 'microsoft';

export interface NormalizedEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  organizerEmail?: string;
  organizerName?: string;
  isUserOrganizer: boolean;
  attendees: string[];
  onlineMeeting: 'meet' | 'teams' | 'other' | null;
  webLink?: string;
}

const LOOKBACK_DAYS = 90;
const MAX_EVENTS = 600;

export class CalendarAuthError extends Error {}

function windowIso() {
  const end = new Date();
  const start = new Date(end.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

export async function fetchGoogleEvents(accessToken: string, userEmail: string): Promise<NormalizedEvent[]> {
  const { startIso, endIso } = windowIso();
  const events: NormalizedEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      timeMin: startIso,
      timeMax: endIso,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (res.status === 401 || res.status === 403) throw new CalendarAuthError('Google Calendar access expired. Please reconnect.');
    if (!res.ok) throw new Error(`Google Calendar returned ${res.status}`);
    const data = await res.json();

    for (const item of data.items || []) {
      if (item.status === 'cancelled') continue;
      const isAllDay = !item.start?.dateTime;
      const start = new Date(item.start?.dateTime || item.start?.date);
      const end = new Date(item.end?.dateTime || item.end?.date || start.getTime() + 3600000);
      const organizerEmail: string = item.organizer?.email || '';
      events.push({
        id: item.id,
        title: item.summary || 'Untitled event',
        start,
        end,
        isAllDay,
        organizerEmail: organizerEmail || undefined,
        organizerName: item.organizer?.displayName || undefined,
        isUserOrganizer: item.organizer?.self ?? organizerEmail.toLowerCase() === userEmail.toLowerCase(),
        attendees: (item.attendees || []).map((a: any) => a.email).filter(Boolean),
        onlineMeeting: item.hangoutLink ? 'meet' : item.conferenceData ? 'other' : null,
        webLink: item.htmlLink,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken && events.length < MAX_EVENTS);

  return events;
}

export async function fetchMicrosoftEvents(accessToken: string, userEmail: string): Promise<NormalizedEvent[]> {
  const { startIso, endIso } = windowIso();
  const select = 'id,subject,start,end,isAllDay,isCancelled,organizer,attendees,isOnlineMeeting,onlineMeetingProvider,webLink';
  let url: string | undefined =
    `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${encodeURIComponent(startIso)}` +
    `&endDateTime=${encodeURIComponent(endIso)}&$select=${select}&$orderby=start/dateTime&$top=100`;
  const events: NormalizedEvent[] = [];

  while (url && events.length < MAX_EVENTS) {
    const res: Response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        Prefer: 'outlook.timezone="UTC"',
      },
      cache: 'no-store',
    });
    if (res.status === 401 || res.status === 403) throw new CalendarAuthError('Outlook calendar access expired. Please reconnect.');
    if (!res.ok) throw new Error(`Microsoft Graph returned ${res.status}`);
    const data = await res.json();

    for (const item of data.value || []) {
      if (item.isCancelled) continue;
      // With outlook.timezone="UTC", Graph returns UTC times without a trailing Z.
      const toDate = (dt?: string) => new Date(dt ? (dt.endsWith('Z') ? dt : `${dt}Z`) : Date.now());
      const organizerEmail: string = item.organizer?.emailAddress?.address || '';
      events.push({
        id: item.id,
        title: item.subject || 'Untitled event',
        start: toDate(item.start?.dateTime),
        end: toDate(item.end?.dateTime),
        isAllDay: !!item.isAllDay,
        organizerEmail: organizerEmail || undefined,
        organizerName: item.organizer?.emailAddress?.name || undefined,
        isUserOrganizer: organizerEmail.toLowerCase() === userEmail.toLowerCase(),
        attendees: (item.attendees || []).map((a: any) => a.emailAddress?.address).filter(Boolean),
        onlineMeeting: item.isOnlineMeeting
          ? item.onlineMeetingProvider === 'teamsForBusiness'
            ? 'teams'
            : 'other'
          : null,
        webLink: item.webLink,
      });
    }
    url = data['@odata.nextLink'];
  }

  return events;
}

const NON_WORK_PATTERN =
  /\b(stay at|hotel|hostel|inn|resort|lodge|airbnb|check-in|checkout|reservation at|movie|cinema|imax|concert|ticket)\b/i;
const FLIGHT_PATTERN = /\b(flight|flights|airline|airlines|airport|boarding pass|airways)\b/i;

/** Builds the calendar summary the dashboard expects from normalised events. */
export function summarizeEvents(events: NormalizedEvent[], providerLabel: string, email: string) {
  const now = Date.now();
  let totalMeetingHours = 0;
  let eveningCalls = 0;
  let flights = 0;
  let teamsMeetings = 0;
  let lateTeamsMeetings = 0;

  const weeklyTelemetry = Array.from({ length: 12 }, (_, i) => {
    const weekNumber = i + 1;
    return {
      weekNumber,
      weekLabel: `W${weekNumber}`,
      month: (weekNumber <= 4 ? 1 : weekNumber <= 8 ? 2 : 3) as 1 | 2 | 3,
      meetingHours: 0,
      eveningCalls: 0,
      flightShifts: 0,
    };
  });

  const mapped = events.map(evt => {
    const durationHours = Math.max(0.25, (evt.end.getTime() - evt.start.getTime()) / 3600000);
    const isFlight = FLIGHT_PATTERN.test(evt.title);
    const isNonWork = NON_WORK_PATTERN.test(evt.title);
    const startIst = getISTDateInfo(evt.start);
    const endIst = getISTDateInfo(evt.end);
    const countsAsWork = !evt.isAllDay && !isNonWork && !isFlight;
    const isCurfew = countsAsWork && startIst.isCurfew;

    if (countsAsWork) totalMeetingHours += Math.min(durationHours, 6);
    if (isCurfew) eveningCalls++;
    if (isFlight) flights++;
    if (evt.onlineMeeting === 'teams') {
      teamsMeetings++;
      if (isCurfew) lateTeamsMeetings++;
    }

    const weekAgo = Math.floor((now - evt.start.getTime()) / (7 * 24 * 3600000));
    const idx = 11 - weekAgo;
    if (idx >= 0 && idx < 12) {
      if (countsAsWork) weeklyTelemetry[idx].meetingHours += Math.round(Math.min(durationHours, 6));
      if (isCurfew) weeklyTelemetry[idx].eveningCalls += 1;
      if (isFlight) weeklyTelemetry[idx].flightShifts += 1;
    }

    return {
      id: evt.id,
      day: startIst.dayName,
      dayDate: startIst.dateFormatted,
      dateKey: startIst.dateKey,
      title: evt.title,
      startTime: startIst.time12h,
      endTime: endIst.time12h,
      startHour: startIst.startHour,
      durationHours: parseFloat(durationHours.toFixed(2)),
      isAllDay: evt.isAllDay,
      isCurfewBreach: isCurfew,
      hasMeet: evt.onlineMeeting === 'meet',
      isTeamsMeeting: evt.onlineMeeting === 'teams',
      attendeesCount: evt.attendees.length || 1,
      category: isFlight ? 'travel' : isCurfew ? 'late_sync' : 'core',
      organizerEmail: evt.organizerEmail,
      organizerName: evt.organizerName,
      isUserOrganizer: evt.isUserOrganizer,
      attendees: evt.attendees.length ? evt.attendees : undefined,
      // Needed to reschedule the event through the provider's API.
      startIso: evt.start.toISOString(),
      endIso: evt.end.toISOString(),
    };
  });

  const timedWork = mapped.filter(e => !e.isAllDay && e.category !== 'travel');
  return {
    success: true,
    verified: true,
    provider: providerLabel,
    email,
    totalEvents: events.length,
    totalMeetingHours: Math.round(totalMeetingHours),
    eveningCalls,
    flights,
    teamsMeetings,
    lateTeamsMeetings,
    curfewBreachPct: timedWork.length ? Math.round((eveningCalls / timedWork.length) * 100) : 0,
    weeklyTelemetry,
    events: mapped.slice(-250),
    syncedAt:
      new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST',
  };
}

/**
 * Moves an event to a new time through the provider's API. Both providers send
 * the updated invitation to attendees themselves, so no separate email is needed.
 * Only events the user organises can be moved.
 */
export async function rescheduleEvent(
  provider: CalendarProvider,
  accessToken: string,
  eventId: string,
  newStartIso: string,
  newEndIso: string
): Promise<void> {
  if (provider === 'google') {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: { dateTime: newStartIso }, end: { dateTime: newEndIso } }),
      }
    );
    if (res.status === 401 || res.status === 403) throw new CalendarAuthError('Google Calendar access expired or not allowed. Please reconnect.');
    if (!res.ok) throw new Error(`Google Calendar could not move the event (${res.status}).`);
    return;
  }

  const toGraph = (iso: string) => ({ dateTime: new Date(iso).toISOString().replace('Z', ''), timeZone: 'UTC' });
  const res = await fetch(`https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ start: toGraph(newStartIso), end: toGraph(newEndIso) }),
  });
  if (res.status === 401 || res.status === 403) throw new CalendarAuthError('Outlook calendar access expired or not allowed. Please reconnect.');
  if (!res.ok) throw new Error(`Outlook could not move the event (${res.status}).`);
}

/** Calendar feed hosts the server may fetch from, to prevent requests to arbitrary or internal URLs. */
const ALLOWED_ICAL_HOSTS = [
  'calendar.google.com',
  'outlook.office365.com',
  'outlook.office.com',
  'outlook.live.com',
  'calendar.zoho.com',
  'calendar.zoho.in',
];

export function isAllowedIcalUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    return ALLOWED_ICAL_HOSTS.includes(host) || host.endsWith('.icloud.com');
  } catch {
    return false;
  }
}
