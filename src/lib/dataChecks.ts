import type { HairCortisolSegment, WeeklyTelemetry } from './types';

/**
 * Checks the data Tricha is about to reason over, before any agent sees it.
 * Missing or implausible inputs are flagged, not guessed: the agents are told
 * about each flag, and the reply asks the person to confirm anything that
 * affects the answer. Nothing here blocks a reply; an empty calendar or a
 * missing questionnaire only narrows what can be said.
 *
 * Benchmarked by scripts/benchmark-triage.mjs (data section).
 */

export type FlagSeverity = 'warn' | 'info';

export interface DataFlag {
  severity: FlagSeverity;
  field: 'hair' | 'calendar' | 'pss10' | 'score';
  message: string;
}

/** Published hair cortisol values usually fall well under this; anything above is more likely a typing or unit error. */
const PLAUSIBLE_MAX = 200;

export function checkInputs(input: {
  segments: HairCortisolSegment[];
  telemetry: WeeklyTelemetry[];
  pss10Score?: number | null;
  stressScore?: number | null;
}): DataFlag[] {
  const flags: DataFlag[] = [];
  const segments = Array.isArray(input.segments) ? input.segments : [];

  if (segments.length === 0) {
    flags.push({ severity: 'warn', field: 'hair', message: 'No hair cortisol result is on file, so nothing can be said about this person\'s cortisol yet.' });
  } else {
    const values = segments.map(s => Number(s?.cortisolPgPerMg));
    if (values.some(v => !Number.isFinite(v))) {
      flags.push({ severity: 'warn', field: 'hair', message: 'One hair segment has no readable cortisol value. Ask the person to check the lab report.' });
    }
    values.forEach((v, i) => {
      const label = segments[i]?.title || `segment ${i + 1}`;
      if (Number.isFinite(v) && v <= 0) {
        flags.push({ severity: 'warn', field: 'hair', message: `${label}: ${v} pg/mg is not a possible value. Ask the person to check the lab report.` });
      } else if (Number.isFinite(v) && v > PLAUSIBLE_MAX) {
        flags.push({ severity: 'warn', field: 'hair', message: `${label}: ${v} pg/mg is far above values usually reported, likely a typing or unit error (pg/mg, not ng/g or nmol/L). Ask the person to confirm before interpreting it.` });
      }
    });
    if (segments.length < 3) {
      flags.push({ severity: 'info', field: 'hair', message: `Only ${segments.length} of 3 monthly segments are on file, so the 3-month trend is incomplete.` });
    }
    const titles = segments.map(s => (s?.title || '').trim().toLowerCase()).filter(Boolean);
    if (new Set(titles).size < titles.length) {
      flags.push({ severity: 'warn', field: 'hair', message: 'Two hair segments have the same month. The months may be mislabelled.' });
    }
  }

  const weeks = Array.isArray(input.telemetry) ? input.telemetry : [];
  const anyMeetings = weeks.some(w => (w?.meetingHours || 0) > 0 || (w?.eveningCalls || 0) > 0);
  if (weeks.length === 0 || !anyMeetings) {
    flags.push({ severity: 'info', field: 'calendar', message: 'No calendar data is connected, so the cause of a high month cannot be checked against meetings.' });
  } else if (weeks.some(w => (w?.meetingHours || 0) > 100)) {
    flags.push({ severity: 'warn', field: 'calendar', message: 'One week shows more than 100 meeting hours, which suggests duplicated or all-day events in the calendar.' });
  }

  if (typeof input.pss10Score !== 'number') {
    flags.push({ severity: 'info', field: 'pss10', message: 'The PSS-10 questionnaire has not been taken, so self-reported stress cannot be compared with the hair result.' });
  } else if (input.pss10Score < 0 || input.pss10Score > 40) {
    flags.push({ severity: 'warn', field: 'pss10', message: `A PSS-10 score of ${input.pss10Score} is outside 0 to 40, so it was ignored.` });
  }

  return flags;
}

/** The flags as text for an agent's input. */
export function flagsForAgents(flags: DataFlag[]): string {
  if (flags.length === 0) return 'Data checks: all inputs look complete and plausible.';
  return `Data checks (do not guess around these; if a warning affects the answer, say so and ask the person to confirm):\n${flags
    .map(f => `- [${f.severity}] ${f.message}`)
    .join('\n')}`;
}
