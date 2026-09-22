/**
 * Indian Standard Time (IST) Utility
 * IST is fixed at UTC+5:30 (19,800,000 ms) with no daylight saving time (DST).
 * These helpers guarantee that all date/time operations evaluate in Asia/Kolkata
 * regardless of the client machine's or server's local timezone (e.g. GST in Dubai, PDT, EST, GMT).
 */

export const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000; // 19,800,000 ms

export interface ISTDateInfo {
  year: number;
  month: number; // 0-11
  monthNum: number; // 1-12
  date: number; // 1-31
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  hours: number; // 0-23
  minutes: number; // 0-59
  seconds: number;
  dayName: string; // 'Sun', 'Mon', etc.
  monthName: string; // 'Jan', 'Feb', etc.
  dateFormatted: string; // 'Sep 22'
  dateKey: string; // 'YYYY-MM-DD'
  time12h: string; // '07:30 PM'
  startHour: number; // 19.5
  isCurfew: boolean; // >= 19.0 || < 5.0
}

export function getISTDateInfo(dateInput: Date | number | string): ISTDateInfo {
  let ms: number;
  if (typeof dateInput === 'number') {
    ms = dateInput;
  } else if (dateInput instanceof Date) {
    ms = dateInput.getTime();
  } else if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Check if it's already YYYY-MM-DD
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
      const y = parseInt(ymdMatch[1], 10);
      const m = parseInt(ymdMatch[2], 10) - 1;
      const d = parseInt(ymdMatch[3], 10);
      // Midnight in IST
      ms = Date.UTC(y, m, d, 0, 0, 0) - IST_OFFSET_MS;
    } else {
      const parsed = new Date(trimmed).getTime();
      ms = isNaN(parsed) ? Date.now() : parsed;
    }
  } else {
    ms = Date.now();
  }

  // Shift UTC by +5h30m to get IST date components via getUTC* methods
  const istDate = new Date(ms + IST_OFFSET_MS);

  const year = istDate.getUTCFullYear();
  const month = istDate.getUTCMonth();
  const monthNum = month + 1;
  const date = istDate.getUTCDate();
  const dayOfWeek = istDate.getUTCDay();
  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const seconds = istDate.getUTCSeconds();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = dayNames[dayOfWeek];
  const monthName = monthNames[month];
  const dateFormatted = `${monthName} ${date}`;
  const dateKey = `${year}-${String(monthNum).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const time12h = `${h12}:${minStr} ${ampm}`;

  const startHour = parseFloat((hours + minutes / 60).toFixed(2));
  const isCurfew = hours >= 19 || hours < 5;

  return {
    year,
    month,
    monthNum,
    date,
    dayOfWeek,
    hours,
    minutes,
    seconds,
    dayName,
    monthName,
    dateFormatted,
    dateKey,
    time12h,
    startHour,
    isCurfew,
  };
}

export function formatISTTime12h(dateInput: Date | number | string): string {
  return getISTDateInfo(dateInput).time12h;
}

export function getTodayISTKey(): string {
  return getISTDateInfo(Date.now()).dateKey;
}

export function getNowISTDate(): Date {
  return new Date(Date.now() + IST_OFFSET_MS);
}

export function getUpcomingISTDays(count: number = 28): Array<{ dateKey: string; day: string; dayDate: string }> {
  const result: Array<{ dateKey: string; day: string; dayDate: string }> = [];
  const nowMs = Date.now();
  for (let i = 0; i < count; i++) {
    const ms = nowMs + i * 24 * 60 * 60 * 1000;
    const info = getISTDateInfo(ms);
    result.push({
      dateKey: info.dateKey,
      day: info.dayName,
      dayDate: info.dateFormatted,
    });
  }
  return result;
}

export function formatHourFloatTo12hIST(h: number): string {
  const normalized = ((h % 24) + 24) % 24;
  const hourInt = Math.floor(normalized);
  const minInt = Math.round((normalized - hourInt) * 60);
  const h12 = hourInt % 12 || 12;
  const ampm = hourInt >= 12 ? 'PM' : 'AM';
  return `${String(h12).padStart(2, '0')}:${String(minInt).padStart(2, '0')} ${ampm}`;
}

export function getISTDateFromKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - IST_OFFSET_MS);
}
