import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/serverAuth';
import { CalendarAuthError, rescheduleEvent, type CalendarProvider } from '@/lib/calendarProviders';

/**
 * Moves meetings the user organises to the slots they approved, through Google
 * Calendar or Microsoft Graph. The calendar provider sends the updated invite to
 * attendees. Meetings someone else organises are never changed: the client offers
 * a pre-written email to the organiser instead.
 */

interface RescheduleItem {
  eventId: string;
  newStartIso: string;
  newEndIso: string;
}

export async function POST(req: NextRequest) {
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Sign in to change your calendar.' }, { status: 401 });

  try {
    const body = await req.json();
    const provider: CalendarProvider = body.provider === 'microsoft' ? 'microsoft' : 'google';
    const accessToken: string = body.accessToken;
    const items: RescheduleItem[] = Array.isArray(body.items) ? body.items.slice(0, 25) : [];
    if (!accessToken || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Nothing to reschedule.' }, { status: 400 });
    }

    const results = [];
    for (const item of items) {
      const start = new Date(item.newStartIso);
      const end = new Date(item.newEndIso);
      if (!item.eventId || isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        results.push({ eventId: item.eventId, status: 'failed', error: 'Invalid time slot.' });
        continue;
      }
      try {
        await rescheduleEvent(provider, accessToken, item.eventId, start.toISOString(), end.toISOString());
        results.push({ eventId: item.eventId, status: 'moved' });
      } catch (err: any) {
        if (err instanceof CalendarAuthError) {
          return NextResponse.json({ success: false, error: err.message, results }, { status: 401 });
        }
        results.push({ eventId: item.eventId, status: 'failed', error: err?.message || 'Could not move this event.' });
      }
    }

    const moved = results.filter(r => r.status === 'moved').length;
    return NextResponse.json({ success: moved > 0, moved, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Could not update your calendar.' }, { status: 500 });
  }
}
