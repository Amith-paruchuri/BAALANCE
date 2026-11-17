import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/serverAuth';
import { CalendarAuthError, rescheduleEvent, type CalendarProvider } from '@/lib/calendarProviders';
import { writeAudit } from '@/lib/auditServer';

/**
 * Moves meetings the user organises to the slots they approved, through Google
 * Calendar or Microsoft Graph. The calendar provider sends the updated invite to
 * attendees. Meetings someone else organises are never changed: the client offers
 * a pre-written email to the organiser instead.
 *
 * Nothing moves without consent: the request must carry the user's explicit
 * approval, and every attempted change is written to their activity log.
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
    if (body.approvedByUser !== true) {
      return NextResponse.json({ success: false, error: 'Approve the change first. Nothing was moved.' }, { status: 400 });
    }
    if (!accessToken || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Nothing to reschedule.' }, { status: 400 });
    }

    const results = [];
    for (const item of items) {
      const start = new Date(item.newStartIso);
      const end = new Date(item.newEndIso);
      if (!item.eventId || isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        results.push({ eventId: item.eventId, status: 'failed', error: 'Invalid time slot.' });
        await writeAudit(auth, 'calendar_move_failed', { provider, eventRef: item.eventId, detail: { error: 'Invalid time slot.' } });
        continue;
      }
      try {
        await rescheduleEvent(provider, accessToken, item.eventId, start.toISOString(), end.toISOString());
        results.push({ eventId: item.eventId, status: 'moved' });
        await writeAudit(auth, 'calendar_moved', {
          provider,
          eventRef: item.eventId,
          detail: { newStart: start.toISOString(), newEnd: end.toISOString(), approvedByUser: true },
        });
      } catch (err: any) {
        if (err instanceof CalendarAuthError) {
          return NextResponse.json({ success: false, error: err.message, results }, { status: 401 });
        }
        results.push({ eventId: item.eventId, status: 'failed', error: err?.message || 'Could not move this event.' });
        await writeAudit(auth, 'calendar_move_failed', {
          provider,
          eventRef: item.eventId,
          detail: { error: err instanceof CalendarAuthError ? 'Calendar sign-in expired.' : 'Could not move this event.' },
        });
      }
    }

    const moved = results.filter(r => r.status === 'moved').length;
    return NextResponse.json({ success: moved > 0, moved, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Could not update your calendar.' }, { status: 500 });
  }
}
