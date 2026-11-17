import { NextRequest, NextResponse } from 'next/server';
import { parseIcsContent } from '@/lib/icalParser';
import { userOrDemoQuota } from '@/lib/serverAuth';
import {
  CalendarAuthError,
  fetchGoogleEvents,
  fetchMicrosoftEvents,
  isAllowedIcalUrl,
  summarizeEvents,
} from '@/lib/calendarProviders';

/**
 * Calendar sync. Accepts one of:
 *   { provider: 'google' | 'microsoft', accessToken }   live OAuth sync (Google Calendar or Outlook / Teams)
 *   { icalUrl }                                          a private iCal feed from an approved calendar host
 *   { icsData }                                          an uploaded .ics export
 */

const MAX_ICS_CHARS = 8_000_000;

function syncedAt() {
  return new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST';
}

function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

function icsResponse(raw: string, haircutDate: string | undefined, provider: string, email: string) {
  const parsed = parseIcsContent(raw, haircutDate);
  return NextResponse.json({
    success: true,
    verified: true,
    provider,
    email,
    totalEvents: parsed.totalEvents,
    totalMeetingHours: parsed.totalMeetingHours,
    eveningCalls: parsed.eveningCalls,
    flights: parsed.totalFlights,
    curfewBreachPct: parsed.curfewBreachPct,
    busiestDay: parsed.busiestDay,
    peakLateDay: parsed.peakLateDay,
    avgLateTimeRange: parsed.avgLateTimeRange,
    avgMeetingDurationMins: parsed.avgMeetingDurationMins,
    events: parsed.events.slice(0, 250),
    weeklyTelemetry: parsed.weeklyTelemetry,
    syncedAt: syncedAt(),
  });
}

/** Fetches an iCal feed, re-checking every redirect against the host allowlist. */
async function fetchIcalFeed(url: string): Promise<Response> {
  let current = url;
  for (let hop = 0; hop < 4; hop++) {
    if (!isAllowedIcalUrl(current)) throw new Error('redirected to a host that is not allowed');
    const res = await fetch(current, {
      headers: { Accept: 'text/calendar, text/plain, */*', 'User-Agent': 'BAALANCE-Calendar-Sync/1.0' },
      redirect: 'manual',
      cache: 'no-store',
    });
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, current).toString();
      continue;
    }
    return res;
  }
  throw new Error('too many redirects');
}

export async function POST(req: NextRequest) {
  const auth = await userOrDemoQuota(req, 'calendar', 20);
  if (auth === 'limited') return fail('Too many calendar syncs from this connection. Please try again in an hour.', 429);

  try {
    const body = await req.json();
    const { accessToken, icalUrl, icsData, haircutDate } = body;
    const provider: 'google' | 'microsoft' = body.provider === 'microsoft' ? 'microsoft' : 'google';
    const email = auth?.email || String(body.email || '').trim().toLowerCase();

    // 1. Live OAuth sync
    if (accessToken && typeof accessToken === 'string') {
      try {
        const events =
          provider === 'microsoft'
            ? await fetchMicrosoftEvents(accessToken, email)
            : await fetchGoogleEvents(accessToken, email);
        const label = provider === 'microsoft' ? 'Microsoft Outlook (Microsoft Graph)' : 'Google Calendar (live)';
        return NextResponse.json({ ...summarizeEvents(events, label, email), calendarProvider: provider });
      } catch (err: any) {
        if (err instanceof CalendarAuthError) return fail(err.message, 401);
        console.warn('[BAALANCE Calendar] Live sync failed:', err?.message);
        return fail('Could not read your calendar right now. Please try again, or upload an .ics file.', 502);
      }
    }

    // 2. Private iCal feed
    if (icalUrl && typeof icalUrl === 'string' && icalUrl.trim()) {
      let url = icalUrl.trim();
      if (url.startsWith('webcal://')) url = 'https://' + url.slice('webcal://'.length);

      // A bare Google secret code ("private-abc123…") plus the account email.
      const secret = url.match(/^(?:private-)?([a-f0-9]{16,64})(?:\/basic\.ics)?$/i);
      if (secret) {
        if (!email.includes('@')) return fail('Enter your Google account email, or paste the full secret iCal address.');
        url = `https://calendar.google.com/calendar/ical/${encodeURIComponent(email)}/private-${secret[1]}/basic.ics`;
      }

      if (!isAllowedIcalUrl(url)) {
        return fail(
          'That link is not a supported calendar feed. Paste the secret iCal address from Google Calendar, Outlook or iCloud (it starts with https://), or upload an .ics file.'
        );
      }

      let res: Response;
      try {
        res = await fetchIcalFeed(url);
      } catch (err: any) {
        return fail(`Could not fetch that calendar feed (${err?.message || 'network error'}). You can upload an .ics file instead.`);
      }
      if (res.status === 404) {
        return fail(
          'The calendar returned "not found". Work and university accounts often block external calendar sharing. Upload an .ics file, or connect Google or Microsoft directly.'
        );
      }
      if (!res.ok) return fail(`The calendar returned status ${res.status}. Check that you copied the full secret address.`);

      const raw = await res.text();
      if (!raw.includes('BEGIN:VCALENDAR')) return fail('That link did not return a calendar feed.');
      if (raw.length > MAX_ICS_CHARS) return fail('That calendar is too large to analyse. Export the last 3 months instead.', 413);
      return icsResponse(raw, haircutDate, 'Calendar feed (iCal)', email || 'Your calendar');
    }

    // 3. Uploaded .ics export
    if (icsData && typeof icsData === 'string') {
      if (icsData.length > MAX_ICS_CHARS) return fail('That file is too large. Export the last 3 months instead.', 413);
      if (!icsData.includes('BEGIN:VCALENDAR')) return fail('That file is not a calendar (.ics) export.');
      return icsResponse(icsData, haircutDate, 'Exported calendar (.ics file)', email || 'Imported calendar');
    }

    return fail('Connect Google or Microsoft, paste a secret iCal address, or upload an .ics file.');
  } catch (err: any) {
    console.error('[BAALANCE Calendar] Error:', err?.message);
    return fail('Calendar sync failed. Please try again.', 500);
  }
}
