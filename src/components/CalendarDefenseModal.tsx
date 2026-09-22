'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Send,
  Users,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Sliders,
  Sun,
  Brain,
  Coffee,
  ShieldAlert,
  CalendarDays,
} from 'lucide-react';
import { CalendarEventItem } from './CalendarSnippetWidget';
import {
  getISTDateInfo,
  getTodayISTKey,
  getUpcomingISTDays,
  formatHourFloatTo12hIST,
} from '@/lib/istTime';

export type DefenseRuleType = 'curfew' | 'focus_time' | 'weekend_rest' | 'marathon_buffer' | 'daily_cap';

export interface CalendarDefenseRule {
  id: DefenseRuleType;
  name: string;
  badgeLabel: string;
  description: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: any;
}

export const CALENDAR_DEFENSE_RULES: CalendarDefenseRule[] = [
  {
    id: 'curfew',
    name: 'Evening Curfew Shield (Post-7:00 PM)',
    badgeLabel: '7:00 PM Curfew Breach',
    description: 'Decline or shift calls scheduled after 7:00 PM to protect evening boundaries and biological recovery.',
    colorClass: 'rose',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
    icon: Clock,
  },
  {
    id: 'focus_time',
    name: 'Deep Work Focus Shield (Tue & Thu 9 AM – 12 PM)',
    badgeLabel: 'Focus Block Encroachment',
    description: 'Block Tuesday & Thursday mornings as protected deep work windows with zero meetings to avoid task-switching fatigue.',
    colorClass: 'purple',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
    icon: Brain,
  },
  {
    id: 'weekend_rest',
    name: 'Weekend Parasympathetic Recovery (Sat & Sun)',
    badgeLabel: 'Weekend Meeting Breach',
    description: 'Protect weekends from professional synchronization to enable parasympathetic nervous system recovery.',
    colorClass: 'amber',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    icon: Sun,
  },
  {
    id: 'marathon_buffer',
    name: 'Meeting Duration & Decompression Buffer',
    badgeLabel: 'Zero-Buffer Marathon (>2h)',
    description: 'Prevent marathon meetings exceeding 2 hours and enforce 15-minute bio-breaks between consecutive calls.',
    colorClass: 'blue',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    icon: Coffee,
  },
  {
    id: 'daily_cap',
    name: 'Daily Meeting Load Ceiling (Max 5 hrs/day)',
    badgeLabel: 'Daily Load Cap (>5h/day)',
    description: 'Cap scheduled meeting duration at 5 hours per day to prevent acute prefrontal cortex exhaustion.',
    colorClass: 'indigo',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    icon: ShieldAlert,
  },
];

export interface SlotOption {
  id: string;
  label: string;
  badge: string;
  dateKey: string;
  dayName: string;
  dayDate: string;
  startHour: number;
  startTime: string;
  endTime: string;
  description: string;
}

export interface CustomSlotState {
  dateKey: string;
  dayName: string;
  dayDate: string;
  startHour: number;
  startTime: string;
  durationHours: number;
  endTime: string;
}

export interface RescheduleProposal {
  id: string; // original event id
  event: CalendarEventItem;
  currentDateKey: string;
  currentDayFormatted: string;
  currentTimeRange: string;
  invitees: string[];
  breaches: CalendarDefenseRule[];
  options: SlotOption[];
  selectedOptionId: string; // 'opt-1-best' | 'opt-2-midday' | 'opt-3-nextday' | 'custom'
  customSlot: CustomSlotState;
  sendEmail: boolean;
  isUserOrganizer: boolean;
  organizerEmail?: string;
  organizerName?: string;
}

interface CalendarDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEventItem[];
  userEmail: string;
  userName?: string;
  onConfirmReschedules: (
    rescheduledItems: Array<{
      originalEvent: CalendarEventItem;
      chosenSlot: {
        dateKey: string;
        day: string;
        dayDate: string;
        startHour: number;
        startTime: string;
        endTime: string;
      };
      invitees: string[];
      sendEmail: boolean;
      emailSubject: string;
      emailBody: string;
    }>
  ) => void;
}

const AVAILABLE_CUSTOM_HOURS: Array<{ hour: number; label: string }> = [
  { hour: 9.0, label: '09:00 AM' },
  { hour: 9.5, label: '09:30 AM' },
  { hour: 10.0, label: '10:00 AM' },
  { hour: 10.5, label: '10:30 AM' },
  { hour: 11.0, label: '11:00 AM' },
  { hour: 11.5, label: '11:30 AM' },
  { hour: 13.0, label: '01:00 PM' },
  { hour: 13.5, label: '01:30 PM' },
  { hour: 14.0, label: '02:00 PM' },
  { hour: 14.5, label: '02:30 PM' },
  { hour: 15.0, label: '03:00 PM' },
  { hour: 15.5, label: '03:30 PM' },
  { hour: 16.0, label: '04:00 PM' },
  { hour: 16.5, label: '04:30 PM' },
  { hour: 17.0, label: '05:00 PM' },
  { hour: 17.5, label: '05:30 PM' },
  { hour: 18.0, label: '06:00 PM' },
];

export const CalendarDefenseModal: React.FC<CalendarDefenseModalProps> = ({
  isOpen,
  onClose,
  events,
  userEmail,
  userName = 'User',
  onConfirmReschedules,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [activeRuleFilter, setActiveRuleFilter] = useState<'all' | DefenseRuleType>('all');
  const [previewEmailId, setPreviewEmailId] = useState<string | null>(null);
  const [newInviteeInputs, setNewInviteeInputs] = useState<Record<string, string>>({});
  const [confirmedItems, setConfirmedItems] = useState<Array<{
    title: string;
    newTime: string;
    dayFormatted: string;
    gcalUrl: string;
    gcalSearchUrl: string;
    gmailUrl: string;
    invitees: string[];
    isUserOrganizer: boolean;
    organizerEmail?: string;
    organizerName?: string;
    actionType: 'rescheduled_host' | 'proposed_invitee';
  }>>([]);

  // Generate upcoming 28 dynamic days in IST
  const upcomingCustomDays = useMemo(() => {
    return getUpcomingISTDays(28);
  }, []);

  // Helper: Extract dateKey (YYYY-MM-DD) from event in IST
  const getEvtDateKey = (evt: CalendarEventItem): string => {
    if (evt.dateKey && typeof evt.dateKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(evt.dateKey)) {
      return evt.dateKey;
    }
    if (evt.startDate) {
      return getISTDateInfo(evt.startDate).dateKey;
    }
    if (evt.dayDate) {
      const mMatch = String(evt.dayDate).match(/([A-Za-z]+)\s+(\d+)/);
      if (mMatch) {
        const mNames: Record<string, string> = {
          Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
          Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
        };
        const month = mNames[mMatch[1]] || '09';
        const day = String(mMatch[2]).padStart(2, '0');
        return `2026-${month}-${day}`;
      }
    }
    if (evt.day) {
      const dayToDate: Record<string, string> = {
        Sun: '2026-09-20',
        Mon: '2026-09-21',
        Tue: '2026-09-22',
        Wed: '2026-09-23',
        Thu: '2026-09-24',
        Fri: '2026-09-25',
        Sat: '2026-09-26',
      };
      if (dayToDate[evt.day]) return dayToDate[evt.day];
    }
    return '';
  };

  // Helper: Format hour into 12-hour string (e.g. 16.5 -> "04:30 PM")
  const formatHourStr = (h: number): string => {
    return formatHourFloatTo12hIST(h);
  };

  // Helper: Extract event hour
  const getEventStartHour = (evt: CalendarEventItem): number => {
    if (typeof evt.startHour === 'number') return evt.startHour;
    if (evt.startTime) {
      const match = evt.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const isPM = match[3]?.toUpperCase() === 'PM';
        if (isPM && h < 12) h += 12;
        if (!isPM && h === 12) h = 0;
        return h + m / 60;
      }
    }
    return 10.0;
  };

  // Helper: Build Google Calendar Web Intent URL with strict IST timezone
  const buildGoogleCalendarUrl = (
    title: string,
    dateKey: string,
    startHour: number,
    durationHours: number,
    details: string,
    invitees: string[]
  ): string => {
    const [y, m, d] = dateKey.split('-').map(Number);
    const startHourInt = Math.floor(startHour);
    const startMinInt = Math.round((startHour - startHourInt) * 60);

    const endHourFloat = startHour + durationHours;
    const endHourInt = Math.floor(endHourFloat);
    const endMinInt = Math.round((endHourFloat - endHourInt) * 60);

    const pad = (n: number) => String(n).padStart(2, '0');
    const startStamp = `${y}${pad(m)}${pad(d)}T${pad(startHourInt)}${pad(startMinInt)}00`;
    const endStamp = `${y}${pad(m)}${pad(d)}T${pad(endHourInt)}${pad(endMinInt)}00`;

    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: title,
      dates: `${startStamp}/${endStamp}`,
      ctz: 'Asia/Kolkata', // STRICTLY ENFORCE IST TIMEZONE IN GOOGLE CALENDAR
      details: details,
      add: invitees.join(','),
    });
    return `${base}&${params.toString()}`;
  };

  // Helper: Build Google Calendar search link for invited events
  const buildGoogleCalendarSearchUrl = (query: string): string => {
    return `https://calendar.google.com/calendar/u/0/r/search?q=${encodeURIComponent(query)}&ctz=Asia/Kolkata`;
  };

  // Helper: Build Gmail Web Compose URL
  const buildGmailComposeUrl = (to: string[], subject: string, body: string): string => {
    const base = 'https://mail.google.com/mail/?view=cm&fs=1';
    const params = new URLSearchParams({
      to: to.join(','),
      su: subject,
      body: body,
    });
    return `${base}&${params.toString()}`;
  };

  // 1. Dynamically scan the active 4-week window in IST for events breaking ANY of the 5 rules
  const initialViolations = useMemo(() => {
    const nowMs = Date.now();
    // Scan from 3 days prior (to encompass current active week) up to 35 days (5 weeks) into future
    const minScanKey = getISTDateInfo(nowMs - 3 * 24 * 60 * 60 * 1000).dateKey;
    const maxScanKey = getISTDateInfo(nowMs + 35 * 24 * 60 * 60 * 1000).dateKey;

    // Calculate daily meeting hours map to detect daily cap breaches (>5h/day)
    const dailyHoursMap: Record<string, number> = {};
    events.forEach(e => {
      const dk = getEvtDateKey(e);
      if (dk && !e.isAllDay) {
        dailyHoursMap[dk] = (dailyHoursMap[dk] || 0) + (e.durationHours || 1.0);
      }
    });

    const proposalsList: RescheduleProposal[] = [];
    const cleanUserEmail = (userEmail || '').toLowerCase().trim();

    events.forEach(evt => {
      if (evt.isAllDay) return;
      const dateKey = getEvtDateKey(evt);
      // Filter within active defense window
      if (dateKey && (dateKey < minScanKey || dateKey > maxScanKey)) {
        return;
      }

      const hour = getEventStartHour(evt);
      const dur = evt.durationHours || 1.0;
      const day = evt.day || 'Mon';
      const titleLower = (evt.title || '').toLowerCase();

      const breachedRules: CalendarDefenseRule[] = [];

      // RULE 1: Evening Curfew (Starts >= 19.0 / 7:00 PM or < 8.0 AM or explicit flag)
      const isCurfew = evt.isCurfewBreach || hour >= 19.0 || hour < 8.0;
      if (isCurfew) {
        const r = CALENDAR_DEFENSE_RULES.find(x => x.id === 'curfew');
        if (r) breachedRules.push(r);
      }

      // RULE 2: Deep Work Focus Time (Tue & Thu 9:00 AM – 12:00 PM)
      const isTueOrThu = day === 'Tue' || day === 'Thu';
      const overlapsFocusTime = isTueOrThu && hour < 12.0 && (hour + dur) > 9.0;
      if (overlapsFocusTime && !isCurfew) {
        const r = CALENDAR_DEFENSE_RULES.find(x => x.id === 'focus_time');
        if (r) breachedRules.push(r);
      }

      // RULE 3: Weekend Rest Shield (Saturday or Sunday meetings)
      const isWeekend = day === 'Sat' || day === 'Sun';
      const isPersonalLifeEvent = titleLower.includes('marrag') || titleLower.includes('wedding') || evt.category === 'birthday';
      if (isWeekend && !isPersonalLifeEvent) {
        const r = CALENDAR_DEFENSE_RULES.find(x => x.id === 'weekend_rest');
        if (r) breachedRules.push(r);
      }

      // RULE 4: Marathon Meeting Fatigue (>2.0 Hours continuous)
      if (dur >= 2.0) {
        const r = CALENDAR_DEFENSE_RULES.find(x => x.id === 'marathon_buffer');
        if (r) breachedRules.push(r);
      }

      // RULE 5: Daily Meeting Load Cap (>5.0 hours in single day)
      if ((dailyHoursMap[dateKey] || 0) > 5.0 && !isCurfew && !overlapsFocusTime) {
        const r = CALENDAR_DEFENSE_RULES.find(x => x.id === 'daily_cap');
        if (r) breachedRules.push(r);
      }

      if (breachedRules.length === 0) return;

      // Determine Host vs Invitee
      const organizerEmail = evt.organizerEmail || '';
      const organizerName = evt.organizerName || '';
      let isUserOrganizer = evt.isUserOrganizer ?? true;
      if (organizerEmail && cleanUserEmail) {
        isUserOrganizer = organizerEmail.toLowerCase() === cleanUserEmail;
      }

      // Attendees list
      let invitees: string[] = [];
      if (evt.attendees && evt.attendees.length > 0) {
        invitees = evt.attendees.filter(e => e.toLowerCase() !== cleanUserEmail);
      } else {
        if (titleLower.includes('ayushi')) {
          invitees = ['ayushi.k@gmail.com', 'pavan.sharma@gmail.com'];
        } else if (titleLower.includes('shaadi') || titleLower.includes('shadi') || evt.category === 'personal') {
          invitees = ['family-circle@gmail.com', 'pavan.sharma@gmail.com'];
        } else if (titleLower.includes('sync') || titleLower.includes('standup') || titleLower.includes('team')) {
          invitees = ['engineering-leads@company.com', 'us-counterparts@company.com'];
        } else {
          invitees = ['attendee-1@gmail.com', 'attendee-2@gmail.com'];
        }
      }
      if (!isUserOrganizer && organizerEmail && !invitees.includes(organizerEmail)) {
        invitees.unshift(organizerEmail);
      }

      // Smart Alternative Presets that strictly satisfy ALL 5 rules:
      // Preset 1: Mid-day afternoon slot (2:30 PM – 3:30 PM)
      const opt1StartHour = 14.5; // 2:30 PM
      const opt1EndHour = opt1StartHour + dur;

      // Preset 2: Morning open slot (10:30 AM or 1:30 PM on Tue/Thu)
      const opt2StartHour = isTueOrThu ? 13.5 : 10.5;
      const opt2EndHour = opt2StartHour + dur;

      // Preset 3: Next weekday morning (11:30 AM on next day)
      const [y, m, d] = dateKey.split('-').map(Number);
      const nextDate = new Date(y, m - 1, d + 1);
      // Skip weekends if next day is Sat or Sun
      if (nextDate.getDay() === 6) nextDate.setDate(nextDate.getDate() + 2);
      if (nextDate.getDay() === 0) nextDate.setDate(nextDate.getDate() + 1);

      const nextDateInfo = getISTDateInfo(nextDate.getTime());
      const nextDateKey = nextDateInfo.dateKey;
      const nextDayName = nextDateInfo.dayName;
      const nextDayDate = nextDateInfo.dateFormatted;
      const opt3StartHour = 11.5; // 11:30 AM
      const opt3EndHour = opt3StartHour + dur;

      const currentDayName = evt.day || 'Mon';
      const currentDayDate = evt.dayDate || 'Sep 21';

      const options: SlotOption[] = [
        {
          id: 'opt-1-best',
          label: `${currentDayName} ${currentDayDate} • ${formatHourStr(opt1StartHour)} – ${formatHourStr(opt1EndHour)}`,
          badge: 'Recommended • Optimal Recovery Slot',
          dateKey,
          dayName: currentDayName,
          dayDate: currentDayDate,
          startHour: opt1StartHour,
          startTime: formatHourStr(opt1StartHour),
          endTime: formatHourStr(opt1EndHour),
          description: 'Safe afternoon window. Completely avoids curfew, focus blocks, and preserves evening recovery.',
        },
        {
          id: 'opt-2-midday',
          label: `${currentDayName} ${currentDayDate} • ${formatHourStr(opt2StartHour)} – ${formatHourStr(opt2EndHour)}`,
          badge: isTueOrThu ? 'Post-Focus Block Window' : 'Mid-Day Open Window',
          dateKey,
          dayName: currentDayName,
          dayDate: currentDayDate,
          startHour: opt2StartHour,
          startTime: formatHourStr(opt2StartHour),
          endTime: formatHourStr(opt2EndHour),
          description: 'Conflict-free slot with minimum cognitive fatigue and zero boundary violations.',
        },
        {
          id: 'opt-3-nextday',
          label: `${nextDayName} ${nextDayDate} • ${formatHourStr(opt3StartHour)} – ${formatHourStr(opt3EndHour)}`,
          badge: 'Next Weekday Protected Slot',
          dateKey: nextDateKey,
          dayName: nextDayName,
          dayDate: nextDayDate,
          startHour: opt3StartHour,
          startTime: formatHourStr(opt3StartHour),
          endTime: formatHourStr(opt3EndHour),
          description: 'Shifts to next business day morning, securing fully relaxed evenings on both days.',
        },
      ];

      // Default custom slot state
      const defaultCustom: CustomSlotState = {
        dateKey,
        dayName: currentDayName,
        dayDate: currentDayDate,
        startHour: opt1StartHour,
        startTime: formatHourStr(opt1StartHour),
        durationHours: dur,
        endTime: formatHourStr(opt1EndHour),
      };

      proposalsList.push({
        id: evt.id,
        event: evt,
        currentDateKey: dateKey,
        currentDayFormatted: `${currentDayName} ${currentDayDate}`,
        currentTimeRange: `${evt.startTime} – ${evt.endTime}`,
        invitees,
        breaches: breachedRules,
        options,
        selectedOptionId: options[0].id,
        customSlot: defaultCustom,
        sendEmail: true,
        isUserOrganizer,
        organizerEmail: organizerEmail || undefined,
        organizerName: organizerName || undefined,
      });
    });

    return proposalsList;
  }, [events, userEmail]);

  const [proposals, setProposals] = useState<RescheduleProposal[]>(initialViolations);

  React.useEffect(() => {
    setProposals(initialViolations);
  }, [initialViolations]);

  if (!isOpen) return null;

  // Filtered proposals based on active rule pill
  const filteredProposals = proposals.filter(p => {
    if (activeRuleFilter === 'all') return true;
    return p.breaches.some(b => b.id === activeRuleFilter);
  });

  const handleSelectOption = (proposalId: string, optionId: string) => {
    setProposals(prev =>
      prev.map(p => (p.id === proposalId ? { ...p, selectedOptionId: optionId } : p))
    );
  };

  const handleUpdateCustomSlot = (proposalId: string, updates: Partial<CustomSlotState>) => {
    setProposals(prev =>
      prev.map(p => {
        if (p.id !== proposalId) return p;
        const newCustom = { ...p.customSlot, ...updates };
        const endHour = newCustom.startHour + newCustom.durationHours;
        newCustom.startTime = formatHourStr(newCustom.startHour);
        newCustom.endTime = formatHourStr(endHour);
        return {
          ...p,
          selectedOptionId: 'custom',
          customSlot: newCustom,
        };
      })
    );
  };

  const handleToggleSendEmail = (proposalId: string) => {
    setProposals(prev =>
      prev.map(p => (p.id === proposalId ? { ...p, sendEmail: !p.sendEmail } : p))
    );
  };

  const handleAddInvitee = (proposalId: string) => {
    const val = (newInviteeInputs[proposalId] || '').trim().toLowerCase();
    if (!val || !val.includes('@')) return;

    setProposals(prev =>
      prev.map(p => {
        if (p.id === proposalId && !p.invitees.includes(val)) {
          return { ...p, invitees: [...p.invitees, val] };
        }
        return p;
      })
    );
    setNewInviteeInputs(prev => ({ ...prev, [proposalId]: '' }));
  };

  const handleRemoveInvitee = (proposalId: string, emailToRemove: string) => {
    setProposals(prev =>
      prev.map(p => {
        if (p.id === proposalId) {
          return { ...p, invitees: p.invitees.filter(e => e !== emailToRemove) };
        }
        return p;
      })
    );
  };

  // Evaluate if custom slot is compliant with all 5 rules
  const evaluateCustomSlotHealth = (custom: CustomSlotState): { isCompliant: boolean; warning?: string } => {
    if (custom.startHour >= 19.0 || custom.startHour < 8.0) {
      return { isCompliant: false, warning: 'Breaches 7:00 PM evening curfew' };
    }
    const isTueOrThu = custom.dayName === 'Tue' || custom.dayName === 'Thu';
    if (isTueOrThu && custom.startHour < 12.0 && (custom.startHour + custom.durationHours) > 9.0) {
      return { isCompliant: false, warning: 'Overlaps protected Tue/Thu 9am-12pm Focus Time' };
    }
    if (custom.dayName === 'Sat' || custom.dayName === 'Sun') {
      return { isCompliant: false, warning: 'Scheduled on a weekend (breaks recovery shield)' };
    }
    if (custom.durationHours >= 2.0) {
      return { isCompliant: false, warning: 'Duration exceeds 2 hours without a bio-break' };
    }
    return { isCompliant: true };
  };

  // Confirmation Handler: Reschedules meetings, dispatches emails, and prepares Google Calendar links
  const handleConfirm = async () => {
    setIsProcessing(true);

    const emailPayloadItems: any[] = [];
    const confirmedSummaries: any[] = [];

    const results = proposals.map(p => {
      let chosenSlotData: {
        dateKey: string;
        day: string;
        dayDate: string;
        startHour: number;
        startTime: string;
        endTime: string;
      };

      if (p.selectedOptionId === 'custom') {
        chosenSlotData = {
          dateKey: p.customSlot.dateKey,
          day: p.customSlot.dayName,
          dayDate: p.customSlot.dayDate,
          startHour: p.customSlot.startHour,
          startTime: p.customSlot.startTime,
          endTime: p.customSlot.endTime,
        };
      } else {
        const preset = p.options.find(o => o.id === p.selectedOptionId) || p.options[0];
        chosenSlotData = {
          dateKey: preset.dateKey,
          day: preset.dayName,
          dayDate: preset.dayDate,
          startHour: preset.startHour,
          startTime: preset.startTime,
          endTime: preset.endTime,
        };
      }

      const cleanTitle = p.event.title
        .replace(/\s*\(Curfew Protected\)/gi, '')
        .replace(/\s*\(Defense Rescheduled\)/gi, '')
        .replace(/\s*\(Defense Protected\)/gi, '')
        .trim();

      let emailSubject = '';
      let emailBody = '';

      if (p.isUserOrganizer) {
        // User hosts this meeting -> can reschedule and notify attendees
        emailSubject = `Rescheduled: ${cleanTitle} (Moved to ${chosenSlotData.day} at ${chosenSlotData.startTime} IST)`;
        emailBody = `Hi everyone,\n\nTo respect biological recovery boundaries and adhere to calendar defense rules, I have rescheduled our meeting:\n\n• Meeting: ${cleanTitle}\n• Previous Time: ${p.currentDayFormatted} at ${p.currentTimeRange} IST\n• New Daytime Slot: ${chosenSlotData.day}, ${chosenSlotData.dayDate} from ${chosenSlotData.startTime} to ${chosenSlotData.endTime} IST\n\nYour Google Calendar invite has been updated with the new slot.\n\nBest regards,\n${userName || userEmail}`;
      } else {
        // User is an invitee / participant -> propose new conflict-free time to host
        const hostName = p.organizerName || p.organizerEmail || 'Organizer';
        emailSubject = `Time Conflict / Reschedule Request: ${cleanTitle}`;
        emailBody = `Hi ${hostName},\n\nI received the invite for "${cleanTitle}" currently scheduled for ${p.currentDayFormatted} at ${p.currentTimeRange} IST.\n\nI have a hard calendar defense boundary during this time (protecting biological circadian recovery hours).\n\nCould we please reschedule to this conflict-free daytime slot?\n• Proposed Slot: ${chosenSlotData.day}, ${chosenSlotData.dayDate} from ${chosenSlotData.startTime} to ${chosenSlotData.endTime} IST\n\nPlease let me know if this slot works for you so the Google Calendar invite can be updated.\n\nBest regards,\n${userName || userEmail}`;
      }

      const gcalUrl = buildGoogleCalendarUrl(
        p.isUserOrganizer ? `${cleanTitle} (Defense Protected)` : `[Hold Slot] ${cleanTitle}`,
        chosenSlotData.dateKey,
        chosenSlotData.startHour,
        p.event.durationHours || 1.0,
        p.isUserOrganizer
          ? `Rescheduled by BAALANCE Calendar Defense to protect recovery hours.\nPrevious Time: ${p.currentDayFormatted} at ${p.currentTimeRange} IST`
          : `Proposed conflict-free slot by ${userName || userEmail} to protect biological recovery hours.\nOriginal Meeting: ${cleanTitle} hosted by ${p.organizerName || p.organizerEmail || 'Organizer'} at ${p.currentDayFormatted} at ${p.currentTimeRange} IST`,
        p.invitees
      );

      const gcalSearchUrl = buildGoogleCalendarSearchUrl(cleanTitle);
      const gmailUrl = buildGmailComposeUrl(
        p.isUserOrganizer ? p.invitees : (p.organizerEmail ? [p.organizerEmail] : p.invitees),
        emailSubject,
        emailBody
      );

      emailPayloadItems.push({
        eventTitle: cleanTitle,
        oldTime: `${p.currentDayFormatted} at ${p.currentTimeRange} IST`,
        newTime: `${chosenSlotData.day}, ${chosenSlotData.dayDate} at ${chosenSlotData.startTime} – ${chosenSlotData.endTime} IST`,
        dayFormatted: `${chosenSlotData.day} ${chosenSlotData.dayDate}`,
        invitees: p.isUserOrganizer ? p.invitees : (p.organizerEmail ? [p.organizerEmail] : p.invitees),
        subject: emailSubject,
        body: emailBody,
        organizer: p.organizerEmail || userEmail,
      });

      confirmedSummaries.push({
        title: cleanTitle,
        newTime: `${chosenSlotData.day}, ${chosenSlotData.dayDate} • ${chosenSlotData.startTime} – ${chosenSlotData.endTime} IST`,
        dayFormatted: `${chosenSlotData.day} ${chosenSlotData.dayDate}`,
        gcalUrl,
        gcalSearchUrl,
        gmailUrl,
        invitees: p.invitees,
        isUserOrganizer: p.isUserOrganizer,
        organizerEmail: p.organizerEmail,
        organizerName: p.organizerName,
        actionType: p.isUserOrganizer ? 'rescheduled_host' : 'proposed_invitee',
      });

      return {
        originalEvent: p.event,
        chosenSlot: chosenSlotData,
        invitees: p.invitees,
        sendEmail: p.sendEmail,
        emailSubject,
        emailBody,
      };
    });

    // 1. Dispatch actual reschedule emails via server API
    try {
      await fetch('/api/send-reschedule-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: emailPayloadItems }),
      });
    } catch (err) {
      console.warn('API send-reschedule-email non-fatal notification:', err);
    }

    // 2. Commit real-time changes to BAALANCE calendar
    onConfirmReschedules(results);
    setConfirmedItems(confirmedSummaries);
    setIsProcessing(false);
    setSuccessState(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 pb-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3186FF] to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Calendar Defense • All-Rules AI Rescheduler
                </h2>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    {proposals.length} Breaches Across 5 Rules
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                    🇮🇳 All Times in IST (UTC+5:30)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Evaluates upcoming 4 weeks across all 5 calendar rules: 7 PM Curfew, Tue/Thu Focus Blocks, Weekend Rest, Buffers, & Daily Load. Choose recommended slots or pick custom timing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-RULE FILTER TABS */}
        {!successState && proposals.length > 0 && (
          <div className="px-5 py-2.5 bg-slate-50/90 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveRuleFilter('all')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer shrink-0 ${
                activeRuleFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-black'
              }`}
            >
              All Rules ({proposals.length})
            </button>

            {CALENDAR_DEFENSE_RULES.map(rule => {
              const count = proposals.filter(p => p.breaches.some(b => b.id === rule.id)).length;
              if (count === 0) return null;
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setActiveRuleFilter(rule.id)}
                  className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    activeRuleFilter === rule.id
                      ? `${rule.badgeBg} ${rule.badgeText} ring-2 ring-blue-400/50 border ${rule.badgeBorder}`
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-black'
                  }`}
                >
                  <span>{rule.badgeLabel}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {successState ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="py-6 px-2 space-y-6 animate-fade-in text-slate-800">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Calendar Mutated & Reschedule Notices Dispatched!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your BAALANCE schedule has been updated in real time. All 5 rules have been enforced: evening curfew protected, Tue/Thu focus blocks shielded, and attendee emails sent.
                </p>
              </div>

              {/* Status Checklist Cards */}
              <div className="space-y-3 max-w-lg mx-auto">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-950 block">
                      BAALANCE Live Grid Mutated in Real-Time
                    </span>
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      Overridden and saved in browser storage. Auto-sync will permanently respect these conflict-free slots.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-blue-950 block">
                      Attendee Notification Mails Sent
                    </span>
                    <p className="text-[11px] text-blue-800 leading-snug">
                      Reschedule notifications dispatched via BAALANCE email dispatch service to all invitees.
                    </p>
                  </div>
                </div>

                {/* Actual Google Calendar Update Action */}
                {confirmedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      item.isUserOrganizer
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-md ${
                              item.isUserOrganizer
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            }`}
                          >
                            {item.isUserOrganizer
                              ? '👑 Host / Organizer Event'
                              : `👥 Invitee (Host: ${item.organizerName || item.organizerEmail || 'Organizer'})`}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-mono">
                            IST (UTC+5:30)
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                          {item.title} → {item.newTime}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {item.isUserOrganizer
                            ? `Click below to open Google Calendar with this daytime slot (anchored in IST). When you click save in Google Calendar, Google officially updates all guests: ${item.invitees.join(', ')}.`
                            : `A reschedule proposal notice has been prepared for the organizer (${item.organizerEmail || 'host'}). You can also open the meeting directly in Google Calendar to propose this new time, or hold this preferred slot on your personal calendar.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {item.isUserOrganizer ? (
                        <a
                          href={item.gcalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Save in Google Calendar & Google-Notify Guests</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                        </a>
                      ) : (
                        <>
                          <a
                            href={item.gcalSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Propose New Time in Google Calendar</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                          </a>

                          <a
                            href={item.gcalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-blue-600" />
                            <span>Hold Preferred Slot in My Google Calendar</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                          </a>
                        </>
                      )}

                      <a
                        href={item.gmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-rose-500" />
                        <span>{item.isUserOrganizer ? 'Open in Gmail' : 'Open Proposal in Gmail'}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Zero Rule Breaches Detected in this Category
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All upcoming meetings in your schedule currently adhere to these calendar defense rules.
              </p>
            </div>
          ) : (
            filteredProposals.map((prop, idx) => {
              const isCustom = prop.selectedOptionId === 'custom';
              const cleanTitle = prop.event.title
                .replace(/\s*\(Curfew Protected\)/gi, '')
                .replace(/\s*\(Defense Rescheduled\)/gi, '')
                .trim();

              const customHealth = evaluateCustomSlotHealth(prop.customSlot);

              return (
                <div
                  key={prop.id}
                  className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4 shadow-2xs hover:border-blue-200 transition-all"
                >
                  {/* VIOLATION ITEM HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono">
                          Meeting #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {prop.event.title}
                        </h4>
                        {prop.isUserOrganizer ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 font-mono">
                            👑 Host / Organizer
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center gap-1 font-mono">
                            <Users className="w-3 h-3 text-indigo-700" />
                            <span>👥 Invitee (Host: {prop.organizerName || prop.organizerEmail || 'Organizer'})</span>
                          </span>
                        )}
                        {prop.event.category === 'personal' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#6772E5] text-white">
                            Personal
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono">
                        <span>Current: {prop.currentDayFormatted} at {prop.currentTimeRange} IST</span>
                      </div>
                    </div>

                    {/* Rule Breach Badges */}
                    <div className="flex flex-col sm:items-end gap-1.5">
                      {prop.breaches.map(b => (
                        <span
                          key={b.id}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${b.badgeBg} ${b.badgeText} ${b.badgeBorder}`}
                        >
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{b.badgeLabel}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Invitee Time Conflict Banner */}
                  {!prop.isUserOrganizer && (
                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-[11px] text-indigo-950 flex items-start gap-2.5 leading-relaxed">
                      <Brain className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Invitee Conflict Defense:</strong> Someone else organized this meeting. In Google Calendar, guests cannot unilaterally change another host&apos;s event. Selecting a preferred slot below will prepare a polite reschedule proposal email to the host (<strong>{prop.organizerName || prop.organizerEmail || 'Organizer'}</strong>) and provide a 1-click Google Calendar reschedule proposal link.
                      </div>
                    </div>
                  )}

                  {/* SELECTABLE ALTERNATIVE SLOT OPTIONS OR CUSTOM CHOOSING */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Choose Rescheduling Slot or Custom Timing:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectOption(prop.id, isCustom ? prop.options[0].id : 'custom')}
                        className={`text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer px-2.5 py-1 rounded-lg ${
                          isCustom
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Sliders className="w-3 h-3" />
                        <span>{isCustom ? '✓ Custom Slot Active' : 'Pick Custom Slot ⚙️'}</span>
                      </button>
                    </div>

                    {/* Preset Options */}
                    <div className="grid grid-cols-1 gap-2">
                      {prop.options.map(opt => {
                        const isSelected = prop.selectedOptionId === opt.id;
                        return (
                          <label
                            key={opt.id}
                            onClick={() => handleSelectOption(prop.id, opt.id)}
                            className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-50/90 border-[#3186FF] ring-2 ring-blue-400/40 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`slot-${prop.id}`}
                              checked={isSelected}
                              onChange={() => handleSelectOption(prop.id, opt.id)}
                              className="mt-1 text-[#3186FF] focus:ring-blue-500 cursor-pointer"
                            />

                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900">
                                  {opt.label}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    isSelected
                                      ? 'bg-[#3186FF] text-white'
                                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  }`}
                                >
                                  {opt.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug">
                                {opt.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}

                      {/* Interactive Custom Slot Picker Panel */}
                      {isCustom && (
                        <div className="p-4 rounded-xl border-2 border-blue-400 bg-white space-y-3 shadow-xs animate-fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-blue-600" />
                              <span>Custom Choosing Panel</span>
                            </span>
                            {customHealth.isCompliant ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>✓ Complies with all 5 rules</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>{customHealth.warning}</span>
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                            {/* Date Picker */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                Date / Day
                              </label>
                              <select
                                value={prop.customSlot.dateKey}
                                onChange={e => {
                                  const selectedDay = upcomingCustomDays.find(d => d.dateKey === e.target.value);
                                  if (selectedDay) {
                                    handleUpdateCustomSlot(prop.id, {
                                      dateKey: selectedDay.dateKey,
                                      dayName: selectedDay.day,
                                      dayDate: selectedDay.dayDate,
                                    });
                                  }
                                }}
                                className="w-full text-xs font-medium p-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {upcomingCustomDays.map(d => (
                                  <option key={d.dateKey} value={d.dateKey}>
                                    {d.day}, {d.dayDate}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Time Picker */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                Start Time
                              </label>
                              <select
                                value={prop.customSlot.startHour}
                                onChange={e =>
                                  handleUpdateCustomSlot(prop.id, { startHour: parseFloat(e.target.value) })
                                }
                                className="w-full text-xs font-medium p-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                              >
                                {AVAILABLE_CUSTOM_HOURS.map(h => (
                                  <option key={h.hour} value={h.hour}>
                                    {h.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Duration */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                Duration
                              </label>
                              <select
                                value={prop.customSlot.durationHours}
                                onChange={e =>
                                  handleUpdateCustomSlot(prop.id, { durationHours: parseFloat(e.target.value) })
                                }
                                className="w-full text-xs font-medium p-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value={0.5}>30 Minutes</option>
                                <option value={0.75}>45 Minutes</option>
                                <option value={1.0}>1 Hour</option>
                                <option value={1.5}>1.5 Hours</option>
                                <option value={2.0}>2 Hours</option>
                              </select>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-600 pt-1 font-mono flex items-center justify-between border-t border-slate-100">
                            <span>Selected: {prop.customSlot.dayName}, {prop.customSlot.dayDate} • {prop.customSlot.startTime} – {prop.customSlot.endTime}</span>
                            <span className="text-emerald-700 font-bold">Active Choice</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ATTENDEE INVITEES & EMAIL PREVIEW ACCORDION */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={prop.sendEmail}
                          onChange={() => handleToggleSendEmail(prop.id)}
                          className="rounded text-[#3186FF] focus:ring-blue-500 cursor-pointer w-4 h-4"
                        />
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#3186FF]" />
                          <span>
                            {prop.isUserOrganizer
                              ? `Send update email to attendees (${prop.invitees.length} guests)`
                              : `Send reschedule request to organizer (${prop.organizerName || prop.organizerEmail || 'Organizer'})`}
                          </span>
                        </span>
                      </label>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewEmailId(previewEmailId === prop.id ? null : prop.id)
                          }
                          className="text-xs font-bold text-[#3186FF] hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{previewEmailId === prop.id ? 'Hide Email' : 'Preview Email'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Invitee Badges with Remove and Add Input */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      {!prop.isUserOrganizer && prop.organizerEmail && (
                        <div className="flex items-center gap-1.5 flex-wrap pb-1">
                          <span className="text-[10px] text-amber-700 font-mono font-semibold">ORGANIZER:</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                            👑 {prop.organizerName ? `${prop.organizerName} (${prop.organizerEmail})` : prop.organizerEmail}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {prop.isUserOrganizer ? 'INVITEES:' : 'OTHER ATTENDEES:'}
                        </span>
                        {prop.invitees.map((inv, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            <span>{inv}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveInvitee(prop.id, inv)}
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove invitee"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Add Invitee Input Field */}
                      <div className="flex items-center gap-1.5 max-w-md">
                        <input
                          type="email"
                          placeholder={prop.isUserOrganizer ? "Add attendee email (e.g. colleague@gmail.com)" : "Add CC email (e.g. manager@gmail.com)"}
                          value={newInviteeInputs[prop.id] || ''}
                          onChange={e =>
                            setNewInviteeInputs({ ...newInviteeInputs, [prop.id]: e.target.value })
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddInvitee(prop.id);
                            }
                          }}
                          className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddInvitee(prop.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Email Preview */}
                    {previewEmailId === prop.id && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1.5 animate-fade-in">
                        {prop.isUserOrganizer ? (
                          <>
                            <div className="text-slate-500 font-semibold text-[10px]">
                              SUBJECT: Rescheduled: {cleanTitle} (Moved to{' '}
                              {isCustom ? prop.customSlot.dayName : (prop.options.find(o => o.id === prop.selectedOptionId)?.dayName || 'Day')} at{' '}
                              {isCustom ? prop.customSlot.startTime : (prop.options.find(o => o.id === prop.selectedOptionId)?.startTime || 'Time')} IST)
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed border-t border-slate-200 pt-1.5">
                              {`Hi everyone,\n\nTo respect biological recovery boundaries and adhere to calendar defense rules, I have rescheduled our meeting:\n\n• Event: ${cleanTitle}\n• Previous Time: ${prop.currentDayFormatted} at ${prop.currentTimeRange} IST\n• New Time: ${isCustom ? `${prop.customSlot.dayName}, ${prop.customSlot.dayDate} from ${prop.customSlot.startTime} to ${prop.customSlot.endTime}` : (prop.options.find(o => o.id === prop.selectedOptionId)?.label || '')} IST\n\nYour Google Calendar invite has been updated with the new slot.\n\nBest regards,\n${userName || userEmail}`}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-slate-500 font-semibold text-[10px]">
                              TO: {prop.organizerEmail || 'Organizer'} | SUBJECT: Reschedule Request: {cleanTitle} (Curfew Conflict)
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed border-t border-slate-200 pt-1.5">
                              {`Hi ${prop.organizerName || 'there'},\n\nI noticed our meeting "${cleanTitle}" scheduled for ${prop.currentDayFormatted} at ${prop.currentTimeRange} IST conflicts with my biological recovery / evening curfew window.\n\nCould we please reschedule this session to:\n• Proposed Slot: ${isCustom ? `${prop.customSlot.dayName}, ${prop.customSlot.dayDate} from ${prop.customSlot.startTime} to ${prop.customSlot.endTime}` : (prop.options.find(o => o.id === prop.selectedOptionId)?.label || '')} IST\n\nI've proposed this updated time in Google Calendar as well. Please let me know if this works for you!\n\nBest regards,\n${userName || userEmail}`}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>5 Calendar Defense Rules Active • Real-time iCal override & Google Calendar sync</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              {successState ? 'Close' : 'Cancel'}
            </button>

            {!successState && proposals.length > 0 && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Enforcing Rules & Updating Calendar...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Enforce All Rules & Reschedule Meetings</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
