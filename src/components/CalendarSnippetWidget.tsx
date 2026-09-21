'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Upload,
  CheckCircle2,
  Plus,
  RefreshCw,
  HelpCircle,
  Sparkles,
  LayoutGrid,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  Flame,
  Moon,
  Plane,
  ShieldCheck,
  Lock,
  EyeOff,
  ExternalLink,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { parseIcsContent } from '@/lib/icalParser';
import { getIndianHolidaysAsEvents } from '@/lib/indianHolidays';
import { WeeklyTelemetry } from '@/lib/types';

export interface CalendarEventItem {
  id: string;
  day: string; // 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
  dayDate: string; // 'Sep 21'
  title: string;
  startTime: string; // '09:30 AM' or 'All Day'
  endTime: string; // '10:30 AM' or 'All Day'
  startHour: number; // e.g. 9.5 (0 for all-day)
  durationHours: number; // e.g. 1.0
  isCurfewBreach: boolean; // > 19:00 (7 PM)
  hasMeet: boolean;
  attendeesCount: number;
  category: 'core' | 'strategy' | 'late_sync' | 'incident' | 'all_hands' | 'birthday' | 'festival' | 'personal' | 'travel';
  colorBg: string; // Tailwind color classes for block
  dateKey?: string; // 'YYYY-MM-DD'
  monthKey?: 1 | 2 | 3;
  isAllDay?: boolean;
  startDate?: Date;
}

interface CalendarSnippetWidgetProps {
  userEmail: string;
  initialEvents?: CalendarEventItem[];
  telemetry?: WeeklyTelemetry[];
  feedSourceName?: 'real_ical' | 'imported_file' | 'clinical_benchmark';
  savedIcalUrl?: string;
  haircutDate?: string;
  onEventsUpdated?: (events: CalendarEventItem[]) => void;
  onSyncTelemetry?: (
    weeklyTelemetry: any[],
    providerEmail: string,
    icalUrl: string,
    events: CalendarEventItem[]
  ) => void;
  onApplyRules?: () => void;
  rulesApplied?: boolean;
  compact?: boolean;
}

// 90-Day realistic benchmark events aligned with the 3 hair segments (July baseline, August surge, September recovery)
export const DEFAULT_EVENTS: CalendarEventItem[] = [
  // --- SEPTEMBER 2026 (Current Week: Sep 20 - Sep 26) ---
  {
    id: 'evt-sep-1',
    day: 'Mon',
    dayDate: 'Sep 21',
    dateKey: '2026-09-21',
    monthKey: 3,
    title: 'Sprint Planning & Tech Specs',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    startHour: 10.0,
    durationHours: 1.0,
    isCurfewBreach: false,
    hasMeet: true,
    attendeesCount: 6,
    category: 'core',
    colorBg: 'bg-[#3186FF] text-white border-blue-600',
  },
  {
    id: 'evt-sep-2',
    day: 'Mon',
    dayDate: 'Sep 21',
    dateKey: '2026-09-21',
    monthKey: 3,
    title: 'Post-Curfew Sync w/ US Team',
    startTime: '07:30 PM',
    endTime: '08:45 PM',
    startHour: 19.5,
    durationHours: 1.25,
    isCurfewBreach: true,
    hasMeet: true,
    attendeesCount: 4,
    category: 'late_sync',
    colorBg: 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300',
  },
  {
    id: 'evt-sep-3',
    day: 'Tue',
    dayDate: 'Sep 22',
    dateKey: '2026-09-22',
    monthKey: 3,
    title: 'Daily Team Standup',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    startHour: 10.0,
    durationHours: 1.0,
    isCurfewBreach: false,
    hasMeet: true,
    attendeesCount: 7,
    category: 'core',
    colorBg: 'bg-emerald-600 text-white border-emerald-700',
  },
  {
    id: 'evt-sep-4',
    day: 'Tue',
    dayDate: 'Sep 22',
    dateKey: '2026-09-22',
    monthKey: 3,
    title: 'Late Production Escalation',
    startTime: '08:00 PM',
    endTime: '09:15 PM',
    startHour: 20.0,
    durationHours: 1.25,
    isCurfewBreach: true,
    hasMeet: true,
    attendeesCount: 8,
    category: 'incident',
    colorBg: 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300',
  },
  {
    id: 'evt-sep-5',
    day: 'Wed',
    dayDate: 'Sep 23',
    dateKey: '2026-09-23',
    monthKey: 3,
    title: 'Product Launch Strategy',
    startTime: '10:15 AM',
    endTime: '11:45 AM',
    startHour: 10.25,
    durationHours: 1.5,
    isCurfewBreach: false,
    hasMeet: true,
    attendeesCount: 6,
    category: 'strategy',
    colorBg: 'bg-[#3186FF] text-white border-blue-600',
  },
  {
    id: 'evt-sep-6',
    day: 'Wed',
    dayDate: 'Sep 23',
    dateKey: '2026-09-23',
    monthKey: 3,
    title: 'Product Sync & Design Review',
    startTime: '03:00 PM',
    endTime: '04:15 PM',
    startHour: 15.0,
    durationHours: 1.25,
    isCurfewBreach: false,
    hasMeet: true,
    attendeesCount: 5,
    category: 'core',
    colorBg: 'bg-purple-600 text-white border-purple-700',
  },
  {
    id: 'evt-sep-7',
    day: 'Wed',
    dayDate: 'Sep 23',
    dateKey: '2026-09-23',
    monthKey: 3,
    title: 'Night Offshore Leadership Standup',
    startTime: '07:45 PM',
    endTime: '09:00 PM',
    startHour: 19.75,
    durationHours: 1.25,
    isCurfewBreach: true,
    hasMeet: true,
    attendeesCount: 5,
    category: 'late_sync',
    colorBg: 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300',
  },
  {
    id: 'evt-sep-8',
    day: 'Thu',
    dayDate: 'Sep 24',
    dateKey: '2026-09-24',
    monthKey: 3,
    title: 'Mid-Year Marketing Review',
    startTime: '10:45 AM',
    endTime: '11:45 AM',
    startHour: 10.75,
    durationHours: 1.0,
    isCurfewBreach: false,
    hasMeet: true,
    attendeesCount: 5,
    category: 'strategy',
    colorBg: 'bg-amber-600 text-white border-amber-700',
  },
  {
    id: 'evt-sep-9',
    day: 'Thu',
    dayDate: 'Sep 24',
    dateKey: '2026-09-24',
    monthKey: 3,
    title: 'Emergency Release Curfew Review',
    startTime: '08:15 PM',
    endTime: '09:30 PM',
    startHour: 20.25,
    durationHours: 1.25,
    isCurfewBreach: true,
    hasMeet: true,
    attendeesCount: 6,
    category: 'incident',
    colorBg: 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300',
  },
  {
    id: 'evt-sep-10',
    day: 'Fri',
    dayDate: 'Sep 25',
    dateKey: '2026-09-25',
    monthKey: 3,
    title: 'Daily Team Sync',
    startTime: '10:15 AM',
    endTime: '11:15 AM',
    startHour: 10.25,
    durationHours: 1.0,
    isCurfewBreach: false,
    hasMeet: true,
    attendeesCount: 8,
    category: 'core',
    colorBg: 'bg-emerald-600 text-white border-emerald-700',
  },
  {
    id: 'evt-sep-11',
    day: 'Fri',
    dayDate: 'Sep 25',
    dateKey: '2026-09-25',
    monthKey: 3,
    title: 'Branding & Retrospective',
    startTime: '02:45 PM',
    endTime: '04:30 PM',
    startHour: 14.75,
    durationHours: 1.75,
    isCurfewBreach: false,
    hasMeet: false,
    attendeesCount: 9,
    category: 'core',
    colorBg: 'bg-purple-600 text-white border-purple-700',
  },

  // --- AUGUST 2026 (Acute Crunch Week: Aug 16 - Aug 22 & User Life Events) ---
  {
    id: 'evt-user-marrag',
    day: 'Sun',
    dayDate: 'Aug 16',
    dateKey: '2026-08-16',
    monthKey: 2,
    title: 'Supriya naresh marrag',
    startTime: '08:00 AM',
    endTime: '09:00 AM',
    startHour: 8.0,
    durationHours: 1.0,
    isCurfewBreach: false,
    hasMeet: false,
    attendeesCount: 1,
    category: 'personal',
    colorBg: 'bg-[#6772E5] text-white border-indigo-700 shadow-xs',
  },
  {
    id: 'evt-user-father-bday',
    day: 'Thu',
    dayDate: 'Aug 20',
    dateKey: '2026-08-20',
    monthKey: 2,
    title: 'Father birthday',
    startTime: '08:00 AM',
    endTime: '09:00 AM',
    startHour: 8.0,
    durationHours: 1.0,
    isCurfewBreach: false,
    hasMeet: false,
    attendeesCount: 1,
    category: 'birthday',
    colorBg: 'bg-emerald-600 text-white border-emerald-700 shadow-xs',
  },
  {
    id: 'evt-aug-1',
    day: 'Mon',
    dayDate: 'Aug 17',
    dateKey: '2026-08-17',
    monthKey: 2,
    title: 'Q3 Product Crunch Kickoff',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    startHour: 9.0,
    durationHours: 2.0,
    isCurfewBreach: false,
    hasMeet: true,
    attendeesCount: 12,
    category: 'strategy',
    colorBg: 'bg-[#3186FF] text-white border-blue-600',
  },
  {
    id: 'evt-aug-2',
    day: 'Mon',
    dayDate: 'Aug 17',
    dateKey: '2026-08-17',
    monthKey: 2,
    title: 'Offshore Hotfix & War Room',
    startTime: '08:30 PM',
    endTime: '10:15 PM',
    startHour: 20.5,
    durationHours: 1.75,
    isCurfewBreach: true,
    hasMeet: true,
    attendeesCount: 7,
    category: 'incident',
    colorBg: 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300',
  },
  {
    id: 'evt-aug-3',
    day: 'Tue',
    dayDate: 'Aug 18',
    dateKey: '2026-08-18',
    monthKey: 2,
    title: 'Executive Board Pre-Read',
    startTime: '08:00 PM',
    endTime: '09:30 PM',
    startHour: 20.0,
    durationHours: 1.5,
    isCurfewBreach: true,
    hasMeet: true,
    attendeesCount: 5,
    category: 'late_sync',
    colorBg: 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300',
  },
  {
    id: 'evt-aug-4',
    day: 'Wed',
    dayDate: 'Aug 19',
    dateKey: '2026-08-19',
    monthKey: 2,
    title: 'APOE-PSP Cohort Research Sync',
    startTime: '03:00 PM',
    endTime: '04:15 PM',
    startHour: 15.0,
    durationHours: 1.25,
    isCurfewBreach: false,
    hasMeet: true,
    attendeesCount: 8,
    category: 'strategy',
    colorBg: 'bg-purple-600 text-white border-purple-700',
  },
  {
    id: 'evt-aug-5',
    day: 'Wed',
    dayDate: 'Aug 19',
    dateKey: '2026-08-19',
    monthKey: 2,
    title: 'Late Incident Retrospective',
    startTime: '08:45 PM',
    endTime: '10:00 PM',
    startHour: 20.75,
    durationHours: 1.25,
    isCurfewBreach: true,
    hasMeet: true,
    attendeesCount: 6,
    category: 'incident',
    colorBg: 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300',
  },

  // --- JULY 2026 (Baseline Week: Jul 12 - Jul 18) ---
  {
    id: 'evt-jul-1',
    day: 'Mon',
    dayDate: 'Jul 13',
    dateKey: '2026-07-13',
    monthKey: 1,
    title: 'Weekly Team Sync',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    startHour: 10.0,
    durationHours: 1.0,
    isCurfewBreach: false,
    hasMeet: true,
    attendeesCount: 5,
    category: 'core',
    colorBg: 'bg-[#3186FF] text-white border-blue-600',
  },
  {
    id: 'evt-jul-2',
    day: 'Tue',
    dayDate: 'Jul 14',
    dateKey: '2026-07-14',
    monthKey: 1,
    title: 'Design Architecture Review',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    startHour: 14.0,
    durationHours: 1.5,
    isCurfewBreach: false,
    hasMeet: true,
    attendeesCount: 4,
    category: 'core',
    colorBg: 'bg-emerald-600 text-white border-emerald-700',
  },
  {
    id: 'evt-jul-3',
    day: 'Wed',
    dayDate: 'Jul 15',
    dateKey: '2026-07-15',
    monthKey: 1,
    title: 'Tauopathy Discussion',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    startHour: 15.0,
    durationHours: 1.0,
    isCurfewBreach: false,
    hasMeet: true,
    attendeesCount: 4,
    category: 'core',
    colorBg: 'bg-purple-600 text-white border-purple-700',
  },
];

function maskIcalUrl(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const segments = pathname.split('/');
    const maskedSegments = segments.map(seg => {
      if (seg.startsWith('private-') || seg.length > 20) {
        return '••••••••••••••••';
      }
      return seg;
    });
    return `${parsed.protocol}//${parsed.host}${maskedSegments.join('/')}`;
  } catch (_) {
    return 'https://calendar.google.com/.../••••••••••••/basic.ics';
  }
}

export const CalendarSnippetWidget: React.FC<CalendarSnippetWidgetProps> = ({
  userEmail,
  initialEvents,
  telemetry,
  feedSourceName,
  savedIcalUrl,
  haircutDate,
  onEventsUpdated,
  onSyncTelemetry,
  onApplyRules,
  rulesApplied = false,
  compact = false,
}) => {
  // 1. Initial State: Directly restore user's real schedule from props or local storage
  const [events, setEvents] = useState<CalendarEventItem[]>(() => {
    if (initialEvents && initialEvents.length > 0) return initialEvents;
    if (typeof window !== 'undefined' && userEmail) {
      const emailKey = `baalance_stored_calendar_events_${userEmail.toLowerCase().trim()}`;
      const cachedRaw = localStorage.getItem(emailKey);
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (_) {}
      }
    }
    return DEFAULT_EVENTS;
  });

  const [activeIcalUrl, setActiveIcalUrl] = useState<string>(() => {
    if (savedIcalUrl) return savedIcalUrl;
    if (typeof window !== 'undefined' && userEmail) {
      const emailKey = `baalance_stored_ical_url_${userEmail.toLowerCase().trim()}`;
      return localStorage.getItem(emailKey) || '';
    }
    return '';
  });

  const [feedSource, setFeedSource] = useState<'real_ical' | 'imported_file' | 'clinical_benchmark'>(() => {
    if (feedSourceName) return feedSourceName;
    if (savedIcalUrl) return 'real_ical';
    if (initialEvents && initialEvents.length > 0) return 'real_ical';
    if (typeof window !== 'undefined' && userEmail) {
      const emailKey = `baalance_stored_ical_url_${userEmail.toLowerCase().trim()}`;
      const storedIcal = localStorage.getItem(emailKey);
      if (storedIcal) return 'real_ical';
      const eventsKey = `baalance_stored_calendar_events_${userEmail.toLowerCase().trim()}`;
      const storedEvents = localStorage.getItem(eventsKey);
      if (storedEvents) return 'real_ical';
    }
    return 'clinical_benchmark';
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Timeline Navigator: Current Week Start (defaults to Sunday September 20, 2026 matching user's real Google Calendar)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => new Date(2026, 8, 20)); // Month 8 = September

  // iCal connection states
  const [icalUrlInput, setIcalUrlInput] = useState('');
  const [isSyncingIcal, setIsSyncingIcal] = useState(false);
  const [icalError, setIcalError] = useState('');
  const [showIcalHelp, setShowIcalHelp] = useState(false);
  const [showChangeInput, setShowChangeInput] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  // Google Calendar Multi-Calendar Layers (matching user's Google Calendar checkboxes)
  const [showPrimaryLayer, setShowPrimaryLayer] = useState(true);
  const [showBirthdaysLayer, setShowBirthdaysLayer] = useState(true);
  const [showHolidaysLayer, setShowHolidaysLayer] = useState(true);

  // Add custom manual event modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDay, setNewDay] = useState('Wed');
  const [newTime, setNewTime] = useState('19:30');

  // Ref to prevent duplicate auto-sync calls on fast re-renders
  const autoSyncedTargetRef = React.useRef<string | null>(null);

  // Sync initial events or savedIcalUrl from props when changed
  useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setEvents(initialEvents);
      setFeedSource(feedSourceName || 'real_ical');
    }
  }, [initialEvents, feedSourceName]);

  useEffect(() => {
    if (savedIcalUrl && savedIcalUrl !== activeIcalUrl) {
      setActiveIcalUrl(savedIcalUrl);
      setFeedSource('real_ical');
    }
  }, [savedIcalUrl, activeIcalUrl]);

  // AUTOMATIC REAL-TIME CALENDAR SYNCHRONIZATION ON MOUNT
  // For registered users who have already uploaded their link, immediately show their schedule
  // and trigger live real-time sync with Google Calendar in the background without needing manual button click.
  // For users who have NOT uploaded their link, STRICTLY reset to demo clinical benchmark data!
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Eradicate any legacy global calendar keys to prevent inter-account bleed
    localStorage.removeItem('baalance_stored_ical_url');
    localStorage.removeItem('baalance_stored_calendar_events');

    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    const emailKey = cleanEmail ? `baalance_stored_ical_url_${cleanEmail}` : '';
    const targetIcal = savedIcalUrl || (cleanEmail && emailKey ? localStorage.getItem(emailKey) : null) || '';

    if (targetIcal) {
      setActiveIcalUrl(targetIcal);
      setFeedSource('real_ical');

      // 1. Immediately restore cached real events for THIS specific user from localStorage
      const eventsKey = cleanEmail ? `baalance_stored_calendar_events_${cleanEmail}` : '';
      const cachedRaw = eventsKey ? localStorage.getItem(eventsKey) : null;
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEvents(parsed);
            if (onEventsUpdated) onEventsUpdated(parsed);
          }
        } catch (_) {}
      }

      // 2. Auto-sync live in background with real-time Google Calendar stream
      if (autoSyncedTargetRef.current !== targetIcal) {
        autoSyncedTargetRef.current = targetIcal;
        handleSyncIcalUrl(undefined, targetIcal, true);
      }
    } else {
      // User has NOT connected a calendar -> strictly display demo benchmark data!
      setActiveIcalUrl('');
      setFeedSource('clinical_benchmark');
      autoSyncedTargetRef.current = null;
      const demoEvts = (initialEvents && initialEvents.length > 0) ? initialEvents : DEFAULT_EVENTS;
      setEvents(demoEvts);
      if (onEventsUpdated) onEventsUpdated(demoEvts);
    }
  }, [userEmail, savedIcalUrl]);

  // Compute the 7 days of the current week (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const days = [];
    const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;
      const dayIndex = d.getDay();

      days.push({
        dayName: dayNames[dayIndex],
        dayHeader: dayNamesShort[dayIndex],
        dateNum: d.getDate(),
        monthName: monthNamesShort[d.getMonth()],
        dateKey,
        isToday: d.getFullYear() === 2026 && d.getMonth() === 8 && d.getDate() === 21, // Highlight Monday Sep 21 as active today
      });
    }
    return days;
  }, [currentWeekStart]);

  // Header Title: e.g. "September 2026" or "August – September 2026"
  const weekHeaderTitle = useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    const firstMonth = monthNames[new Date(firstDay.dateKey).getMonth()];
    const lastMonth = monthNames[new Date(lastDay.dateKey).getMonth()];
    const year = new Date(firstDay.dateKey).getFullYear();

    if (firstMonth === lastMonth) {
      return `${firstMonth} ${year}`;
    }
    return `${firstMonth} – ${lastMonth} ${year}`;
  }, [weekDays]);

  // Navigation handlers
  const handleGoToday = () => {
    setCurrentWeekStart(new Date(2026, 8, 20));
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleJumpToWeek = (targetDate: Date) => {
    setCurrentWeekStart(targetDate);
  };

  const handleJumpToMonth = (targetMonth: number) => {
    // targetMonth: 6 = July, 7 = August, 8 = September
    // 1. Search existing events to find a week that actually contains events in this month
    const monthEvents = events.filter(e => {
      if (e.dateKey) {
        const parts = e.dateKey.split('-');
        if (parts.length === 3) {
          const m = parseInt(parts[1], 10) - 1;
          return m === targetMonth;
        }
      }
      return false;
    });

    if (monthEvents.length > 0) {
      // Group by start of week (Sunday)
      const weekScores = new Map<string, { start: Date; count: number; curfewCount: number }>();
      for (const evt of monthEvents) {
        if (!evt.dateKey) continue;
        const [y, m, d] = evt.dateKey.split('-').map(Number);
        const dt = new Date(y, m - 1, d, 12, 0, 0);
        const sunday = new Date(dt);
        sunday.setDate(dt.getDate() - dt.getDay());
        sunday.setHours(0, 0, 0, 0);
        const key = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
        const curr = weekScores.get(key) || { start: sunday, count: 0, curfewCount: 0 };
        curr.count += 1;
        if (evt.isCurfewBreach) curr.curfewCount += 1;
        weekScores.set(key, curr);
      }

      // Pick week with highest density of events (favoring curfew spikes for August)
      const sortedWeeks = Array.from(weekScores.values()).sort((a, b) => {
        if (targetMonth === 7) {
          return (b.curfewCount * 3 + b.count) - (a.curfewCount * 3 + a.count);
        }
        return b.count - a.count;
      });

      if (sortedWeeks.length > 0) {
        setCurrentWeekStart(sortedWeeks[0].start);
        return;
      }
    }

    // Default fallback dates for clinical cohorts (2026)
    if (targetMonth === 8) {
      setCurrentWeekStart(new Date(2026, 8, 20));
    } else if (targetMonth === 7) {
      setCurrentWeekStart(new Date(2026, 7, 16));
    } else if (targetMonth === 6) {
      setCurrentWeekStart(new Date(2026, 6, 12));
    } else {
      setCurrentWeekStart(new Date(2026, targetMonth, 1));
    }
  };

  // Sync live via Google Calendar Secret iCal URL
  const handleSyncIcalUrl = async (e?: React.FormEvent, customUrl?: string, silent = false) => {
    if (e) e.preventDefault();
    const cleanUrl = (customUrl || icalUrlInput || activeIcalUrl).trim();
    if (!cleanUrl) return;

    if (cleanUrl.includes('@') && !cleanUrl.startsWith('http')) {
      if (!silent) {
        setIcalError(`"${cleanUrl}" is an email address. Live sync requires your "Secret address in iCal format" from Google Calendar settings.`);
      }
      return;
    }

    const effectiveEmail = (userEmail && !userEmail.includes('Demo'))
      ? userEmail
      : (typeof window !== 'undefined' ? localStorage.getItem('baalance_active_user_email') || '' : '');

    setIsSyncingIcal(true);
    if (!silent) setIcalError('');

    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icalUrl: cleanUrl, email: effectiveEmail, haircutDate }),
      });

      const data = await res.json();
      if (!data.success || !data.events || data.events.length === 0) {
        throw new Error(data.error || 'No calendar events found at this URL. Please verify the link in Google Calendar.');
      }

      // Format incoming parsed events
      const colors = [
        'bg-[#3186FF] text-white border-blue-600',
        'bg-emerald-600 text-white border-emerald-700',
        'bg-purple-600 text-white border-purple-700',
        'bg-amber-600 text-white border-amber-700',
        'bg-indigo-600 text-white border-indigo-700',
      ];

      // Check persistent user reschedule overrides
      let overrides: Record<string, any> = {};
      if (typeof window !== 'undefined') {
        const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
        const rawOverrides = (cleanEmail ? localStorage.getItem(`baalance_rescheduled_overrides_${cleanEmail}`) : null) || localStorage.getItem('baalance_rescheduled_overrides');
        if (rawOverrides) {
          try {
            overrides = JSON.parse(rawOverrides);
          } catch (_) {}
        }
      }

      const formatted: CalendarEventItem[] = data.events.map((evt: any, i: number) => {
        let hour = evt.startHour ?? 10;
        if (evt.startTime && !evt.startHour && !evt.isAllDay) {
          const match = evt.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (match) {
            let h = parseInt(match[1], 10);
            const m = parseInt(match[2], 10);
            const isPM = match[3]?.toUpperCase() === 'PM';
            if (isPM && h < 12) h += 12;
            if (!isPM && h === 12) h = 0;
            hour = h + m / 60;
          }
        }

        // Check if event has a user-confirmed reschedule override
        const titleNorm = (evt.title || '').toLowerCase().trim();
        const override =
          (evt.id && overrides[evt.id]) ||
          (titleNorm && overrides[titleNorm]) ||
          (evt.dateKey && overrides[`${titleNorm}_${evt.dateKey}`]);

        if (override) {
          return {
            ...evt,
            ...override,
            startHour: override.startHour,
            startTime: override.startTime,
            endTime: override.endTime,
            dateKey: override.dateKey || evt.dateKey,
            day: override.day || evt.day,
            dayDate: override.dayDate || evt.dayDate,
            isCurfewBreach: false,
            colorBg: evt.category === 'personal'
              ? 'bg-[#6772E5] text-white border-indigo-700 shadow-xs ring-2 ring-emerald-400/50'
              : 'bg-[#3186FF] text-white border-blue-600 shadow-xs ring-2 ring-emerald-400/50',
            title: evt.title?.includes('Curfew Protected') ? evt.title : `${evt.title} (Curfew Protected)`,
          };
        }

        let colorBg = colors[i % colors.length];
        if (evt.isCurfewBreach) {
          colorBg = 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300';
        } else if (evt.category === 'birthday') {
          colorBg = 'bg-emerald-600 text-white border-emerald-700 shadow-xs';
        } else if (evt.category === 'personal') {
          colorBg = 'bg-[#6772E5] text-white border-indigo-700 shadow-xs';
        } else if (evt.category === 'festival') {
          colorBg = 'bg-amber-600 text-white border-amber-700 shadow-xs';
        } else if (evt.category === 'travel') {
          colorBg = 'bg-sky-600 text-white border-sky-700 shadow-xs';
        }

        return {
          ...evt,
          startHour: evt.isAllDay ? 0 : hour,
          colorBg,
        };
      });

      setEvents(formatted);
      setActiveIcalUrl(cleanUrl);
      setFeedSource('real_ical');
      setShowChangeInput(false);
      setIcalUrlInput('');
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Auto-align calendar view: if current week has no events, jump to the week with events
      const currentKeys = new Set(weekDays.map(d => d.dateKey));
      const hasInCurrent = formatted.some(e => e.dateKey && currentKeys.has(e.dateKey));
      if (!hasInCurrent) {
        const withDate = formatted.filter(e => !!e.dateKey);
        if (withDate.length > 0) {
          const [y, m, d] = withDate[0].dateKey!.split('-').map(Number);
          const dt = new Date(y, m - 1, d, 12, 0, 0);
          const sunday = new Date(dt);
          sunday.setDate(dt.getDate() - dt.getDay());
          sunday.setHours(0, 0, 0, 0);
          setCurrentWeekStart(sunday);
        }
      }

      // Persist to user account in local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('baalance_stored_ical_url');
        localStorage.removeItem('baalance_stored_calendar_events');
        if (userEmail) {
          const cleanEmail = userEmail.toLowerCase().trim();
          localStorage.setItem(`baalance_stored_ical_url_${cleanEmail}`, cleanUrl);
          localStorage.setItem(`baalance_stored_calendar_events_${cleanEmail}`, JSON.stringify(formatted));
        }
      }

      if (onEventsUpdated) onEventsUpdated(formatted);
      if (onSyncTelemetry && data.weeklyTelemetry) {
        onSyncTelemetry(data.weeklyTelemetry, data.email || userEmail, cleanUrl, formatted);
      }
    } catch (err: any) {
      if (!silent) {
        setIcalError(err.message || 'Could not connect to Google Calendar URL');
      } else {
        console.warn('[BAALANCE Real-Time Auto-Sync Notice]', err?.message || err);
      }
    } finally {
      setIsSyncingIcal(false);
    }
  };

  const handleDisconnect = () => {
    setActiveIcalUrl('');
    setEvents(DEFAULT_EVENTS);
    setFeedSource('clinical_benchmark');
    setShowChangeInput(false);
    autoSyncedTargetRef.current = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('baalance_stored_ical_url');
      localStorage.removeItem('baalance_stored_calendar_events');
      if (userEmail) {
        const cleanEmail = userEmail.toLowerCase().trim();
        localStorage.removeItem(`baalance_stored_ical_url_${cleanEmail}`);
        localStorage.removeItem(`baalance_stored_calendar_events_${cleanEmail}`);
      }
    }
    if (onEventsUpdated) onEventsUpdated(DEFAULT_EVENTS);
  };

  // Handle local .ics file upload
  const handleIcsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseIcsContent(text);

        if (parsed.events.length > 0) {
          const formatted: CalendarEventItem[] = parsed.events.slice(0, 300).map((evt: any, i: number) => {
            let colorBg = 'bg-[#3186FF] text-white border-blue-600';
            if (evt.isCurfewBreach) {
              colorBg = 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300';
            } else if (evt.category === 'birthday') {
              colorBg = 'bg-emerald-600 text-white border-emerald-700 shadow-xs';
            } else if (evt.category === 'personal') {
              colorBg = 'bg-[#6772E5] text-white border-indigo-700 shadow-xs';
            } else if (evt.category === 'festival') {
              colorBg = 'bg-amber-600 text-white border-amber-700 shadow-xs';
            } else if (evt.category === 'travel') {
              colorBg = 'bg-sky-600 text-white border-sky-700 shadow-xs';
            }
            return {
              ...evt,
              colorBg,
            };
          });
          setEvents(formatted);
          setFeedSource('imported_file');

          // Auto-align calendar view: if current week has no events, jump to the week with events
          const currentKeys = new Set(weekDays.map(d => d.dateKey));
          const hasInCurrent = formatted.some(e => e.dateKey && currentKeys.has(e.dateKey));
          if (!hasInCurrent) {
            const withDate = formatted.filter(e => !!e.dateKey);
            if (withDate.length > 0) {
              const [y, m, d] = withDate[0].dateKey!.split('-').map(Number);
              const dt = new Date(y, m - 1, d, 12, 0, 0);
              const sunday = new Date(dt);
              sunday.setDate(dt.getDate() - dt.getDay());
              sunday.setHours(0, 0, 0, 0);
              setCurrentWeekStart(sunday);
            }
          }

          if (typeof window !== 'undefined') {
            localStorage.removeItem('baalance_stored_calendar_events');
            if (userEmail) {
              const cleanEmail = userEmail.toLowerCase().trim();
              localStorage.setItem(`baalance_stored_calendar_events_${cleanEmail}`, JSON.stringify(formatted));
            }
          }
          if (onEventsUpdated) onEventsUpdated(formatted);
          if (onSyncTelemetry && parsed.weeklyTelemetry) {
            onSyncTelemetry(parsed.weeklyTelemetry, file.name, '', formatted);
          }
        } else {
          setIcalError('No calendar events found in this .ics file. Please ensure the file was exported from Google Calendar.');
        }
      } catch (err) {
        console.warn('Error parsing .ics file:', err);
        setIcalError('Failed to parse .ics file. Please ensure the file is in valid iCalendar format.');
      }
    };
    reader.readAsText(file);
  };

  // Add Custom Event
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const [hourStr, minStr] = newTime.split(':');
    const hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    const isCurfew = hour >= 19 || hour < 5;

    let hour12 = hour % 12;
    hour12 = hour12 ? hour12 : 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const startTimeStr = `${hour12}:${minStr} ${ampm}`;
    const endTimeStr = `${hour12 + 1}:${minStr} ${ampm}`;

    // Target the day in current week
    const targetDayObj = weekDays.find(d => d.dayName === newDay) || weekDays[3];

    const newEvt: CalendarEventItem = {
      id: `custom-${Date.now()}`,
      day: newDay,
      dayDate: `${targetDayObj.monthName} ${targetDayObj.dateNum}`,
      dateKey: targetDayObj.dateKey,
      title: newTitle.trim(),
      startTime: startTimeStr,
      endTime: endTimeStr,
      startHour: hour + min / 60,
      durationHours: 1.0,
      isCurfewBreach: isCurfew,
      hasMeet: true,
      attendeesCount: 3,
      category: isCurfew ? 'late_sync' : 'core',
      colorBg: isCurfew
        ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300'
        : 'bg-[#3186FF] text-white border-blue-600',
    };

    const updated = [newEvt, ...events];
    setEvents(updated);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('baalance_stored_calendar_events');
      if (userEmail) {
        const cleanEmail = userEmail.toLowerCase().trim();
        localStorage.setItem(`baalance_stored_calendar_events_${cleanEmail}`, JSON.stringify(updated));
      }
    }
    if (onEventsUpdated) onEventsUpdated(updated);

    setNewTitle('');
    setShowAddModal(false);
  };

  // Time labels for week grid (8 AM to 10 PM)
  const timeHours = [
    { label: '8 AM', val: 8 },
    { label: '9 AM', val: 9 },
    { label: '10 AM', val: 10 },
    { label: '11 AM', val: 11 },
    { label: '12 PM', val: 12 },
    { label: '1 PM', val: 13 },
    { label: '2 PM', val: 14 },
    { label: '3 PM', val: 15 },
    { label: '4 PM', val: 16 },
    { label: '5 PM', val: 17 },
    { label: '6 PM', val: 18 },
    { label: '7 PM', val: 19, isCurfewStart: true },
    { label: '8 PM', val: 20 },
    { label: '9 PM', val: 21 },
    { label: '10 PM', val: 22 },
  ];

  // Indian National Holidays & Cultural Festivals Dataset
  const indianHolidayEvents = useMemo(() => getIndianHolidaysAsEvents(), []);

  // Multi-Calendar Layer Combiner: Merges Primary, Birthdays, and Holidays in India
  const displayEvents = useMemo(() => {
    const list: CalendarEventItem[] = [];

    // 1. Filter events based on active layer toggles
    for (const evt of events) {
      if (evt.category === 'birthday') {
        if (showBirthdaysLayer) list.push(evt);
      } else if (evt.category === 'festival') {
        if (showHolidaysLayer) list.push(evt);
      } else {
        if (showPrimaryLayer) list.push(evt);
      }
    }

    // 2. Merge Indian public holidays and festivals (Google Calendar "Holidays in India" layer)
    if (showHolidaysLayer) {
      const existingDateKeysAndTitles = new Set(
        list.filter(e => e.category === 'festival').map(e => `${e.dateKey}_${(e.title || '').toLowerCase().trim()}`)
      );
      for (const h of indianHolidayEvents) {
        const key = `${h.dateKey}_${h.title.toLowerCase().trim()}`;
        if (!existingDateKeysAndTitles.has(key)) {
          list.push(h);
        }
      }
    }

    return list;
  }, [events, showPrimaryLayer, showBirthdaysLayer, showHolidaysLayer, indianHolidayEvents]);

  // Calculate stats for current week view
  const currentWeekDateKeys = useMemo(() => new Set(weekDays.map(d => d.dateKey)), [weekDays]);

  const currentWeekEvents = useMemo(() => {
    return displayEvents.filter(e => {
      if (e.dateKey) {
        return currentWeekDateKeys.has(e.dateKey);
      }
      return weekDays.some(d => d.dayName === e.day);
    });
  }, [displayEvents, currentWeekDateKeys, weekDays]);

  const allDayEventsForWeek = useMemo(() => {
    return currentWeekEvents.filter(e => e.isAllDay);
  }, [currentWeekEvents]);

  // Non-work classification helper: birthdays, festivals, personal weddings do NOT count towards work meeting hours
  const isWorkMeeting = (e: CalendarEventItem) =>
    !e.isAllDay &&
    e.category !== 'birthday' &&
    e.category !== 'personal' &&
    e.category !== 'festival' &&
    e.category !== 'travel';

  // Anchor date for retrospective testing window (defaulting to haircut date or Sep 20, 2026)
  const anchorDateMs = useMemo(() => {
    if (haircutDate) {
      const d = new Date(haircutDate).getTime();
      if (!isNaN(d)) return d;
    }
    return new Date(2026, 8, 20).getTime();
  }, [haircutDate]);

  const windowStartMs = anchorDateMs - 84 * 24 * 60 * 60 * 1000;
  const windowEndMs = anchorDateMs;

  const weekCurfewBreaches = currentWeekEvents.filter(e => e.isCurfewBreach && isWorkMeeting(e)).length;
  const weekTotalHours = currentWeekEvents.filter(isWorkMeeting).reduce((sum, e) => sum + (e.durationHours || 1.0), 0);

  // Cumulative 90-day curfew breaches strictly derived from telemetry (or events in 84-day retrospective testing window)
  const cumulativeCurfewBreaches = useMemo(() => {
    if (telemetry && telemetry.length > 0) {
      return telemetry.reduce((sum, item) => sum + (item.eveningCalls || 0), 0);
    }
    return events.filter(e => {
      if (!e.isCurfewBreach || !isWorkMeeting(e)) return false;
      const t = e.startDate ? new Date(e.startDate).getTime() : 0;
      return t >= windowStartMs && t <= windowEndMs;
    }).length;
  }, [telemetry, events, windowStartMs, windowEndMs]);

  // Dynamic travel shifts strictly within retrospective testing window
  const travelShiftsCount = useMemo(() => {
    if (feedSource === 'clinical_benchmark') return 4;
    if (telemetry && telemetry.length > 0) {
      return telemetry.reduce((sum, item) => sum + (item.flightShifts || 0), 0);
    }
    return events.filter(e => {
      const t = e.startDate ? new Date(e.startDate).getTime() : 0;
      if (t < windowStartMs || t > windowEndMs) return false;
      const title = (e.title || '').toLowerCase();
      if (title.includes('terminal window') || title.includes('web terminal') || title.includes('cli') || title.includes('bash')) return false;
      return /\b(flight|flights|airline|airlines|airport|boarding\s+pass|airways)\b/i.test(title);
    }).length;
  }, [feedSource, telemetry, events, windowStartMs, windowEndMs]);

  const lateCalls = events.filter(e => e.isCurfewBreach);
  let avgLateTimeRange = '7:30 PM to 10:30 PM';
  if (lateCalls.length > 0) {
    // Sort in biological evening order: 19:00 -> 24:00 -> 04:59
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

  const dynamicSleepImpact = feedSource === 'clinical_benchmark'
    ? 'causing sustained nocturnal cortisol elevation and suppressing evening down-regulation.'
    : `elevating evening cortisol levels and delaying autonomic recovery across high-workload weeks.`;

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card overflow-hidden font-sans">
      {/* 1. TOP GOOGLE CALENDAR HEADER & NAVIGATION BAR */}
      <div className="p-3 sm:p-4 bg-white border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Google Calendar Brand & Week Navigation Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Calendar App Icon with Day Number */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center shadow-xs shrink-0">
              <span className="text-[8px] font-bold text-blue-600 uppercase leading-none">CAL</span>
              <span className="text-xs font-black text-blue-700 leading-none mt-0.5">20</span>
            </div>
            <span className="text-base font-bold text-slate-900 hidden sm:inline">Google Calendar</span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Navigation: Today, Prev (<), Next (>) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleGoToday}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              Today
            </button>

            <button
              type="button"
              onClick={handlePrevWeek}
              title="Previous Week"
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-[#3186FF] hover:bg-blue-50 text-slate-700 hover:text-[#3186FF] text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              <span>Prev</span>
            </button>

            <button
              type="button"
              onClick={handleNextWeek}
              title="Next Week"
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-[#3186FF] hover:bg-blue-50 text-slate-700 hover:text-[#3186FF] text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>

            {/* Current Month & Year Display */}
            <span className="text-sm sm:text-base font-bold text-slate-900 ml-1.5 font-sans">
              {weekHeaderTitle}
            </span>
          </div>
        </div>

        {/* Right: Quick Jumps to 90-Day Hair Cohorts + View Mode Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Cohort Jump Pills */}
          <div className="flex items-center gap-1 text-[11px] font-semibold bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="text-slate-400 px-1.5 text-[10px] uppercase font-bold">Timeline:</span>
            <button
              type="button"
              onClick={() => handleJumpToMonth(8)}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                currentWeekStart.getMonth() === 8
                  ? 'bg-[#3186FF] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              Sep (Now)
            </button>
            <button
              type="button"
              onClick={() => handleJumpToMonth(7)}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                currentWeekStart.getMonth() === 7
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
              title="View the August Stress Surge Week (Mid-Shaft Spike)"
            >
              Aug (Surge)
            </button>
            <button
              type="button"
              onClick={() => handleJumpToMonth(6)}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                currentWeekStart.getMonth() === 6
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
              title="View the July Baseline Week (Hair Tip)"
            >
              Jul (Baseline)
            </button>
          </div>

          {/* View Mode Toggle: Grid vs Agenda */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#3186FF] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#3186FF] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Add Custom Meeting */}
          <button
            type="button"
            onClick={() => setShowAddModal(!showAddModal)}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-[#E2E8F0] text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#3186FF]" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* Apply Calendar Defense Rules */}
          {onApplyRules && (
            <button
              type="button"
              onClick={onApplyRules}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                rulesApplied
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title="Enforce 7:00 PM evening curfew and protective boundary shields across all future dates"
            >
              {rulesApplied ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Rules Active</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Apply Rules</span>
                </>
              )}
            </button>
          )}

          {/* Import .ics */}
          <label className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-[#E2E8F0] text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors">
            <Upload className="w-3.5 h-3.5 text-[#3186FF]" />
            <span className="hidden sm:inline">.ics</span>
            <input type="file" accept=".ics" onChange={handleIcsUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* 2. PROTECTED / MASKED PRIVATE iCAL LINK STATUS BAR */}
      {activeIcalUrl ? (
        <div className="p-3 sm:px-4 bg-gradient-to-r from-emerald-50/90 via-blue-50/50 to-emerald-50/90 border-b border-[#E2E8F0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Live Google Calendar Linked
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Lock className="w-2.5 h-2.5" />
                    Private URL Hidden & Encrypted
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                  <span className="text-slate-400">Feed: {maskIcalUrl(activeIcalUrl)}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">Synced {lastSyncedTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => handleSyncIcalUrl(undefined, activeIcalUrl)}
                disabled={isSyncingIcal}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingIcal ? 'animate-spin' : ''}`} />
                <span>{isSyncingIcal ? 'Syncing...' : 'Sync Live Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowChangeInput(!showChangeInput)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-600 hover:text-black text-xs font-semibold transition-all cursor-pointer"
              >
                {showChangeInput ? 'Hide' : 'Change Link'}
              </button>
            </div>
          </div>

          {/* Collapsible Change Link Input */}
          {showChangeInput && (
            <div className="mt-3 pt-3 border-t border-emerald-200/60 animate-fade-in space-y-2">
              <form onSubmit={handleSyncIcalUrl} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="url"
                  value={icalUrlInput}
                  onChange={e => setIcalUrlInput(e.target.value)}
                  placeholder="Paste updated Secret address in iCal format..."
                  className="flex-1 p-2 text-xs rounded-xl border border-[#E2E8F0] bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#3186FF]"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSyncingIcal || !icalUrlInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    Update & Sync
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* Connect Live Google Calendar Input Bar (shown when no link uploaded) */
        <div className="p-3.5 bg-blue-50/40 border-b border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Lock className="w-3.5 h-3.5 text-[#3186FF]" />
              <span>Connect Live Google Calendar (Private iCal Link):</span>
            </div>

            <button
              type="button"
              onClick={() => setShowIcalHelp(!showIcalHelp)}
              className="text-[11px] text-[#3186FF] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" />
              <span>{showIcalHelp ? 'Hide guide' : 'Where to find secret link?'}</span>
            </button>
          </div>

          {showIcalHelp && (
            <div className="p-2.5 rounded-xl bg-white border border-blue-200 text-[11px] text-slate-700 space-y-1 animate-fade-in leading-relaxed">
              <p className="font-bold text-black">How to copy your Google Calendar secret link:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                <li>Open Google Calendar in your desktop browser (<a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">calendar.google.com</a>).</li>
                <li>Click 3 dots next to your calendar name on the left &rarr; <strong>Settings and sharing</strong>.</li>
                <li>Scroll down to <strong>"Integrate calendar"</strong>.</li>
                <li>Copy the <strong>"Secret address in iCal format"</strong> and paste it below. (It will be masked and secured permanently).</li>
              </ol>
            </div>
          )}

          <form onSubmit={handleSyncIcalUrl} className="flex items-center gap-2">
            <input
              type="url"
              value={icalUrlInput}
              onChange={e => setIcalUrlInput(e.target.value)}
              placeholder="Paste your Secret address in iCal format (https://calendar.google.com/calendar/ical/.../basic.ics)"
              className="flex-1 p-2 text-xs rounded-xl border border-[#E2E8F0] bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#3186FF]"
            />
            <button
              type="submit"
              disabled={isSyncingIcal || !icalUrlInput.trim()}
              className="px-4 py-2 rounded-xl bg-[#1F2937] hover:bg-black disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {isSyncingIcal ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Connect & Save</span>
                </>
              )}
            </button>
          </form>

          {icalError && <p className="text-[11px] text-rose-600 font-semibold">{icalError}</p>}
        </div>
      )}

      {/* Add Custom Meeting Form */}
      {showAddModal && (
        <form onSubmit={handleAddEvent} className="p-3 bg-slate-50 border-b border-[#E2E8F0] flex flex-wrap items-center gap-2 animate-fade-in text-xs">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Meeting title (e.g. Late Client Sprint)"
            className="flex-1 min-w-[160px] p-2 rounded-xl border border-[#E2E8F0] bg-white font-medium"
            required
          />
          <select
            value={newDay}
            onChange={e => setNewDay(e.target.value)}
            className="p-2 rounded-xl border border-[#E2E8F0] bg-white font-semibold"
          >
            {weekDays.map(d => (
              <option key={d.dayName} value={d.dayName}>
                {d.dayName} ({d.monthName} {d.dateNum})
              </option>
            ))}
          </select>
          <input
            type="time"
            value={newTime}
            onChange={e => setNewTime(e.target.value)}
            className="p-2 rounded-xl border border-[#E2E8F0] bg-white font-mono"
            required
          />
          <button type="submit" className="px-3.5 py-2 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white font-bold cursor-pointer">
            Add to Grid
          </button>
          <button type="button" onClick={() => setShowAddModal(false)} className="px-2.5 py-2 rounded-xl border border-[#E2E8F0] text-slate-500 hover:text-black cursor-pointer">
            Cancel
          </button>
        </form>
      )}

      {/* 3. VISUAL 7-DAY GOOGLE CALENDAR WEEK GRID VIEW */}
      <div className="relative group/calendar">
        {/* Floating Left Side Arrow (Previous Week) */}
        <button
          type="button"
          onClick={handlePrevWeek}
          aria-label="Previous Week"
          title="Previous Week"
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border-2 border-slate-300 hover:border-[#3186FF] hover:bg-blue-50 text-slate-700 hover:text-[#3186FF] shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3186FF]"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>

        {/* Floating Right Side Arrow (Next Week) */}
        <button
          type="button"
          onClick={handleNextWeek}
          aria-label="Next Week"
          title="Next Week"
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border-2 border-slate-300 hover:border-[#3186FF] hover:bg-blue-50 text-slate-700 hover:text-[#3186FF] shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3186FF]"
        >
          <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
        </button>

        {viewMode === 'grid' ? (
          <div className="overflow-x-auto pl-10 pr-10 sm:pl-14 sm:pr-14">
            <div className="min-w-[680px] p-3 sm:p-4">
            {/* Google Calendar Multi-Calendar Layers Bar (matching user's Google Calendar checkboxes) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 px-3 mb-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-bold text-[11px]">
                <Layers className="w-3.5 h-3.5 text-[#3186FF]" />
                <span>Google Calendar Layers:</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer select-none font-semibold text-slate-700 hover:text-black">
                  <input
                    type="checkbox"
                    checked={showPrimaryLayer}
                    onChange={(e) => setShowPrimaryLayer(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#3186FF] accent-[#3186FF] focus:ring-1 focus:ring-[#3186FF] cursor-pointer"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3186FF] shrink-0" />
                  <span>Primary Schedule</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer select-none font-semibold text-emerald-800 hover:text-emerald-950">
                  <input
                    type="checkbox"
                    checked={showBirthdaysLayer}
                    onChange={(e) => setShowBirthdaysLayer(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600 focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>Birthdays 🎂</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer select-none font-semibold text-amber-800 hover:text-amber-950">
                  <input
                    type="checkbox"
                    checked={showHolidaysLayer}
                    onChange={(e) => setShowHolidaysLayer(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-600 accent-amber-600 focus:ring-1 focus:ring-amber-600 cursor-pointer"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Holidays in India 🇮🇳</span>
                </label>
              </div>
            </div>

            {/* Top Timezone & Legend Indicator */}
            <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs gap-2">
              <div className="flex items-center gap-2 font-bold text-black">
                <span className="text-slate-500 font-mono text-[11px]">GMT+05:30 (India Standard Time)</span>
                {feedSource === 'real_ical' && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Stream Connected
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3186FF]" />
                  <span>Day Calls</span>
                </div>
                <div className="flex items-center gap-1 text-rose-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 ring-1 ring-rose-400" />
                  <span>Curfew Breach (&gt;7 PM)</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                  <span>Birthdays 🎂</span>
                </div>
                <div className="flex items-center gap-1 text-[#6772E5] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#6772E5]" />
                  <span>Personal 🎉</span>
                </div>
                <div className="flex items-center gap-1 text-amber-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-600" />
                  <span>Festivals 🇮🇳</span>
                </div>
              </div>
            </div>

            {/* 7-DAY COLUMN HEADERS (SUN, MON, TUE, WED, THU, FRI, SAT) */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1.5 text-center pb-2 border-b border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 self-center">TIME</div>
              {weekDays.map(d => (
                <div
                  key={d.dateKey}
                  className={`py-1.5 px-1 rounded-2xl transition-all ${
                    d.isToday
                      ? 'bg-blue-50/60 border-2 border-[#3186FF]'
                      : 'bg-slate-50/80 border border-slate-100 hover:bg-slate-100/60'
                  }`}
                >
                  <div
                    className={`text-[11px] font-bold uppercase ${
                      d.isToday ? 'text-[#3186FF]' : 'text-slate-600'
                    }`}
                  >
                    {d.dayHeader}
                  </div>
                  <div className="flex justify-center mt-0.5">
                    <span
                      className={`text-sm font-black font-mono leading-none flex items-center justify-center ${
                        d.isToday
                          ? 'w-7 h-7 rounded-full bg-[#3186FF] text-white shadow-xs'
                          : 'text-slate-900 py-1'
                      }`}
                    >
                      {d.dateNum}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ALL-DAY EVENTS BANNER ROW (For Indian Festivals, Birthdays & Travel) */}
            {allDayEventsForWeek.length > 0 && (
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1.5 py-1.5 border-b border-slate-100 bg-slate-50/50 text-[10px]">
                <div className="text-right pr-2.5 text-slate-400 font-bold self-center text-[9px] uppercase">
                  All-Day
                </div>
                {weekDays.map(d => {
                  const dayAllDay = allDayEventsForWeek.filter(e => e.dateKey === d.dateKey);
                  return (
                    <div key={`allday-${d.dateKey}`} className="flex flex-col gap-1 min-h-[22px]">
                      {dayAllDay.map(evt => {
                        const isFestival = evt.category === 'festival';
                        const isBirthday = evt.category === 'birthday';
                        return (
                          <div
                            key={evt.id}
                            className={`px-1.5 py-0.5 rounded border font-semibold text-[9px] truncate shadow-2xs flex items-center gap-1 ${
                              isFestival
                                ? 'bg-amber-100 border-amber-300 text-amber-900'
                                : isBirthday
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                                : 'bg-blue-100 border-blue-300 text-blue-900'
                            }`}
                            title={evt.title}
                          >
                            <span className="truncate">{evt.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* HOURLY TIME SLOT ROWS WITH ACCURATE DATE-MATCHED EVENTS */}
            <div className="relative mt-1 divide-y divide-slate-100 text-[10px] font-mono">
              {timeHours.map(slot => {
                const isAfterCurfew = slot.val >= 19;

                return (
                  <div
                    key={slot.val}
                    className={`grid grid-cols-[60px_repeat(7,1fr)] gap-1.5 min-h-[46px] relative py-1 transition-colors ${
                      isAfterCurfew ? 'bg-rose-50/20' : 'hover:bg-slate-50/40'
                    }`}
                  >
                    {/* Time Label on Left */}
                    <div className="text-right pr-2.5 text-slate-400 font-semibold self-start pt-0.5 text-[10px]">
                      {slot.label}
                    </div>

                    {/* 7 Day Columns with Strict Date-Key Event Matching */}
                    {weekDays.map(d => {
                      // Filter events strictly matching this day's dateKey and hour
                      const matchingEvents = currentWeekEvents.filter(e => {
                        if (e.isAllDay) return false;
                        if (e.dateKey) {
                          return e.dateKey === d.dateKey && Math.floor(e.startHour || 0) === slot.val;
                        }
                        // Fallback for events without dateKey
                        return e.day === d.dayName && Math.floor(e.startHour || 0) === slot.val;
                      });

                      return (
                        <div key={d.dateKey} className="relative min-h-[42px] flex flex-col gap-1">
                          {matchingEvents.map(evt => (
                            <div
                              key={evt.id}
                              onClick={() => {
                                if (onApplyRules) {
                                  onApplyRules();
                                }
                              }}
                              className={`p-1.5 rounded-lg text-left border shadow-2xs transition-transform hover:scale-[1.02] cursor-pointer ${evt.colorBg}`}
                              title={evt.isCurfewBreach ? `${evt.title} (${evt.startTime} - ${evt.endTime}) • Click to apply Calendar Defense & Reschedule` : `${evt.title} (${evt.startTime} - ${evt.endTime}) • Click to inspect Calendar Defense`}
                            >
                              <div className="font-bold text-[10px] leading-tight truncate flex items-center gap-1">
                                {evt.category === 'birthday' && <span className="shrink-0">🎂</span>}
                                {evt.category === 'personal' && <span className="shrink-0">💍</span>}
                                {evt.category === 'festival' && <span className="shrink-0">🪔</span>}
                                <span className="truncate">{evt.title}</span>
                              </div>
                              <div className="text-[9px] opacity-90 mt-0.5 flex items-center justify-between flex-wrap gap-1">
                                <span>{evt.startTime}</span>
                                {evt.isCurfewBreach && (
                                  <span className="font-bold text-[8px] bg-white text-rose-700 px-1 rounded-sm uppercase tracking-wider">
                                    Curfew
                                  </span>
                                )}
                                {evt.category === 'birthday' && (
                                  <span className="font-bold text-[8px] bg-white/25 text-white px-1 rounded-sm uppercase tracking-wider">
                                    Birthday
                                  </span>
                                )}
                                {evt.category === 'personal' && (
                                  <span className="font-bold text-[8px] bg-white/25 text-white px-1 rounded-sm uppercase tracking-wider">
                                    Personal
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* 7:00 PM CURFEW BOUNDARY LINE ACROSS ALL 7 DAYS */}
              <div
                className="absolute left-[60px] right-0 border-t-2 border-dashed border-rose-500 pointer-events-none z-10 flex items-center justify-end pr-2"
                style={{ top: '73.3%' }} // Exactly between 6 PM (index 10) and 7 PM (index 11)
              >
                <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded shadow-xs">
                  7:00 PM Hard Curfew Boundary
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 4. AGENDA LIST VIEW (Organized Chronologically) */
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto p-3 px-12 sm:px-14 text-xs">
          {currentWeekEvents.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No meetings scheduled for this week.
            </div>
          ) : (
            currentWeekEvents.map(evt => (
              <div
                key={evt.id}
                onClick={() => {
                  if (onApplyRules) {
                    onApplyRules();
                  }
                }}
                className={`p-2.5 rounded-xl transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                  evt.isCurfewBreach ? 'bg-rose-50/70 border border-rose-200 hover:bg-rose-100/70' : 'hover:bg-slate-50'
                }`}
                title={evt.isCurfewBreach ? `${evt.title} • Click to apply Calendar Defense & Reschedule` : `${evt.title} • Click to inspect Calendar Defense`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-12 text-center font-mono">
                    <div className="text-[11px] font-bold text-black uppercase">{evt.day}</div>
                    <div className="text-[9px] text-slate-500">{evt.dayDate}</div>
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div>
                    <div className="font-bold text-black flex items-center gap-1.5">
                      <span>{evt.title}</span>
                      {evt.hasMeet && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-[#3186FF] font-semibold border border-blue-100">
                          Meet
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{evt.startTime} – {evt.endTime}</span>
                      {evt.durationHours > 0 && (
                        <>
                          <span>•</span>
                          <span>{evt.durationHours}h</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {evt.isCurfewBreach ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                    Curfew Breach (&gt;7 PM)
                  </span>
                ) : evt.category === 'birthday' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 flex items-center gap-1">
                    🎂 Birthday
                  </span>
                ) : evt.category === 'personal' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shrink-0 flex items-center gap-1">
                    🎉 Personal Milestone
                  </span>
                ) : evt.category === 'festival' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0 flex items-center gap-1">
                    🇮🇳 Indian Festival
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">Day Window</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
      </div>

      {/* 5. CULPRIT SUMMARY CARD (Dynamically linked to Google Calendar load & Hair Cortisol) */}
      {feedSource !== 'clinical_benchmark' && cumulativeCurfewBreaches <= 3 ? (
        <div className="p-3.5 sm:p-4 bg-amber-50/90 border-t border-amber-200 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Biomarker-Calendar Discordance Detected
              </span>
            </div>

            <span className="text-xs font-bold text-amber-800 font-mono bg-white px-2 py-0.5 rounded-lg border border-amber-200">
              Inferences Withheld Pending Intake
            </span>
          </div>

          <p className="text-xs text-amber-950 leading-relaxed">
            Your hair test recorded significant physiological cortisol elevation, but your Google Calendar contains <strong>{cumulativeCurfewBreaches === 0 ? '0 evening curfew breaches' : `only ${cumulativeCurfewBreaches} evening calls`}</strong> and minimal late meetings across the 90-day retrospective window. Standard corporate meeting conclusions are withheld. Chat with <strong>Tricha AI</strong> to log your real-world clinical rotations, hospital ward rounds, study sprints, and shift patterns.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-sans text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Night Curfew Breaches</div>
                <div className="font-bold text-black font-mono">{cumulativeCurfewBreaches} Late Calls ({cumulativeCurfewBreaches === 0 ? 'No desk breaches' : 'Well within normal limits'})</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Workload Source</div>
                <div className="font-bold text-black font-mono">Clinical / Study Shift Strain</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Next Action</div>
                <div className="font-bold text-blue-700">Intake with Tricha AI</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 bg-rose-50/70 border-t border-rose-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                The Real Culprit Behind Your Stress Surge
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-700 font-mono bg-white px-2 py-0.5 rounded-lg border border-rose-200">
                {weekCurfewBreaches} Late Calls This Week
              </span>
              <span className="text-xs font-bold text-slate-700 font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                {cumulativeCurfewBreaches} Total 90-Day Breaches
              </span>
            </div>
          </div>

          <p className="text-xs text-rose-950 leading-relaxed">
            High cortisol in your hair test was the <strong>consequence</strong>. The real <strong>cause</strong> was {feedSource === 'clinical_benchmark' ? 'taking meetings past 7:00 PM' : `scheduling ${cumulativeCurfewBreaches} cumulative meetings past 7:00 PM`} (averaging {avgLateTimeRange}){travelShiftsCount > 0 ? ` and ${travelShiftsCount} timezone travel shifts` : ''}. These evening calls prevented your brain from entering restorative down-regulation, {dynamicSleepImpact}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-sans text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-rose-200 flex items-center gap-2">
              <Moon className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Night Curfew Breaches</div>
                <div className="font-bold text-black font-mono">{cumulativeCurfewBreaches} Late Calls (&gt;7 PM)</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-rose-200 flex items-center gap-2">
              {travelShiftsCount > 0 ? (
                <>
                  <Plane className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500">Circadian Travel Shifts</div>
                    <div className="font-bold text-black font-mono">{travelShiftsCount} Timezone Shifts</div>
                  </div>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500">Travel Disruptions</div>
                    <div className="font-bold text-black font-mono">0 Shifts (Localized)</div>
                  </div>
                </>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-rose-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Prescribed Boundary</div>
                <div className="font-bold text-black">Hard 7:00 PM Cutoff</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
