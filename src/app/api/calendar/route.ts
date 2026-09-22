import { NextRequest, NextResponse } from 'next/server';
import { parseIcsContent } from '@/lib/icalParser';
import { getISTDateInfo } from '@/lib/istTime';

export async function POST(req: NextRequest) {
  try {
    const { email, accessToken, icalUrl, icsData, haircutDate } = await req.json();

    const targetEmail = (email || '').trim().toLowerCase();

    // 1. If user provided a Google Calendar Secret iCal Address
    if (icalUrl && typeof icalUrl === 'string' && icalUrl.trim()) {
      let cleanUrl = icalUrl.trim();
      if (cleanUrl.startsWith('webcal://')) {
        cleanUrl = 'https://' + cleanUrl.slice(9);
      }

      // Check if user entered just their secret code (e.g. "private-87622c...", "87622c...", or "private-xxx/basic.ics")
      const secretCodeMatch = cleanUrl.match(/^(?:private-)?([a-f0-9]{16,64})(?:\/basic\.ics)?$/i);

      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        if (secretCodeMatch && targetEmail && targetEmail.includes('@')) {
          cleanUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(targetEmail)}/private-${secretCodeMatch[1]}/basic.ics`;
        } else if (secretCodeMatch && (!targetEmail || !targetEmail.includes('@'))) {
          return NextResponse.json(
            {
              success: false,
              error: `Detected Google Calendar secret code, but an account email is required to build the calendar address. Please ensure your email is entered, or paste the full address starting with https://.`,
            },
            { status: 400 }
          );
        } else if (cleanUrl.includes('@')) {
          return NextResponse.json(
            {
              success: false,
              error: `"${cleanUrl}" is an email address, not an iCal link or secret code. To sync live, copy your "Secret address in iCal format" from Google Calendar Settings, or click "Upload .ics File" below.`,
            },
            { status: 400 }
          );
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid calendar link. The secret address must start with https:// and end in /basic.ics (or enter your 32-character secret code). Or click "Upload .ics File".',
            },
            { status: 400 }
          );
        }
      }

      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        try {
          const fetchRes = await fetch(cleanUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/calendar, text/plain, */*',
            },
            redirect: 'follow',
            cache: 'no-store',
          });

          if (!fetchRes.ok) {
            if (fetchRes.status === 404) {
              return NextResponse.json(
                {
                  success: false,
                  error: 'Google Calendar returned 404 Not Found. If using an institutional (@aiims.edu) or corporate Google Workspace account, external calendar sharing is often disabled by your admin. Use "Upload .ics File" below—it works 100% of the time.',
                },
                { status: 400 }
              );
            }
            return NextResponse.json(
              { success: false, error: `Google Calendar returned status ${fetchRes.status}. Make sure you copied the full "Secret address in iCal format".` },
              { status: 400 }
            );
          }

          const rawText = await fetchRes.text();
          if (!rawText.includes('BEGIN:VCALENDAR')) {
            return NextResponse.json(
              { success: false, error: 'The URL provided did not return a valid iCal feed. Please verify the URL in Google Calendar settings.' },
              { status: 400 }
            );
          }

          const parsed = parseIcsContent(rawText, haircutDate);
          console.log('[API CALENDAR DEBUG] totalEvents:', parsed.totalEvents, 'eveningCalls:', parsed.eveningCalls, 'flights:', parsed.totalFlights);
          console.log('[API CALENDAR DEBUG] sample curfew/travel events:', parsed.events.filter(e => e.isCurfewBreach || e.category === 'travel').slice(0, 10).map(e => ({ title: e.title, time: e.startTime, date: e.dateKey, cat: e.category })));
          return NextResponse.json({
            success: true,
            verified: true,
            provider: 'Google Calendar (Live iCal Sync)',
            email: targetEmail || 'Your Google Calendar',
            totalEvents: parsed.totalEvents,
            totalMeetingHours: parsed.totalMeetingHours,
            eveningCalls: parsed.eveningCalls,
            flights: parsed.totalFlights,
            curfewBreachPct: parsed.curfewBreachPct,
            busiestDay: parsed.busiestDay,
            peakLateDay: parsed.peakLateDay,
            avgLateTimeRange: parsed.avgLateTimeRange,
            avgMeetingDurationMins: parsed.avgMeetingDurationMins,
            peakWeek: 'Parsed from live Google Calendar',
            events: parsed.events.slice(0, 250),
            weeklyTelemetry: parsed.weeklyTelemetry,
            icalUrl: cleanUrl,
            syncedAt: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST',
          });
        } catch (fetchErr: any) {
          return NextResponse.json(
            { success: false, error: `Could not fetch Google Calendar: ${fetchErr.message}. You can also upload your exported .ics file directly.` },
            { status: 400 }
          );
        }
      }
    }

    // 2. If user uploaded raw .ics file export
    if (icsData && typeof icsData === 'string') {
      const parsed = parseIcsContent(icsData, haircutDate);
      return NextResponse.json({
        success: true,
        verified: true,
        provider: 'Exported Calendar (.ics file)',
        email: targetEmail || 'Imported Calendar',
        totalEvents: parsed.totalEvents,
        totalMeetingHours: parsed.totalMeetingHours,
        eveningCalls: parsed.eveningCalls,
        flights: parsed.totalFlights,
        curfewBreachPct: parsed.curfewBreachPct,
        busiestDay: parsed.busiestDay,
        peakLateDay: parsed.peakLateDay,
        avgLateTimeRange: parsed.avgLateTimeRange,
        avgMeetingDurationMins: parsed.avgMeetingDurationMins,
        peakWeek: 'Parsed from exported calendar file',
        events: parsed.events.slice(0, 250),
        weeklyTelemetry: parsed.weeklyTelemetry,
        syncedAt: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST',
      });
    }

    const isGmailOrWorkspace = targetEmail.includes('@') && targetEmail.includes('.') && targetEmail.indexOf('@') > 0 && targetEmail.lastIndexOf('.') > targetEmail.indexOf('@') + 1;

    if (!isGmailOrWorkspace) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address (e.g. name@gmail.com, name@university.edu, or corporate workspace).' },
        { status: 400 }
      );
    }

    // 3. If real Google OAuth Access Token is provided, call Google Calendar API v3
    if (accessToken) {
      try {
        const timeMax = new Date().toISOString();
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

        const gCalUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(ninetyDaysAgo)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=250`;
        const gCalRes = await fetch(gCalUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });

        if (gCalRes.ok) {
          const calendarData = await gCalRes.json();
          const items = calendarData.items || [];
          
          let totalMeetingHours = 0;
          let eveningCalls = 0;
          let flightCount = 0;

          const now = Date.now();
          const weeklyTelemetry = Array.from({ length: 12 }, (_, i) => {
            const weekNum = i + 1;
            // Weeks 1–4 = July (Month 1), Weeks 5–8 = August (Month 2), Weeks 9–12 = September (Month 3)
            const month = weekNum <= 4 ? 1 : weekNum <= 8 ? 2 : 3;
            return {
              weekNumber: weekNum,
              weekLabel: `W${weekNum}`,
              month: month as 1 | 2 | 3,
              meetingHours: 0,
              eveningCalls: 0,
              flightShifts: 0,
            };
          });

          const parsedEvents = items.map((item: any) => {
            const start = item.start?.dateTime ? new Date(item.start.dateTime) : (item.start?.date ? new Date(item.start.date) : new Date());
            const end = item.end?.dateTime ? new Date(item.end.dateTime) : (item.end?.date ? new Date(item.end.date) : new Date(start.getTime() + 3600000));
            const durationHours = Math.max(0.25, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
            totalMeetingHours += durationHours;

            const startIst = getISTDateInfo(start);
            const endIst = getISTDateInfo(end);
            const isCurfew = startIst.isCurfew;
            if (isCurfew) eveningCalls++;
            const isFlight = (item.summary || '').toLowerCase().includes('flight') || (item.summary || '').toLowerCase().includes('travel');
            if (isFlight) flightCount++;

            // Distribute into 12-week telemetry
            const diffMs = now - start.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const weekAgo = Math.floor(diffDays / 7);
            const targetIndex = 11 - weekAgo;
            if (targetIndex >= 0 && targetIndex < 12) {
              weeklyTelemetry[targetIndex].meetingHours += Math.round(durationHours);
              if (isCurfew) weeklyTelemetry[targetIndex].eveningCalls += 1;
              if (isFlight) weeklyTelemetry[targetIndex].flightShifts += 1;
            }

            const organizerEmail = item.organizer?.email || '';
            const organizerName = item.organizer?.displayName || '';
            const isUserOrganizer = item.organizer?.self ?? (organizerEmail.toLowerCase() === targetEmail.toLowerCase());
            const attendees = item.attendees?.map((a: any) => a.email).filter(Boolean) || [];

            return {
              id: item.id || `evt-${Math.random()}`,
              day: startIst.dayName,
              dayDate: startIst.dateFormatted,
              dateKey: startIst.dateKey,
              title: item.summary || 'Scheduled Meeting',
              startTime: startIst.time12h,
              endTime: endIst.time12h,
              startHour: startIst.startHour,
              durationHours: parseFloat(durationHours.toFixed(2)),
              isCurfewBreach: isCurfew,
              hasMeet: !!item.hangoutLink,
              attendeesCount: attendees.length > 0 ? attendees.length : 1,
              category: isCurfew ? 'late_sync' : 'core',
              organizerEmail: organizerEmail || undefined,
              organizerName: organizerName || undefined,
              isUserOrganizer,
              attendees: attendees.length > 0 ? attendees : undefined,
            };
          });

          return NextResponse.json({
            success: true,
            verified: true,
            provider: 'Google Calendar API v3 (Live OAuth 2.0)',
            email: targetEmail,
            totalEvents: items.length,
            totalMeetingHours: Math.round(totalMeetingHours),
            eveningCalls,
            flights: flightCount,
            weeklyTelemetry,
            events: parsedEvents.slice(0, 100),
            scopes: ['https://www.googleapis.com/auth/calendar.events.readonly', 'email'],
            syncedAt: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST',
          });
        }
      } catch (apiErr) {
        console.warn('[Google Calendar API] Live fetch error:', apiErr);
      }
    }

    // 4. Return explicit instruction if no valid calendar input was provided
    return NextResponse.json(
      {
        success: false,
        error: 'Please paste your Secret address in iCal format (e.g. https://calendar.google.com/calendar/ical/.../basic.ics) or click "Upload .ics File" to upload your calendar export directly.',
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to verify Google Calendar' },
      { status: 500 }
    );
  }
}
