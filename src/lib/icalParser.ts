export interface ParsedCalendarEvent {
  id: string;
  day: string; // 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  dayDate: string; // 'Aug 3'
  title: string;
  startTime: string; // '09:30 AM'
  endTime: string; // '10:30 AM'
  startHour: number; // e.g. 9.5
  durationHours: number;
  isCurfewBreach: boolean; // >= 19:00 or < 05:00
  hasMeet: boolean;
  attendeesCount: number;
  category: 'core' | 'strategy' | 'late_sync' | 'incident' | 'all_hands' | 'birthday' | 'festival' | 'personal' | 'travel';
  startDate?: Date;
  dateKey: string; // 'YYYY-MM-DD'
  monthKey: 1 | 2 | 3; // 1 = July, 2 = August, 3 = September
  isAllDay?: boolean;
}

export function parseIcsContent(
  icsContent: string,
  haircutDateParam?: Date | string
): {
  events: ParsedCalendarEvent[];
  totalMeetingHours: number;
  eveningCalls: number;
  totalEvents: number;
  totalFlights: number;
  curfewBreachPct: number;
  busiestDay: string;
  peakLateDay: string;
  avgLateTimeRange: string;
  avgMeetingDurationMins: number;
  weeklyTelemetry: Array<{
    weekNumber: number;
    weekLabel: string;
    month: 1 | 2 | 3;
    monthLabel: string;
    dateRange: string;
    meetingHours: number;
    eveningCalls: number;
    flightShifts: number;
  }>;
} {
  const events: ParsedCalendarEvent[] = [];
  const lines = icsContent.split(/\r?\n/);

  let inEvent = false;
  let summary = '';
  let dtstart = '';
  let dtend = '';
  let description = '';
  let location = '';
  let rrule = '';

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = Date.now();
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
  const oneWeekAhead = now + 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Handle folded lines (RFC 5545 lines starting with space or tab)
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      line += lines[i + 1].slice(1);
      i++;
    }

    const trimmed = line.trim();

    if (trimmed.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      summary = '';
      dtstart = '';
      dtend = '';
      description = '';
      location = '';
      rrule = '';
    } else if (trimmed.startsWith('END:VEVENT')) {
      inEvent = false;
      if (summary) {
        const baseStart = parseIcsDate(dtstart);
        if (baseStart) {
          const baseEnd = dtend ? parseIcsDate(dtend) : new Date(baseStart.getTime() + 60 * 60 * 1000);
          const durationMs = baseEnd ? Math.max(15 * 60 * 1000, baseEnd.getTime() - baseStart.getTime()) : 60 * 60 * 1000;
          const durationHours = Math.max(0.25, parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2)));
          const hasMeet = (description + location + summary).toLowerCase().includes('meet.google') ||
            (description + location).toLowerCase().includes('zoom') ||
            (description + location).toLowerCase().includes('teams');

          // Check for recurrence rule (RRULE)
          const occurrences: Date[] = [];

          if (rrule) {
            const rruleUpper = rrule.toUpperCase();
            const isWeekly = rruleUpper.includes('FREQ=WEEKLY');
            const isDaily = rruleUpper.includes('FREQ=DAILY');
            const isYearly = rruleUpper.includes('FREQ=YEARLY');
            const isMonthly = rruleUpper.includes('FREQ=MONTHLY');

            // Parse UNTIL if specified
            let untilDate: Date | null = null;
            const untilMatch = rruleUpper.match(/UNTIL=([0-9TZ]+)/);
            if (untilMatch) {
              untilDate = parseIcsDate(untilMatch[1]);
            }

            const effectiveLimit = untilDate && untilDate.getTime() < oneWeekAhead ? untilDate.getTime() : oneWeekAhead;

            if (isYearly) {
              // Expand yearly recurring events (e.g. Birthdays, Annual Festivals) into active testing window
              const baseYear = baseStart.getFullYear();
              const targetYears = [2025, 2026, 2027];
              for (const yr of targetYears) {
                if (yr >= baseYear) {
                  const occ = new Date(baseStart);
                  occ.setFullYear(yr);
                  if ((!untilDate || occ.getTime() <= untilDate.getTime()) && occ.getTime() <= oneWeekAhead) {
                    occurrences.push(occ);
                  }
                }
              }
            } else if (isMonthly) {
              let current = new Date(baseStart.getTime());
              for (let m = 0; m < 36; m++) {
                if (current.getTime() >= ninetyDaysAgo && current.getTime() <= effectiveLimit) {
                  occurrences.push(new Date(current.getTime()));
                }
                current.setMonth(current.getMonth() + 1);
                if (current.getTime() > effectiveLimit) break;
              }
            } else if (isWeekly) {
              const byDayMatch = rruleUpper.match(/BYDAY=([A-Z,]+)/);
              const intervalMatch = rruleUpper.match(/INTERVAL=(\d+)/);
              const interval = intervalMatch ? parseInt(intervalMatch[1], 10) : 1;

              if (byDayMatch) {
                const days = byDayMatch[1].split(',');
                const dayMap: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
                const targetDays = days.map(d => dayMap[d.trim()]).filter(d => d !== undefined);

                let weekStart = new Date(baseStart.getTime());
                if (weekStart.getTime() < ninetyDaysAgo - 7 * 24 * 60 * 60 * 1000) {
                  const diff = ninetyDaysAgo - weekStart.getTime();
                  const jumps = Math.floor(diff / (interval * 7 * 24 * 60 * 60 * 1000));
                  weekStart = new Date(weekStart.getTime() + jumps * interval * 7 * 24 * 60 * 60 * 1000);
                }

                while (weekStart.getTime() <= effectiveLimit) {
                  for (const tDay of targetDays) {
                    const occ = new Date(weekStart.getTime());
                    const diff = tDay - occ.getDay();
                    occ.setDate(occ.getDate() + diff);
                    if (occ.getTime() >= baseStart.getTime() && occ.getTime() >= ninetyDaysAgo && occ.getTime() <= effectiveLimit) {
                      occurrences.push(new Date(occ.getTime()));
                    }
                  }
                  weekStart.setDate(weekStart.getDate() + 7 * interval);
                  if (occurrences.length >= 60) break;
                }
              } else {
                const stepMs = interval * 7 * 24 * 60 * 60 * 1000;
                let current = new Date(baseStart.getTime());
                if (current.getTime() < ninetyDaysAgo) {
                  const diff = ninetyDaysAgo - current.getTime();
                  const jumps = Math.floor(diff / stepMs);
                  current = new Date(current.getTime() + jumps * stepMs);
                }

                while (current.getTime() <= effectiveLimit) {
                  if (current.getTime() >= ninetyDaysAgo) {
                    occurrences.push(new Date(current.getTime()));
                  }
                  current = new Date(current.getTime() + stepMs);
                  if (occurrences.length >= 30) break;
                }
              }
            } else if (isDaily) {
              const stepMs = 24 * 60 * 60 * 1000;
              let current = new Date(baseStart.getTime());
              if (current.getTime() < ninetyDaysAgo) {
                const diff = ninetyDaysAgo - current.getTime();
                const jumps = Math.floor(diff / stepMs);
                current = new Date(current.getTime() + jumps * stepMs);
              }
              while (current.getTime() <= effectiveLimit) {
                if (current.getTime() >= ninetyDaysAgo) {
                  occurrences.push(new Date(current.getTime()));
                }
                current = new Date(current.getTime() + stepMs);
                if (occurrences.length >= 60) break;
              }
            }
          }

          // If no recurring occurrences generated, use single occurrence
          if (occurrences.length === 0) {
            occurrences.push(baseStart);
          }

          const isAllDay = !dtstart.includes('T');
          const titleLower = (summary || '').toLowerCase();
          const isBirthday = /\b(birthday|b'day|bday|janmadin|birth\s*day)\b/i.test(titleLower);
          const isWeddingSocial = /\b(wedding|marrag|marriage|reception|engagement|shaadi|shadi|vivah|sangeet|mehendi|haldi|anniversary|party|family|puja|pooja|darshan|temple|charcha|gup-shup|catchup|get-together|dinner|lunch|gathering|personal)\b/i.test(titleLower);
          const isEntertainment = /\b(movie|cinema|imax|theatre|theater|concert|ticket|aquarium|cruise|cruises|tour to|bus to|\(u\/a\)|\(ua\d*\+?\)|\(u\)|\(a\))\b/i.test(titleLower);
          const isFestival = /\b(holiday|festival|diwali|deepavali|eid|ramadan|christmas|easter|independence day|republic day|gandhi|raksha bandhan|rakhi|janmashtami|ganesh|ganpati|dussehra|dasara|navratri|durga puja|onam|pongal|bihu|holi|makar sankranti|shivratri|maha shivratri|ugadi|gudi padwa|milad|muharram|bakrid|good friday|bhai dooj|govardhan|karwa chauth|guru nanak|thiruvonam)\b/i.test(titleLower);
          const isTravel = /\b(flight|flights|airline|airlines|airport|boarding\s+pass|airways)\b/i.test(titleLower) &&
            !titleLower.includes('terminal window') &&
            !titleLower.includes('web terminal') &&
            !titleLower.includes('cli') &&
            !titleLower.includes('bash');

          for (const occ of occurrences) {
            const hour = occ.getHours();
            const minute = occ.getMinutes();
            const startHour = isAllDay ? 0 : parseFloat((hour + minute / 60).toFixed(2));
            const isCurfew = isAllDay ? false : (hour >= 19 || hour < 5);
            const dayName = dayNames[occ.getDay()];
            const monthName = monthNames[occ.getMonth()];
            const dateFormatted = `${monthName} ${occ.getDate()}`;
            const endOcc = new Date(occ.getTime() + durationMs);

            const yyyy = occ.getFullYear();
            const mm = String(occ.getMonth() + 1).padStart(2, '0');
            const dd = String(occ.getDate()).padStart(2, '0');
            const dateKey = `${yyyy}-${mm}-${dd}`;

            // Map monthKey: 6 (July) -> 1, 7 (August) -> 2, 8 (September) -> 3
            const calMonth = occ.getMonth();
            const monthKey: 1 | 2 | 3 = calMonth <= 6 ? 1 : calMonth === 7 ? 2 : 3;

            let category: 'core' | 'strategy' | 'late_sync' | 'incident' | 'all_hands' | 'birthday' | 'festival' | 'personal' | 'travel' = 'core';
            if (isBirthday) {
              category = 'birthday';
            } else if (isWeddingSocial || isEntertainment) {
              category = 'personal';
            } else if (isFestival) {
              category = 'festival';
            } else if (isTravel) {
              category = 'travel';
            } else if (isCurfew) {
              category = 'late_sync';
            } else if (titleLower.includes('incident') || titleLower.includes('urgent') || titleLower.includes('war room') || titleLower.includes('outage')) {
              category = 'incident';
            } else if (titleLower.includes('strategy') || titleLower.includes('review') || titleLower.includes('planning')) {
              category = 'strategy';
            } else if (titleLower.includes('all-hands') || titleLower.includes('town hall')) {
              category = 'all_hands';
            }

            events.push({
              id: `evt-${events.length + 1}-${Math.random().toString(36).substring(2, 7)}`,
              day: dayName,
              dayDate: dateFormatted,
              title: summary,
              startTime: isAllDay ? 'All Day' : formatTime12h(occ),
              endTime: isAllDay ? 'All Day' : formatTime12h(endOcc),
              startHour,
              durationHours: isAllDay ? 0 : durationHours,
              isCurfewBreach: isCurfew,
              hasMeet,
              attendeesCount: hasMeet ? 4 : 2,
              category,
              startDate: occ,
              dateKey,
              monthKey,
              isAllDay,
            });
          }
        }
      }
    } else if (inEvent) {
      if (trimmed.startsWith('SUMMARY:')) {
        summary = trimmed.slice(8).trim();
      } else if (trimmed.startsWith('SUMMARY;')) {
        const colonIdx = trimmed.indexOf(':');
        summary = colonIdx !== -1 ? trimmed.slice(colonIdx + 1).trim() : '';
      } else if (trimmed.startsWith('DTSTART')) {
        const colonIdx = trimmed.indexOf(':');
        dtstart = colonIdx !== -1 ? trimmed.slice(colonIdx + 1).trim() : '';
      } else if (trimmed.startsWith('DTEND')) {
        const colonIdx = trimmed.indexOf(':');
        dtend = colonIdx !== -1 ? trimmed.slice(colonIdx + 1).trim() : '';
      } else if (trimmed.startsWith('DESCRIPTION:')) {
        description = trimmed.slice(12).trim();
      } else if (trimmed.startsWith('LOCATION:')) {
        location = trimmed.slice(9).trim();
      } else if (trimmed.startsWith('RRULE:')) {
        rrule = trimmed.slice(6).trim();
      } else if (trimmed.startsWith('RRULE;')) {
        const colonIdx = trimmed.indexOf(':');
        rrule = colonIdx !== -1 ? trimmed.slice(colonIdx + 1).trim() : '';
      }
    }
  }

  // Sort events by date descending (most recent first)
  events.sort((a, b) => {
    const timeA = a.startDate ? a.startDate.getTime() : 0;
    const timeB = b.startDate ? b.startDate.getTime() : 0;
    return timeB - timeA;
  });

  // Determine effective anchor date: exactly the date of the haircut
  // (Hair cortisol spectrometry measures the 3.0 cm segment grown during the 12 weeks before haircut collection)
  let anchor = haircutDateParam ? new Date(haircutDateParam) : new Date(2026, 8, 20);
  if (isNaN(anchor.getTime())) {
    anchor = new Date(2026, 8, 20);
  }
  anchor.setHours(23, 59, 59, 999);

  const validDates = events
    .map(e => e.startDate)
    .filter((d): d is Date => !!d && !isNaN(d.getTime()));

  if (validDates.length > 0 && !haircutDateParam) {
    const currentYear = anchor.getFullYear();
    const hasCurrentYear = validDates.some(d => d.getFullYear() === currentYear);
    if (!hasCurrentYear) {
      // If user uploaded a calendar export from another year without explicit haircut date, align anchor year
      const maxDateMs = Math.max(...validDates.map(d => d.getTime()));
      anchor = new Date(maxDateMs);
      anchor.setHours(23, 59, 59, 999);
    }
  }

  const windowEndMs = anchor.getTime(); // Date of Haircut
  const windowStartMs = windowEndMs - 84 * 24 * 60 * 60 * 1000; // 12 weeks (84 days) before haircut

  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Build the 12 dynamic rolling weekly intervals (Week 1 = oldest, Week 12 = latest/current)
  const rawWeeklyTelemetry = Array.from({ length: 12 }, (_, i) => {
    const weekNum = i + 1;
    // Week 12 ends on windowEndMs, Week 11 ends 7 days before, etc.
    const endMs = windowEndMs - (11 - i) * 7 * 24 * 60 * 60 * 1000;
    const startMs = endMs - 6 * 24 * 60 * 60 * 1000;
    const wStart = new Date(startMs);
    const wEnd = new Date(endMs);

    const startStr = `${shortMonthNames[wStart.getMonth()]} ${String(wStart.getDate()).padStart(2, '0')}`;
    const endStr = `${shortMonthNames[wEnd.getMonth()]} ${String(wEnd.getDate()).padStart(2, '0')}`;
    const dateRange = `${startStr} - ${endStr}`;

    const month = (weekNum <= 4 ? 1 : weekNum <= 8 ? 2 : 3) as 1 | 2 | 3;
    const sampleDate = new Date(endMs - 3 * 24 * 60 * 60 * 1000);
    const monthLabel = fullMonthNames[sampleDate.getMonth()];

    return {
      weekNumber: weekNum,
      weekLabel: `W${weekNum}`,
      month,
      monthLabel,
      dateRange,
      meetingHours: 0,
      eveningCalls: 0,
      flightShifts: 0,
    };
  });

  // Distribute only events that strictly occur within the rolling 84-day window
  for (const evt of events) {
    if (!evt.startDate || isNaN(evt.startDate.getTime())) continue;

    let evtMs = evt.startDate.getTime();
    if (evt.startDate.getFullYear() !== anchor.getFullYear()) {
      const aligned = new Date(evt.startDate);
      aligned.setFullYear(anchor.getFullYear());
      evtMs = aligned.getTime();
    }

    // STRICT CHECK: Discard any events outside the 84-day testing window
    if (evtMs < windowStartMs || evtMs > windowEndMs) {
      continue;
    }

    const msFromEnd = windowEndMs - evtMs;
    const daysFromEnd = msFromEnd / (24 * 60 * 60 * 1000);
    const weekFromEnd = Math.floor(daysFromEnd / 7);
    const targetIndex = Math.min(11, Math.max(0, 11 - weekFromEnd));

    // Filter out non-meeting events (birthdays, personal events, festivals, lodging, travel, entertainment)
    const titleLower = (evt.title || '').toLowerCase();
    const isBirthday = evt.category === 'birthday' || /\b(birthday|b'day|bday|janmadin|birth\s*day)\b/i.test(titleLower);
    const isWeddingSocial = evt.category === 'personal' || /\b(wedding|marrag|marriage|reception|engagement|shaadi|shadi|vivah|sangeet|mehendi|haldi|anniversary|party|family|puja|pooja|darshan|temple|charcha|gup-shup|catchup|get-together|dinner|lunch|gathering|personal)\b/i.test(titleLower);
    const isFestival = evt.category === 'festival' || /\b(holiday|festival|diwali|deepavali|eid|ramadan|christmas|easter|independence day|republic day|gandhi|raksha bandhan|rakhi|janmashtami|ganesh|ganpati|dussehra|dasara|navratri|durga puja|onam|pongal|bihu|holi|makar sankranti|shivratri|maha shivratri|ugadi|gudi padwa|milad|muharram|bakrid|good friday|bhai dooj|govardhan|karwa chauth|guru nanak|thiruvonam)\b/i.test(titleLower);
    const isLodgingOrDining = /\b(stay at|hotel|hostel|inn|resort|lodge|airbnb|motel|check-in|checkout|reservation at|dinner at|lunch at)\b/i.test(titleLower);
    const isTravel = evt.category === 'travel' || (/\b(flight|flights|airline|airlines|airport|boarding\s+pass|airways)\b/i.test(titleLower) &&
      !titleLower.includes('terminal window') &&
      !titleLower.includes('web terminal') &&
      !titleLower.includes('cli') &&
      !titleLower.includes('bash'));
    const isPersonalTicket = evt.category === 'personal' || /\b(movie|cinema|imax|theatre|theater|concert|ticket|aquarium|cruise|cruises|tour to|bus to|\(u\/a\)|\(ua\d*\+?\)|\(u\)|\(a\))\b/i.test(titleLower);

    if (isTravel) {
      rawWeeklyTelemetry[targetIndex].flightShifts += 1;
    }

    const isMeeting = !evt.isAllDay && !isBirthday && !isWeddingSocial && !isFestival && !isLodgingOrDining && !isTravel && !isPersonalTicket;

    if (isMeeting) {
      // Clamp meeting duration to realistic max (e.g. 6.0 hours max per single meeting)
      const cappedHours = Math.min(Math.max(0.25, evt.durationHours || 1.0), 6.0);
      rawWeeklyTelemetry[targetIndex].meetingHours += cappedHours;

      if (evt.isCurfewBreach) {
        rawWeeklyTelemetry[targetIndex].eveningCalls += 1;
      }
    }
  }

  // Format meeting hours cleanly
  const weeklyTelemetry = rawWeeklyTelemetry.map(w => ({
    ...w,
    meetingHours: parseFloat(w.meetingHours.toFixed(1)),
  }));

  // Totals strictly derived from the 12-week testing window
  const totalMeetingHours = Math.round(weeklyTelemetry.reduce((sum, w) => sum + w.meetingHours, 0));
  const eveningCalls = weeklyTelemetry.reduce((sum, w) => sum + w.eveningCalls, 0);
  const totalFlights = weeklyTelemetry.reduce((sum, w) => sum + w.flightShifts, 0);

  // Calculate day distribution
  const dayCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const lateDayCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  for (const evt of events) {
    if (evt.day && dayCounts[evt.day] !== undefined) {
      dayCounts[evt.day]++;
      if (evt.isCurfewBreach) {
        lateDayCounts[evt.day]++;
      }
    }
  }

  let busiestDay = 'Monday';
  let maxDayCount = -1;
  for (const [day, cnt] of Object.entries(dayCounts)) {
    if (cnt > maxDayCount) {
      maxDayCount = cnt;
      busiestDay = day === 'Mon' ? 'Monday' : day === 'Tue' ? 'Tuesday' : day === 'Wed' ? 'Wednesday' : day === 'Thu' ? 'Thursday' : day === 'Fri' ? 'Friday' : day === 'Sat' ? 'Saturday' : 'Sunday';
    }
  }

  let peakLateDay = 'Thursday';
  let maxLateCount = -1;
  for (const [day, cnt] of Object.entries(lateDayCounts)) {
    if (cnt > maxLateCount) {
      maxLateCount = cnt;
      peakLateDay = day === 'Mon' ? 'Monday' : day === 'Tue' ? 'Tuesday' : day === 'Wed' ? 'Wednesday' : day === 'Thu' ? 'Thursday' : day === 'Fri' ? 'Friday' : day === 'Sat' ? 'Saturday' : 'Sunday';
    }
  }

  // Calculate actual time range of late calls in biological evening order (19:00 -> 24:00 -> 04:59)
  const lateCalls = events.filter(e => e.isCurfewBreach);
  let avgLateTimeRange = '7:30 PM to 10:30 PM';
  if (lateCalls.length > 0) {
    const sortedHours = lateCalls
      .map(e => e.startHour)
      .filter(h => h > 0)
      .sort((a, b) => {
        const nightA = a < 12 ? a + 24 : a;
        const nightB = b < 12 ? b + 24 : b;
        return nightA - nightB;
      });

    if (sortedHours.length > 0) {
      const minH = sortedHours[0];
      const maxH = sortedHours[sortedHours.length - 1];
      const formatH = (h: number) => {
        const hour = Math.floor(h);
        const min = Math.round((h - hour) * 60);
        const h12 = hour % 12 || 12;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${h12}:${min < 10 ? '0' : ''}${min} ${ampm}`;
      };
      avgLateTimeRange = minH === maxH ? formatH(minH) : `${formatH(minH)} to ${formatH(maxH)}`;
    }
  }

  const avgMeetingDurationMins = events.length > 0
    ? Math.max(15, Math.round((totalMeetingHours / events.length) * 60))
    : 45;

  const curfewBreachPct = events.length > 0
    ? parseFloat(((eveningCalls / events.length) * 100).toFixed(1))
    : 0;

  return {
    events,
    totalMeetingHours: Math.round(totalMeetingHours),
    eveningCalls,
    totalEvents: events.length,
    totalFlights,
    curfewBreachPct,
    busiestDay,
    peakLateDay,
    avgLateTimeRange,
    avgMeetingDurationMins,
    weeklyTelemetry,
  };
}

function parseIcsDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // Format: 20260914T140000Z or 20260914T140000 or 20260914
  const match = clean.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const minute = match[5] ? parseInt(match[5], 10) : 0;
    const second = match[6] ? parseInt(match[6], 10) : 0;
    const isUtc = !!match[7];

    if (isUtc) {
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    return new Date(year, month, day, hour, minute, second);
  }

  // Fallback: standard ISO date parse
  const fallbackDate = new Date(clean);
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }

  return null;
}

function formatTime12h(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minStr} ${ampm}`;
}
