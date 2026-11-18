'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { BottomNavigationBar, DashboardTab } from '@/components/BottomNavigationBar';
import { AuthAndOnboardingModal } from '@/components/AuthAndOnboardingModal';
import { AuthLandingPage } from '@/components/AuthLandingPage';
import { FunctionalOnboardingWizard } from '@/components/FunctionalOnboardingWizard';
import { BaalanceLogo } from '@/components/BaalanceLogo';
import { HairJourneyCard } from '@/components/HairJourneyCard';
import { InteractiveHairStrandViewer } from '@/components/InteractiveHairStrandViewer';
import { ChronoCorrelationChart } from '@/components/ChronoCorrelationChart';
import { GeminiProtocolCards } from '@/components/GeminiProtocolCards';
import { GeminiChatDrawer } from '@/components/GeminiChatDrawer';
import { TrichaChatWidget } from '@/components/TrichaChatWidget';
import { CalendarSnippetWidget, DEFAULT_EVENTS, CalendarEventItem } from '@/components/CalendarSnippetWidget';
import { getUpcomingISTDays } from '@/lib/istTime';
import { WearablesInsightWidget } from '@/components/WearablesInsightWidget';
import { GoogleCalendarPluginModal } from '@/components/GoogleCalendarPluginModal';
import { CalendarDefenseModal } from '@/components/CalendarDefenseModal';
import { ImportLabReportModal } from '@/components/ImportLabReportModal';
import { PhoneSimulatorFrame } from '@/components/PhoneSimulatorFrame';
import { PitchModeView } from '@/components/PitchModeView';
import { EnterpriseDashboard } from '@/components/enterprise/EnterpriseDashboard';
import { EnterpriseAuthModal } from '@/components/enterprise/EnterpriseAuthModal';
import {
  INITIAL_USER_PROFILE,
  INITIAL_CHAIN_OF_CUSTODY,
  CLINICAL_SURGE_SEGMENTS,
  WEEKLY_12_WEEK_TELEMETRY,
  CLINICAL_FALLBACK_SYNTHESIS,
} from '@/lib/mockData';
import {
  UserProfile,
  ChainOfCustody,
  HairCortisolSegment,
  WeeklyTelemetry,
  GeminiSynthesisResult,
} from '@/lib/types';
import { computeDynamicSynthesis } from '@/lib/gemini';
import { saveUserDataToStorage, loadCachedUserData, loadUserDataForEmail } from '@/lib/storageService';
import { getSupabaseClient, signOutUser, getProviderCalendarToken } from '@/lib/supabase';
import { Pss10Card } from '@/components/Pss10Card';
import { StressSummary } from '@/components/StressSummary';
import { StressScoreCard } from '@/components/StressScoreCard';
import { ProfileOverview, MedicalHistoryCard, AccountCard } from '@/components/ProfileSections';
import { PrivacyAndActivityPanel } from '@/components/PrivacyAndActivityPanel';
import { recordAudit } from '@/lib/auditLog';
import type { Pss10Result } from '@/lib/pss10';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Database,
  SlidersHorizontal,
  User,
  HeartPulse,
  Flame,
  Activity,
  Clock,
  Moon,
  Plane,
  ShieldCheck,
  ShieldAlert,
  Zap,
  ArrowRight,
  LogOut,
  RefreshCw,
  Droplet,
  Brain,
  Pill,
  ChevronDown,
  ChevronUp,
  Info,
  Upload,
  AlertCircle,
  X,
  Plus,
  Stethoscope,
  Briefcase,
  Check,
  Sun,
  Download,
} from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';

export default function BaalanceApp() {
  // Navigation & Flow Stage
  // 'auth' = Initial landing with demo callout & login/signup (Default: login page opens first)
  // 'wizard' = 4-step real functional user onboarding (First Login only)
  // 'dashboard' = full retrospective diagnostic platform (Shown once authenticated or demo clicked)
  // 'enterprise' = Slack-style institutional workspaces (Schools, Hospitals, Corporates)
  // Always 'auth' on the server and the first client render (avoids a hydration mismatch);
  // the real stage is resolved after mount from the URL and the Supabase session.
  const [appStage, setAppStage] = useState<'auth' | 'wizard' | 'dashboard' | 'enterprise'>('auth');
  const [isStageResolved, setIsStageResolved] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'enterprise' || params.get('enterprise') === 'true') {
      setAppStage('enterprise');
      setIsStageResolved(true);
      return;
    }
    if (params.get('demo') === 'true' || params.get('mode') === 'demo') {
      setIsStageResolved(true); // the restore effect below opens the demo
      return;
    }
    // A returning user: wait briefly for the session check instead of flashing the landing page.
    if (localStorage.getItem('baalance_active_user_email')) {
      const timer = setTimeout(() => setIsStageResolved(true), 2500);
      return () => clearTimeout(timer);
    }
    setIsStageResolved(true);
  }, []);

  // Enterprise Workspace State
  const [enterpriseOrgId, setEnterpriseOrgId] = useState<string>('apollo-health');
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);

  // Bottom Navigation Active Tab
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('stress');

  // Dedicated Pitch Storyboard View Toggle
  const [isPitchMode, setIsPitchMode] = useState(false);

  // Phone Mockup Simulator Toggle (For Pitch Video recording and mobile preview)
  const [isPhoneMode, setIsPhoneMode] = useState(false);

  // Score Derivation Collapsible Toggle
  const [showScoreDerivation, setShowScoreDerivation] = useState(false);

  // Core Data States
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [chainOfCustody, setChainOfCustody] = useState<ChainOfCustody>(INITIAL_CHAIN_OF_CUSTODY);
  const [segments, setSegments] = useState<HairCortisolSegment[]>(CLINICAL_SURGE_SEGMENTS);
  const [telemetry, setTelemetry] = useState<WeeklyTelemetry[]>(WEEKLY_12_WEEK_TELEMETRY);
  const [activeSegmentId, setActiveSegmentId] = useState<1 | 2 | 3>(2); // Start focused on Month 2 Surge
  const [synthesis, setSynthesis] = useState<GeminiSynthesisResult>(CLINICAL_FALLBACK_SYNTHESIS);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [demoMode, setDemoMode] = useState(true);

  // Debounce ref for live Gemini AI score synthesis during slider interactions
  const geminiDebounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Calendar Plugin State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [verifiedCalendarEmail, setVerifiedCalendarEmail] = useState('');
  const [savedCalendarIcalUrl, setSavedCalendarIcalUrl] = useState<string>('');
  const [savedCalendarEvents, setSavedCalendarEvents] = useState<any[]>([]);
  const [calendarRulesApplied, setCalendarRulesApplied] = useState<boolean>(false);

  // Modals & Drawers
  const [isLifestyleModalOpen, setIsLifestyleModalOpen] = useState(false);
  const [isImportReportModalOpen, setIsImportReportModalOpen] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<'auth' | 'questionnaire'>('questionnaire');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isWearableModalOpen, setIsWearableModalOpen] = useState(false);
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState(false);
  const [isAutoSyncingCalendar, setIsAutoSyncingCalendar] = useState<boolean>(false);
  const autoSyncedRootUrlRef = useRef<string | null>(null);

  // Compute current defense events for 4-week scanner modal
  const defenseEvents = React.useMemo(() => {
    // 1. If user has live synced or integrated calendar events, always prioritize their real events
    if (savedCalendarEvents && savedCalendarEvents.length > 0) {
      return savedCalendarEvents;
    }
    // 2. Check cached calendar events for this specific verified/logged-in user from localStorage
    if (typeof window !== 'undefined') {
      const cleanEmail = (verifiedCalendarEmail || userProfile?.email || '').toLowerCase().trim();
      const isDemo = !cleanEmail || userProfile?.isDemo || cleanEmail.includes('demo') || cleanEmail.includes('biotech.ai');
      if (!isDemo) {
        const storedKey = `baalance_stored_calendar_events_${cleanEmail}`;
        const raw = localStorage.getItem(storedKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch (_) {}
        }
      }
    }
    // 3. Fall back to the sample events for unintegrated demo/guest mode
    return DEFAULT_EVENTS;
  }, [savedCalendarEvents, verifiedCalendarEmail, userProfile?.email, userProfile?.isDemo]);

  // Handler: Apply Verified Google Calendar Telemetry directly to Dashboard
  // Guest demo: present the most recent sample week as the coming week, so the
  // approval window always has upcoming meetings whatever today's date is.
  const upcomingDemoEvents = React.useMemo(() => {
    const dated = defenseEvents.filter((e: CalendarEventItem) => !e.isAllDay && e.dateKey && e.day);
    if (dated.length === 0) return defenseEvents;
    const lastKey = dated.reduce((max: string, e: CalendarEventItem) => (e.dateKey! > max ? e.dateKey! : max), '');
    const weekStart = new Date(new Date(`${lastKey}T00:00:00Z`).getTime() - 6 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const upcomingDays = new Map(getUpcomingISTDays(8).slice(1).map(d => [d.day, d]));
    return dated
      .filter((e: CalendarEventItem) => e.dateKey! >= weekStart)
      .map((e: CalendarEventItem) => {
        const d = upcomingDays.get(e.day);
        return d ? { ...e, dateKey: d.dateKey, dayDate: d.dayDate, startDate: undefined } : e;
      });
  }, [defenseEvents]);

  const handleApplyCalendarTelemetry = (
    weeklyCalendar: any[],
    providerEmail?: string,
    icalUrl?: string,
    formattedEvents?: any[],
    baseProfile?: UserProfile,
    baseSegments?: HairCortisolSegment[],
    baseTelemetry?: WeeklyTelemetry[],
    isAutoSync?: boolean
  ) => {
    const sourceTelemetry = baseTelemetry || telemetry;
    const sourceSegments = baseSegments || segments;
    const sourceProfile = baseProfile || userProfile;

    const updated = sourceTelemetry.map((item, idx) => {
      const cal = weeklyCalendar[idx];
      if (cal) {
        const calls = cal.eveningCalls ?? 0;
        // Dynamically simulate circadian and deep sleep suppression from evening screen & cortisol spikes
        const deepSleep = Math.max(0.35, parseFloat((1.45 - calls * 0.12).toFixed(2)));
        const rhr = Math.min(76, Math.round(54 + calls * 1.5));
        const hrv = Math.max(20, Math.round(68 - calls * 3.2));
        const isDeficit = calls >= 3 || deepSleep < 0.8;

        return {
          ...item,
          meetingHours: cal.meetingHours ?? 0,
          eveningCalls: calls,
          flightShifts: cal.flightShifts ?? 0,
          dateRange: cal.dateRange || item.dateRange,
          monthLabel: cal.monthLabel || item.monthLabel,
          deepSleepHours: deepSleep,
          restingHeartRate: rhr,
          hrvRmssd: hrv,
          isSleepDeficit: isDeficit,
        };
      }
      return item;
    });

    if (providerEmail && !providerEmail.includes('Demo')) {
      setVerifiedCalendarEmail(providerEmail);
    }
    if (icalUrl) {
      setSavedCalendarIcalUrl(icalUrl);
      autoSyncedRootUrlRef.current = icalUrl;
    }
    if (formattedEvents && formattedEvents.length > 0) {
      setSavedCalendarEvents(formattedEvents);
    }

    setTelemetry(updated);

    const updatedProfile: UserProfile = {
      ...sourceProfile,
      calendarIcalUrl: icalUrl || sourceProfile.calendarIcalUrl,
    };
    setUserProfile(updatedProfile);

    // Instant dynamic clinical synthesis
    const syn = computeDynamicSynthesis(updatedProfile, sourceSegments, updated);
    setSynthesis(syn);

    // Background Gemini AI synthesis to calculate real-time insights from updated schedule
    try {
      const localApiKey = typeof window !== 'undefined' ? sessionStorage.getItem('baalance_gemini_api_key') : null;
      apiFetch('/api/gemini-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: updatedProfile,
          segments: sourceSegments,
          telemetry: updated,
          apiKey: localApiKey || undefined,
        }),
      })
        .then(res => res.json())
        .then(resData => {
          if (resData.success && resData.data) {
            setSynthesis(resData.data);
          }
        })
        .catch(err => console.warn('[Gemini Live Synthesis Notice]', err));
    } catch (e) {
      console.warn('[Gemini Live Synthesis Catch]', e);
    }

    // Persist updated calendar telemetry and secret iCal link so it remains saved for next login
    saveUserDataToStorage(updatedProfile, sourceSegments, updated, icalUrl, formattedEvents).catch(console.warn);

    const totalEventsCount = (formattedEvents && formattedEvents.length > 0) ? formattedEvents.length : weeklyCalendar.reduce((sum, w) => sum + (w.meetingHours > 0 ? 1 : 0), 0);
    const totalEveningBreaches = weeklyCalendar.reduce((sum, w) => sum + (w.eveningCalls || 0), 0);

    if (isAutoSync) {
      if (totalEventsCount === 0) {
        setImportSuccessMessage(`Google Calendar Auto-Synced • 0 meetings detected (Biomarker-Calendar Discordance active).`);
      } else {
        setImportSuccessMessage(`Google Calendar Auto-Synced • Live telemetry up to date (${totalEventsCount} events ingested).`);
      }
    } else {
      setImportSuccessMessage(`Google Calendar Connected • Ingested ${totalEventsCount} meetings (${totalEveningBreaches} evening curfew calls). Burnout score auto-updated!`);
    }
    setTimeout(() => setImportSuccessMessage(null), 5000);
  };

  // Handler: Enforce Google Calendar Defense Rules - Open AI Rescheduling Modal
  const handleApplyCalendarRules = () => {
    setIsDefenseModalOpen(true);
  };

  // Handler: Confirm Chosen Reschedules from Calendar Defense Modal
  const handleConfirmDefenseReschedules = (
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
  ) => {
    const cleanEmail = (verifiedCalendarEmail || userProfile?.email || '').toLowerCase().trim();

    // 1. Gather all current events
    let currentEvents: CalendarEventItem[] = [];
    if (savedCalendarEvents && savedCalendarEvents.length > 0) {
      currentEvents = [...savedCalendarEvents];
    } else if (typeof window !== 'undefined') {
      const storedKey = cleanEmail ? `baalance_stored_calendar_events_${cleanEmail}` : 'baalance_stored_calendar_events';
      const raw = localStorage.getItem(storedKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) currentEvents = parsed;
        } catch (_) {}
      }
    }
    if (currentEvents.length === 0) {
      currentEvents = [...DEFAULT_EVENTS];
    }

    // 2. Read existing persistent overrides
    let existingOverrides: Record<string, any> = {};
    if (typeof window !== 'undefined') {
      const raw = (cleanEmail ? localStorage.getItem(`baalance_rescheduled_overrides_${cleanEmail}`) : null) || localStorage.getItem('baalance_rescheduled_overrides');
      if (raw) {
        try {
          existingOverrides = JSON.parse(raw);
        } catch (_) {}
      }
    }

    // 3. Apply the user-chosen slots to currentEvents and update persistent overrides
    const updatedEvents = currentEvents.map(evt => {
      const match = rescheduledItems.find(r => 
        r.originalEvent.id === evt.id || 
        ((evt.title || '').toLowerCase().trim() === (r.originalEvent.title || '').toLowerCase().trim() && evt.dateKey === r.originalEvent.dateKey)
      );

      if (match) {
        const cleanTitle = (evt.title || 'Meeting')
          .replace(/\s*\(Curfew Protected\)/gi, '')
          .replace(/\s*\[Curfew Protected\]/gi, '')
          .trim();

        const updatedEvt: CalendarEventItem = {
          ...evt,
          dateKey: match.chosenSlot.dateKey,
          day: match.chosenSlot.day,
          dayDate: match.chosenSlot.dayDate,
          startHour: match.chosenSlot.startHour,
          startTime: match.chosenSlot.startTime,
          endTime: match.chosenSlot.endTime,
          isCurfewBreach: false,
          category: evt.category === 'personal' ? 'personal' : 'strategy',
          colorBg: evt.category === 'personal'
            ? 'bg-[#6772E5] text-white border-indigo-700 shadow-xs ring-2 ring-emerald-400/50'
            : 'bg-[#0D4F59] text-white border-blue-600 shadow-xs ring-2 ring-emerald-400/50',
          title: `${cleanTitle} (Defense Protected)`,
        };

        // Record in persistent overrides
        const overrideData = {
          title: `${cleanTitle} (Defense Protected)`,
          dateKey: match.chosenSlot.dateKey,
          day: match.chosenSlot.day,
          dayDate: match.chosenSlot.dayDate,
          startHour: match.chosenSlot.startHour,
          startTime: match.chosenSlot.startTime,
          endTime: match.chosenSlot.endTime,
          isCurfewBreach: false,
        };
        if (evt.id) existingOverrides[evt.id] = overrideData;
        const norm = cleanTitle.toLowerCase().trim();
        existingOverrides[norm] = overrideData;
        existingOverrides[`${norm}_${match.chosenSlot.dateKey}`] = overrideData;
        existingOverrides[`${norm}_2026-09-26`] = overrideData;

        return updatedEvt;
      }
      return evt;
    });

    // 4. Add protective shields across future dates:
    // (a) Evening Hard Boundary (7 PM – 10 PM)
    // (b) Deep Work Focus Shields (Tue & Thu 9 AM – 12 PM)
    // (c) Weekend Biological Recovery (Sat & Sun)
    const FUTURE_DATES: Array<{ dateKey: string; day: string; dayDate: string }> = [
      { dateKey: '2026-09-22', day: 'Tue', dayDate: 'Sep 22' },
      { dateKey: '2026-09-23', day: 'Wed', dayDate: 'Sep 23' },
      { dateKey: '2026-09-24', day: 'Thu', dayDate: 'Sep 24' },
      { dateKey: '2026-09-25', day: 'Fri', dayDate: 'Sep 25' },
      { dateKey: '2026-09-26', day: 'Sat', dayDate: 'Sep 26' },
      { dateKey: '2026-09-27', day: 'Sun', dayDate: 'Sep 27' },
    ];

    for (const fDate of FUTURE_DATES) {
      // 1. Evening Hard Boundary (7 PM – 10 PM)
      const hasBoundary = updatedEvents.some(
        e => (e.dateKey === fDate.dateKey || e.dayDate === fDate.dayDate) && (e.id.includes('boundary') || (e.title && e.title.includes('Hard Boundary')))
      );
      if (!hasBoundary) {
        updatedEvents.push({
          id: `boundary-${fDate.dateKey}`,
          day: fDate.day,
          dayDate: fDate.dayDate,
          dateKey: fDate.dateKey,
          title: 'Evening Hard Boundary (Working Hours Closed)',
          startTime: '07:00 PM',
          endTime: '10:00 PM',
          startHour: 19.0,
          durationHours: 3.0,
          isCurfewBreach: false,
          hasMeet: false,
          attendeesCount: 1,
          category: 'strategy',
          colorBg: 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-1 ring-emerald-400/50',
        });
      }

      // 2. Deep Work Focus Block (Tue & Thu 9:00 AM – 12:00 PM)
      if (fDate.day === 'Tue' || fDate.day === 'Thu') {
        const hasFocusShield = updatedEvents.some(
          e => (e.dateKey === fDate.dateKey || e.dayDate === fDate.dayDate) && (e.id.includes('focus-shield') || (e.title && e.title.includes('Deep Work Focus Block')))
        );
        if (!hasFocusShield) {
          updatedEvents.push({
            id: `focus-shield-${fDate.dateKey}`,
            day: fDate.day,
            dayDate: fDate.dayDate,
            dateKey: fDate.dateKey,
            title: 'Deep Work Focus Block (Zero Meetings Shield)',
            startTime: '09:00 AM',
            endTime: '12:00 PM',
            startHour: 9.0,
            durationHours: 3.0,
            isCurfewBreach: false,
            hasMeet: false,
            attendeesCount: 1,
            category: 'strategy',
            colorBg: 'bg-purple-700 text-white border-purple-800 shadow-xs ring-1 ring-purple-400/50',
          });
        }
      }
    }

    // 5. Commit to state and localStorage
    setSavedCalendarEvents(updatedEvents);
    setCalendarRulesApplied(true);

    if (typeof window !== 'undefined') {
      // Clean up legacy global un-scoped keys so demo sessions are never corrupted
      localStorage.removeItem('baalance_calendar_rules_applied');
      localStorage.removeItem('baalance_rescheduled_overrides');
      localStorage.removeItem('baalance_stored_calendar_events');

      // Only persist to localStorage for real authenticated accounts (never for demo)
      const isDemoAccount = !cleanEmail || userProfile.isDemo || cleanEmail.includes('demo') || cleanEmail.includes('biotech.ai');
      if (!isDemoAccount) {
        localStorage.setItem(`baalance_calendar_rules_applied_${cleanEmail}`, 'true');
        localStorage.setItem(`baalance_rescheduled_overrides_${cleanEmail}`, JSON.stringify(existingOverrides));
        localStorage.setItem(`baalance_stored_calendar_events_${cleanEmail}`, JSON.stringify(updatedEvents));
      }
    }

    // Update dynamic clinical score
    const updatedTelemetry = telemetry.map((item, idx) => {
      if (idx === telemetry.length - 1) {
        const remainingEveningCalls = Math.max(0, item.eveningCalls - rescheduledItems.length);
        return {
          ...item,
          eveningCalls: remainingEveningCalls,
          deepSleepHours: Math.min(1.4, parseFloat((item.deepSleepHours + 0.25).toFixed(2))),
        };
      }
      return item;
    });
    setTelemetry(updatedTelemetry);
    const dynamicSyn = computeDynamicSynthesis(userProfile, segments, updatedTelemetry);
    setSynthesis(dynamicSyn);

    saveUserDataToStorage(
      userProfile,
      segments,
      updatedTelemetry,
      savedCalendarIcalUrl,
      updatedEvents
    ).catch(console.warn);

    setImportSuccessMessage(
      `All 5 Calendar Defense Rules Enforced • ${rescheduledItems.length} meeting(s) rescheduled in real-time. Evening Curfew, Deep Work Focus & Weekend Shields active and invitee notification emails sent.`
    );
    setTimeout(() => setImportSuccessMessage(null), 6000);
  };

  // Helper: Background Auto-Sync with Google Calendar via Secret Link
  const autoSyncCalendarAtRoot = async (
    source: string | { provider: 'google' | 'microsoft'; accessToken: string },
    email: string,
    currentProfile?: UserProfile,
    currentSegments?: HairCortisolSegment[],
    currentTelemetry?: WeeklyTelemetry[],
    force: boolean = false
  ) => {
    const live = typeof source === 'object' ? source : null;
    const cleanUrl = typeof source === 'string' ? source.trim() : '';
    if (!live) {
      if (!cleanUrl) return;
      if (cleanUrl.includes('@') && !cleanUrl.startsWith('http')) return; // ignore plain email
      if (!force && autoSyncedRootUrlRef.current === cleanUrl) return;
      autoSyncedRootUrlRef.current = cleanUrl;
    }
    const targetEmail = (email || '').toLowerCase().trim();
    const profileToUse = currentProfile || userProfile;
    const segmentsToUse = currentSegments || segments;
    const telemetryToUse = currentTelemetry || telemetry;

    try {
      setIsAutoSyncingCalendar(true);
      const res = await apiFetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          live
            ? { provider: live.provider, accessToken: live.accessToken, email: targetEmail }
            : { icalUrl: cleanUrl, email: targetEmail, haircutDate: profileToUse.haircutDate }
        ),
      });

      const data = await res.json();
      if (data.success && data.weeklyTelemetry) {
        const colors = [
          'bg-[#0D4F59] text-white border-blue-600',
          'bg-emerald-600 text-white border-emerald-700',
          'bg-purple-600 text-white border-purple-700',
          'bg-amber-600 text-white border-amber-700',
          'bg-indigo-600 text-white border-indigo-700',
        ];

        const formattedEvents = (data.events || []).map((evt: any, i: number) => {
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

        handleApplyCalendarTelemetry(
          data.weeklyTelemetry,
          data.email || targetEmail,
          live ? undefined : cleanUrl,
          formattedEvents,
          profileToUse,
          segmentsToUse,
          telemetryToUse,
          true // isAutoSync
        );
      }
    } catch (err) {
      console.warn('[BAALANCE Calendar Root Auto-Sync Error]', err);
    } finally {
      setIsAutoSyncingCalendar(false);
    }
  };

  // Restore stored user profile from Supabase/local cache or open demo directly if query param present
  useEffect(() => {
    // 1. Check URL parameters for explicit demo mode
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === 'true' || params.get('mode') === 'demo') {
        handleStartDemo();
        return;
      }
      if (params.get('pitch') === 'true') {
        setIsPitchMode(true);
      }

      if (window.location.hash.includes('error=') || window.location.search.includes('error=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // 2. Supabase Session Check (if configured)
    const supabase = getSupabaseClient();
    let authSubscription: { unsubscribe: () => void } | null = null;

    if (supabase) {
      const handleAuthUser = async (user: any) => {
        if (!user?.email) return;
        const userEmail = user.email;
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0];
        await handleAuthenticate({
          name: userName,
          email: userEmail,
          isNewUser: false,
        });

        // Returning from "Connect Outlook / Google": finish the live calendar sync.
        let pending: string | null = null;
        try {
          pending = sessionStorage.getItem('baalance_pending_calendar_sync');
        } catch (_) {}
        if (pending) {
          const access = await getProviderCalendarToken();
          if (access) {
            try {
              sessionStorage.removeItem('baalance_pending_calendar_sync');
            } catch (_) {}
            autoSyncCalendarAtRoot(
              { provider: access.provider === 'azure' ? 'microsoft' : 'google', accessToken: access.token },
              userEmail
            );
          }
        }
      };

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          restoreCachedUser(session.user.email);
          handleAuthUser(session.user);
        } else if (typeof window !== 'undefined') {
          // No verified session: never show a previously cached account.
          localStorage.removeItem('baalance_active_user_email');
        }
        setIsStageResolved(true);
      }).catch(() => setIsStageResolved(true));

      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (
          (event === 'SIGNED_IN' || event === 'USER_UPDATED') &&
          session?.user?.email
        ) {
          handleAuthUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          handleSignOut();
        }
      });
      authSubscription = data.subscription;
    }

    // 3. Restore the cached dashboard, but only for a verified Supabase session of the same user.
    const restoreCachedUser = (sessionEmail: string) => {
    const cached = loadCachedUserData();
    const activeEmail = typeof window !== 'undefined' ? localStorage.getItem('baalance_active_user_email') : null;

    if (
      activeEmail &&
      cached.profile &&
      cached.profile.email &&
      !cached.profile.isDemo &&
      cached.profile.email.toLowerCase() === sessionEmail.toLowerCase()
    ) {
      setUserProfile(cached.profile);
      if (cached.calendarIcalUrl || cached.profile.calendarIcalUrl) {
        setSavedCalendarIcalUrl(cached.calendarIcalUrl || cached.profile.calendarIcalUrl || '');
      }
      if (cached.calendarEvents && cached.calendarEvents.length > 0) {
        setSavedCalendarEvents(cached.calendarEvents);
      }
      if (cached.segments) {
        // Enforce canonical alignment: id 1 = July (Tip), id 2 = August (Mid), id 3 = September (Root)
        const sanitizedSegments = cached.segments.map(s => {
          if (s.id === 1) return { ...s, title: 'July', anatomicalRegion: 'Hair Tip (2.0–3.0 cm)', timeWindow: '60–90 Days Ago (July)' };
          if (s.id === 2) return { ...s, title: 'August', anatomicalRegion: 'Mid-Shaft (1.0–2.0 cm)', timeWindow: '30–60 Days Ago (August)' };
          if (s.id === 3) return { ...s, title: 'September', anatomicalRegion: 'Scalp Root (0.0–1.0 cm)', timeWindow: 'Last 30 Days (September)' };
          return s;
        });
        setSegments(sanitizedSegments);
      }
      if (cached.telemetry) {
        // Enforce canonical week-to-month mapping: Weeks 1-4 = July (1), Weeks 5-8 = August (2), Weeks 9-12 = September (3)
        const sanitizedTelemetry = cached.telemetry.map(t => {
          const m = (t.weekNumber <= 4 ? 1 : t.weekNumber <= 8 ? 2 : 3) as 1 | 2 | 3;
          const cleanTrigger = t.triggerDetails
            ? t.triggerDetails
                .replace(/\s*\+\s*\d+%\s*deep\s*sleep\s*drop/gi, '')
                .replace(/;\s*Deep\s*sleep\s*crashed\s*to\s*\d+\s*min\.?/gi, '.')
                .replace(/,\s*stable\s*restorative\s*sleep/gi, ', balanced schedule')
                .replace(/;\s*minor\s*sleep\s*friction/gi, '; minor schedule friction')
                .replace(/;\s*initial\s*sleep\s*drop/gi, ' breaking recovery boundaries')
                .replace(/\s*deep\s*sleep\s*/gi, ' recovery ')
                .replace(/\s*sleep\s*/gi, ' recovery ')
            : t.triggerDetails;
          return {
            ...t,
            month: m,
            monthLabel: m === 1 ? 'July' : m === 2 ? 'August' : 'September',
            triggerDetails: cleanTrigger,
          };
        });
        setTelemetry(sanitizedTelemetry);
      }

      setDemoMode(false);
      setAppStage('dashboard');
    }

    if (typeof window !== 'undefined') {
      // Clean up legacy global calendar keys to prevent any cross-account leakage
      localStorage.removeItem('baalance_stored_ical_url');
      localStorage.removeItem('baalance_stored_calendar_events');
      localStorage.removeItem('baalance_calendar_rules_applied');
      localStorage.removeItem('baalance_rescheduled_overrides');

      const cleanEmail = (activeEmail || '').toLowerCase().trim();
      const isDemo = !cleanEmail || (cached.profile && cached.profile.isDemo) || cleanEmail.includes('demo') || cleanEmail.includes('biotech.ai');

      const storedIcal = (!isDemo && cleanEmail)
        ? (localStorage.getItem(`baalance_stored_ical_url_${cleanEmail}`) || cached.calendarIcalUrl || cached.profile?.calendarIcalUrl || '')
        : '';

      if (storedIcal) {
        setSavedCalendarIcalUrl(storedIcal);
        setVerifiedCalendarEmail(cleanEmail);
        // Automatically fetch live telemetry in the background on initial load
        autoSyncCalendarAtRoot(
          storedIcal,
          cleanEmail,
          cached.profile || undefined,
          cached.segments || undefined,
          cached.telemetry || undefined
        );
      } else {
        setSavedCalendarIcalUrl('');
        if (cleanEmail && !isDemo) setVerifiedCalendarEmail(cleanEmail);
      }

      const storedEventsRaw = (!isDemo && cleanEmail)
        ? localStorage.getItem(`baalance_stored_calendar_events_${cleanEmail}`)
        : null;
      if (storedEventsRaw) {
        try {
          const parsed = JSON.parse(storedEventsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedCalendarEvents(parsed);
          }
        } catch (_) {}
      } else {
        setSavedCalendarEvents([]);
      }

      // Strictly restore rules applied ONLY for real authenticated non-demo accounts
      if (!isDemo && cleanEmail) {
        const rulesStored = localStorage.getItem(`baalance_calendar_rules_applied_${cleanEmail}`);
        setCalendarRulesApplied(rulesStored === 'true');
      } else {
        setCalendarRulesApplied(false);
      }
    }
    };

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Handler: Start Demo Experience directly from Landing Page or Wizard
  const handleStartDemo = () => {
    try {
      setUserProfile({
        ...INITIAL_USER_PROFILE,
        isDemo: true,
      });
      setSegments(CLINICAL_SURGE_SEGMENTS);
      setTelemetry(WEEKLY_12_WEEK_TELEMETRY);
      setActiveSegmentId(2);
      setDemoMode(true);

      // CRITICAL: Demo must ALWAYS start fresh with rules UN-ENFORCED so every visitor can experience Calendar Defense!
      setCalendarRulesApplied(false);
      setSavedCalendarEvents([]);
      setSavedCalendarIcalUrl('');
      setVerifiedCalendarEmail('');
      autoSyncedRootUrlRef.current = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('baalance_calendar_rules_applied');
        localStorage.removeItem('baalance_rescheduled_overrides');
        localStorage.removeItem('baalance_stored_calendar_events');
        localStorage.removeItem('baalance_calendar_rules_applied_demo');
        localStorage.removeItem('baalance_stored_calendar_events_demo');
        localStorage.removeItem('baalance_rescheduled_overrides_demo');
        localStorage.removeItem('baalance_calendar_rules_applied_alex.morgan@biotech.ai');
        localStorage.removeItem('baalance_stored_calendar_events_alex.morgan@biotech.ai');
        localStorage.removeItem('baalance_rescheduled_overrides_alex.morgan@biotech.ai');
      }

      const dynamicResult = computeDynamicSynthesis(INITIAL_USER_PROFILE, CLINICAL_SURGE_SEGMENTS, WEEKLY_12_WEEK_TELEMETRY);
      setSynthesis(dynamicResult);
    } catch (e) {
      console.error('[BAALANCE] Demo startup warning, applying fallback synthesis:', e);
      setSynthesis(CLINICAL_FALLBACK_SYNTHESIS);
    } finally {
      setAppStage('dashboard');
      setDashboardTab('stress');
    }
  };

  // Handler: Authenticate user (First Login -> Wizard; Existing User -> Directly to Dashboard)
  const handleAuthenticate = async (userData: { name: string; email: string; isNewUser?: boolean }) => {
    const cleanEmail = userData.email.toLowerCase().trim();

    // Check user-scoped local storage bundle
    const userBundle = loadUserDataForEmail(cleanEmail);
    const hasLocalOnboarded = typeof window !== 'undefined' && !!localStorage.getItem(`baalance_user_has_onboarded_${cleanEmail}`);

    // Always query server store if local user bundle is missing, ensuring single source of truth across devices
    let serverBundle: any = null;
    try {
      const res = await apiFetch(`/api/storage/user-profile?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.profile) {
          serverBundle = data;
        }
      }
    } catch (_) {}

    // Strict account uniqueness: An email can only have ONE unique account.
    // If ANY record exists (locally or on server), always load the existing account.
    const accountExists = Boolean(hasLocalOnboarded || userBundle || serverBundle);
    const isReturningUser = accountExists;

    if (isReturningUser) {
      // Returning user: restore their exact profile, hair cortisol segments, and synced calendar telemetry
      const targetProfile: UserProfile = userBundle?.profile || serverBundle?.profile || {
        ...userProfile,
        name: serverBundle?.profile?.name || userBundle?.profile?.name || userData.name,
        email: cleanEmail,
        isDemo: false,
      };
      const targetSegments: HairCortisolSegment[] = userBundle?.segments || serverBundle?.segments || segments;
      const targetTelemetry: WeeklyTelemetry[] = userBundle?.telemetry || serverBundle?.telemetry || telemetry;

      setUserProfile(targetProfile);
      setSegments(targetSegments);
      setTelemetry(targetTelemetry);
      setVerifiedCalendarEmail(cleanEmail);
      setDemoMode(false);

      const targetIcal = userBundle?.calendarIcalUrl || targetProfile.calendarIcalUrl ||
        (typeof window !== 'undefined' && cleanEmail ? (localStorage.getItem(`baalance_stored_ical_url_${cleanEmail}`) || '') : '');
      const targetEvents = userBundle?.calendarEvents ||
        (typeof window !== 'undefined' && cleanEmail ? (JSON.parse(localStorage.getItem(`baalance_stored_calendar_events_${cleanEmail}`) || '[]')) : []);
      
      setSavedCalendarIcalUrl(targetIcal || '');
      setSavedCalendarEvents(targetEvents && targetEvents.length > 0 ? targetEvents : []);

      const dynamicResult = computeDynamicSynthesis(targetProfile, targetSegments, targetTelemetry);
      setSynthesis(dynamicResult);

      const rulesStored = (typeof window !== 'undefined' && cleanEmail)
        ? localStorage.getItem(`baalance_calendar_rules_applied_${cleanEmail}`)
        : null;
      setCalendarRulesApplied(rulesStored === 'true');

      // Save as active session
      saveUserDataToStorage(targetProfile, targetSegments, targetTelemetry).catch(console.warn);
      setAppStage('dashboard');
      setDashboardTab('stress');

      // CRITICAL: Auto-sync live Google Calendar in background on login without user needing to press sync
      if (targetIcal) {
        autoSyncCalendarAtRoot(targetIcal, cleanEmail, targetProfile, targetSegments, targetTelemetry, true);
      }
    } else {
      // First-time user signup: launch wizard with clean, unpolluted baseline profile
      const initialNewProfile: UserProfile = {
        email: cleanEmail,
        name: userData.name?.trim() || cleanEmail.split('@')[0],
        role: 'Tech Founder & AI Lead',
        sector: 'Software & AI',
        isCustomRole: false,
        age: 30,
        biologicalSex: 'male',
        isPregnant: false,
        healthConditions: ['none'],
        medications: ['none'],
        weeklyHours: 50,
        chronotype: 'morning_lark',
        nightlySleepHours: 7.0,
        sleepQuality: 'moderate',
        workBoundaryBleed: 'occasional_bleed',
        travelFrequency: 'occasional',
        caffeineHabit: 'delayed_morning',
        somaticSymptoms: [],
        stressDrivers: ['heavy_deadlines'],
        perceivedStressRating: 5,
        isDemo: false,
      };
      setUserProfile(initialNewProfile);
      setSegments(CLINICAL_SURGE_SEGMENTS);
      setTelemetry(WEEKLY_12_WEEK_TELEMETRY);
      setSavedCalendarIcalUrl('');
      setSavedCalendarEvents([]);
      setVerifiedCalendarEmail(cleanEmail);
      setDemoMode(false);
      setCalendarRulesApplied(false);
      setAppStage('wizard');
    }
  };

  // Handler: Complete functional onboarding wizard
  const handleWizardComplete = (data: {
    profile: UserProfile;
    segments: HairCortisolSegment[];
    telemetry: WeeklyTelemetry[];
    calendarIcalUrl?: string;
    calendarEvents?: any[];
  }) => {
    const sanitizedTelemetry = data.telemetry.map(t => {
      const m = (t.weekNumber <= 4 ? 1 : t.weekNumber <= 8 ? 2 : 3) as 1 | 2 | 3;
      return {
        ...t,
        month: m,
        monthLabel: m === 1 ? 'July' : m === 2 ? 'August' : 'September',
      };
    });
    setUserProfile(data.profile);
    setSegments(data.segments);
    setTelemetry(sanitizedTelemetry);
    setActiveSegmentId(2);
    setDemoMode(false);

    if (data.calendarIcalUrl) {
      setSavedCalendarIcalUrl(data.calendarIcalUrl);
      setVerifiedCalendarEmail(data.profile.email);
      autoSyncCalendarAtRoot(data.calendarIcalUrl, data.profile.email, data.profile, data.segments, sanitizedTelemetry, true);
    }
    if (data.calendarEvents && data.calendarEvents.length > 0) {
      setSavedCalendarEvents(data.calendarEvents);
    }

    // Mark as onboarded and persist per-user bundle
    saveUserDataToStorage(
      data.profile,
      data.segments,
      sanitizedTelemetry,
      data.calendarIcalUrl,
      data.calendarEvents
    ).catch(console.warn);

    const syn = computeDynamicSynthesis(data.profile, data.segments, sanitizedTelemetry);
    setSynthesis(syn);
    setAppStage('dashboard');
    setDashboardTab('stress');
  };

  // Update hair cortisol segment value with live graph & Burnout Score calculation + debounced Gemini AI
  const handleUpdateSegment = (id: 1 | 2 | 3, value: number) => {
    const updatedSegments = segments.map((seg) => {
      if (seg.id === id) {
        let status: HairCortisolSegment['status'] = 'baseline';
        let label = 'Normal Baseline';
        if (value > 20) {
          status = 'acute_surge';
          label = 'Acute Stress Spike';
        } else if (value > 14) {
          status = 'incomplete_recovery';
          label = 'Delayed Recovery';
        }
        return {
          ...seg,
          cortisolPgPerMg: value,
          status,
          clinicalStatusLabel: label,
        };
      }
      return seg;
    });

    setSegments(updatedSegments);

    // Scale weekly telemetry cortisol values relative to baseline to prevent compounding distortion
    const updatedTelemetry = telemetry.map((w) => {
      const weekMonth = (w.weekNumber <= 4 ? 1 : w.weekNumber <= 8 ? 2 : 3) as 1 | 2 | 3;
      if (weekMonth === id) {
        const baseWeek = WEEKLY_12_WEEK_TELEMETRY.find(bw => bw.weekNumber === w.weekNumber);
        const baseCortisol = baseWeek ? baseWeek.cortisolPgPerMg : (id === 1 ? 11.2 : id === 2 ? 28.4 : 15.6);
        const baseMonthRef = id === 1 ? 11.2 : id === 2 ? 28.4 : 15.6;
        const ratio = value / baseMonthRef;
        return {
          ...w,
          month: weekMonth,
          monthLabel: weekMonth === 1 ? 'July' : weekMonth === 2 ? 'August' : 'September',
          cortisolPgPerMg: parseFloat((baseCortisol * ratio).toFixed(1)),
        };
      }
      return w;
    });
    setTelemetry(updatedTelemetry);

    // 1. Instant 60fps local dynamic synthesis so the score updates in real time with zero UI lag
    const dynamicResult = computeDynamicSynthesis(userProfile, updatedSegments, updatedTelemetry);
    setSynthesis(dynamicResult);

    // 2. Debounced background Gemini AI API call to calculate official score, culprit, and recommendations
    if (geminiDebounceRef.current) {
      clearTimeout(geminiDebounceRef.current);
    }
    geminiDebounceRef.current = setTimeout(async () => {
      setIsSynthesizing(true);
      // Persist updated hair segments & telemetry once dragging settles
      saveUserDataToStorage(userProfile, updatedSegments, updatedTelemetry).catch(console.warn);
      try {
        const localApiKey = typeof window !== 'undefined' ? sessionStorage.getItem('baalance_gemini_api_key') : null;
        const res = await apiFetch('/api/gemini-synthesis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: userProfile,
            segments: updatedSegments,
            telemetry: updatedTelemetry,
            apiKey: localApiKey || undefined,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.data) {
            setSynthesis(resData.data);
          }
        }
      } catch (aiErr) {
        console.warn('[BAALANCE Gemini] Live score calculation error:', aiErr);
      } finally {
        setIsSynthesizing(false);
      }
    }, 600);
  };

  // Load Clinical Surge Scenario
  const handleLoadSurgeScenario = () => {
    setSegments(CLINICAL_SURGE_SEGMENTS);
    setTelemetry(WEEKLY_12_WEEK_TELEMETRY);
    setActiveSegmentId(2);
    const dynamicResult = computeDynamicSynthesis(userProfile, CLINICAL_SURGE_SEGMENTS, WEEKLY_12_WEEK_TELEMETRY);
    setSynthesis(dynamicResult);
  };

  // Handler: Import Lab Report & Automatically Refresh Burnout Score
  const handleImportLabReport = (data: {
    segments: HairCortisolSegment[];
    reportName: string;
    labPartner: string;
    testDate: string;
  }) => {
    setSegments(data.segments);

    // Scale weekly telemetry cortisol values based on newly imported segments using base week values
    const updatedTelemetry = telemetry.map((w) => {
      const weekMonth = (w.weekNumber <= 4 ? 1 : w.weekNumber <= 8 ? 2 : 3) as 1 | 2 | 3;
      const seg = data.segments.find(s => s.id === weekMonth);
      if (seg) {
        const baseWeek = WEEKLY_12_WEEK_TELEMETRY.find(bw => bw.weekNumber === w.weekNumber);
        const baseCortisol = baseWeek ? baseWeek.cortisolPgPerMg : (weekMonth === 1 ? 11.2 : weekMonth === 2 ? 28.4 : 15.6);
        const baseM = weekMonth === 1 ? 11.2 : weekMonth === 2 ? 28.4 : 15.6;
        const ratio = seg.cortisolPgPerMg / baseM;
        return {
          ...w,
          month: weekMonth,
          monthLabel: weekMonth === 1 ? 'July' : weekMonth === 2 ? 'August' : 'September',
          cortisolPgPerMg: parseFloat((baseCortisol * ratio).toFixed(1)),
        };
      }
      return w;
    });
    setTelemetry(updatedTelemetry);

    // Auto-refresh dynamic synthesis (Burnout Score) immediately
    const dynamicResult = computeDynamicSynthesis(userProfile, data.segments, updatedTelemetry);
    setSynthesis(dynamicResult);

    setChainOfCustody(prev => ({
      ...prev,
      collectionSalon: data.labPartner,
      snipDate: data.testDate,
    }));

    // Persist to user storage so it stays stored
    saveUserDataToStorage(userProfile, data.segments, updatedTelemetry).catch(console.warn);

    // Show instant auto-refresh toast
    setImportSuccessMessage(`Lab report "${data.reportName}" imported successfully. Burnout score auto-refreshed!`);
    setTimeout(() => setImportSuccessMessage(null), 5000);
  };

  // Trigger Gemini AI Synthesis via Server Action / API Route
  const handleTriggerSynthesis = async () => {
    setIsSynthesizing(true);
    try {
      const localApiKey = typeof window !== 'undefined' ? sessionStorage.getItem('baalance_gemini_api_key') : null;
      const res = await apiFetch('/api/gemini-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: userProfile,
          segments,
          telemetry,
          apiKey: localApiKey || undefined,
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        setSynthesis(resData.data);
      } else {
        setSynthesis(computeDynamicSynthesis(userProfile, segments, telemetry));
      }
    } catch (err) {
      console.warn('Synthesis API error, using dynamic clinical model:', err);
      setSynthesis(computeDynamicSynthesis(userProfile, segments, telemetry));
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Sign out handler
  const handlePss10Complete = (result: Pss10Result) => {
    const history = userProfile.pss10
      ? [...(userProfile.pss10History || []), userProfile.pss10].slice(-12)
      : userProfile.pss10History || [];
    const updated: UserProfile = { ...userProfile, pss10: result, pss10History: history };
    setUserProfile(updated);
    saveUserDataToStorage(updated, segments, telemetry).catch(console.warn);
    recordAudit('pss10_completed', { detail: { score: result.score, band: result.band } });
  };

  // Signing out makes Supabase emit SIGNED_OUT, which calls this again: guard against the loop.
  const signingOutRef = useRef(false);
  const handleSignOut = () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    signOutUser()
      .catch(console.warn)
      .finally(() => {
        signingOutRef.current = false;
      });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('baalance_active_user_email');
      localStorage.removeItem('baalance_calendar_rules_applied');
      localStorage.removeItem('baalance_rescheduled_overrides');
      localStorage.removeItem('baalance_stored_calendar_events');
    }
    setUserProfile(INITIAL_USER_PROFILE);
    setSegments(CLINICAL_SURGE_SEGMENTS);
    setTelemetry(WEEKLY_12_WEEK_TELEMETRY);
    setSavedCalendarIcalUrl('');
    setSavedCalendarEvents([]);
    setVerifiedCalendarEmail('');
    setCalendarRulesApplied(false);
    autoSyncedRootUrlRef.current = null;
    setAppStage('auth');
    setDashboardTab('stress');
  };

  // DEDICATED PITCH STORYBOARD MODE
  if (isPitchMode) {
    return <PitchModeView onClose={() => setIsPitchMode(false)} />;
  }

  // STAGE 0: ENTERPRISE & INSTITUTIONAL WORKSPACE MODE
  if (!isStageResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F2EC]" aria-busy="true">
        <div className="w-8 h-8 rounded-full border-2 border-[#0D4F59] border-t-transparent animate-spin" />
        <span className="sr-only">Loading BAALANCE</span>
      </div>
    );
  }

  if (appStage === 'enterprise') {
    return (
      <PhoneSimulatorFrame
        isPhoneMode={isPhoneMode}
        onTogglePhoneMode={() => setIsPhoneMode(!isPhoneMode)}
      >
        <EnterpriseDashboard
          initialOrgId={enterpriseOrgId}
          onBackToIndividual={() => {
            setAppStage(userProfile.email && !userProfile.isDemo ? 'dashboard' : 'auth');
          }}
          onOpenJoinModal={() => setIsEnterpriseModalOpen(true)}
        />
        <EnterpriseAuthModal
          isOpen={isEnterpriseModalOpen}
          onClose={() => setIsEnterpriseModalOpen(false)}
          onJoinOrg={(orgId) => {
            setEnterpriseOrgId(orgId);
            setAppStage('enterprise');
          }}
        />
      </PhoneSimulatorFrame>
    );
  }

  // STAGE 1: AUTHENTICATION LANDING VIEW
  if (appStage === 'auth') {
    return (
      <PhoneSimulatorFrame
        isPhoneMode={isPhoneMode}
        onTogglePhoneMode={() => setIsPhoneMode(!isPhoneMode)}
      >
        <AuthLandingPage
          onStartDemo={handleStartDemo}
          onAuthenticate={handleAuthenticate}
          onOpenEnterprise={(orgId) => {
            if (orgId) setEnterpriseOrgId(orgId);
            setAppStage('enterprise');
          }}
        />
      </PhoneSimulatorFrame>
    );
  }

  // STAGE 2: 4-STEP FUNCTIONAL USER ONBOARDING (FIRST LOGIN INTAKE)
  if (appStage === 'wizard') {
    return (
      <PhoneSimulatorFrame
        isPhoneMode={isPhoneMode}
        onTogglePhoneMode={() => setIsPhoneMode(!isPhoneMode)}
      >
        <FunctionalOnboardingWizard
          initialProfile={userProfile}
          initialStep={1}
          onComplete={handleWizardComplete}
          onCancel={() => setAppStage('auth')}
          onStartDemo={handleStartDemo}
        />
      </PhoneSimulatorFrame>
    );
  }

  // Calculate high-level aggregates for calendar & wearables
  const totalMeetingHours = telemetry.reduce((sum, item) => sum + item.meetingHours, 0);
  const totalEveningCalls = telemetry.reduce((sum, item) => sum + item.eveningCalls, 0);
  const totalFlights = telemetry.reduce((sum, item) => sum + item.flightShifts, 0);

  const avgDeepSleep = telemetry.length > 0
    ? (telemetry.reduce((sum, item) => sum + item.deepSleepHours, 0) / telemetry.length).toFixed(2)
    : '0.00';
  const avgRHR = telemetry.length > 0
    ? Math.round(telemetry.reduce((sum, item) => sum + item.restingHeartRate, 0) / telemetry.length)
    : 0;
  const avgHRV = telemetry.length > 0
    ? Math.round(telemetry.reduce((sum, item) => sum + item.hrvRmssd, 0) / telemetry.length)
    : 0;

  // STAGE 3: THE FULL RETROSPECTIVE DASHBOARD WITH FIXED BOTTOM NAVIGATION
  return (
    <PhoneSimulatorFrame
      isPhoneMode={isPhoneMode}
      onTogglePhoneMode={() => setIsPhoneMode(!isPhoneMode)}
    >
      <div className="min-h-screen bg-[#F6F2EC] flex flex-col justify-between">
        {/* Decluttered Top Navigation Bar */}
        <Navbar
          userProfile={userProfile}
          activeTab={dashboardTab}
          onSelectTab={setDashboardTab}
          onOpenEnterprise={() => setAppStage('enterprise')}
          onSignOut={handleSignOut}
        />

        {demoMode && userProfile.isDemo && (
          <div className="bg-[#F3E4D7] border-b border-[#E6CDB8] font-sans">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
              <p className="text-[11px] sm:text-xs text-[#6B3A25] leading-snug">
                <strong>Sample case.</strong> These results are illustrative, not a real patient.
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="shrink-0 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0D4F59] text-white hover:bg-[#0B434B] cursor-pointer"
              >
                Create your account
              </button>
            </div>
          </div>
        )}

        {/* Main Tabbed Content Area with padding for the fixed bottom bar */}
        <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 pb-28 sm:pb-32 space-y-4 sm:space-y-5 flex-1 w-full font-sans">
          {/* TAB 1: STRESS LEVELS & HAIR CORTISOL TIMELINE */}
          {dashboardTab === 'stress' && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              {/* Import & Auto-Refresh Success Notification Banner */}
              {importSuccessMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{importSuccessMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImportSuccessMessage(null)}
                    className="text-emerald-700 hover:text-emerald-950 text-[11px] font-bold cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Live Calendar Background Auto-Sync Indicator */}
              {isAutoSyncingCalendar && !importSuccessMessage && (
                <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-pulse">
                  <RefreshCw className="w-4 h-4 text-[#0D4F59] animate-spin shrink-0" />
                  <span>Syncing your calendar in the background...</span>
                </div>
              )}

              <StressSummary
                segments={segments}
                telemetry={telemetry}
                pss10={userProfile.pss10}
                onSeeLateMeetings={() => setDashboardTab('calendar')}
                onTakeQuestionnaire={() => {
                  setDashboardTab('profile');
                  setTimeout(() => document.querySelector('[data-testid="pss10-card"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
                }}
              />

              {/* 1. HERO OF STRESS TAB: 3-MONTH HAIR STRAND TIMELINE */}
              <InteractiveHairStrandViewer
                segments={segments}
                activeSegmentId={activeSegmentId}
                onSelectSegment={(id) => setActiveSegmentId(id)}
                onUpdateSegment={handleUpdateSegment}
                onLoadSurgeScenario={handleLoadSurgeScenario}
              />

              {/* 2. UNIFIED 3-MONTH STRESS SCORE CARD (HAIR BIOMARKER + CALENDAR WORKLOAD) */}
              <StressScoreCard
                score={synthesis.allostaticLoadScore || 78}
                segments={segments}
                totalMeetingHours={totalMeetingHours}
                totalEveningCalls={totalEveningCalls}
                totalFlights={totalFlights}
                rootCause={synthesis.rootCauseCulprit}
                isSynthesizing={isSynthesizing}
                onRecalculate={handleTriggerSynthesis}
                onImportReport={() => setIsImportReportModalOpen(true)}
                showBreakdown={showScoreDerivation}
                onToggleBreakdown={() => setShowScoreDerivation(!showScoreDerivation)}
              />

              {/* 3. 12-Week Cortisol & Workload Timeline */}
              <ChronoCorrelationChart
                telemetry={telemetry}
                segments={segments}
                activeSegmentId={activeSegmentId}
                onSelectSegment={(id) => setActiveSegmentId(id)}
                isCalendarConnected={!userProfile.isDemo && (!!savedCalendarIcalUrl || (savedCalendarEvents && savedCalendarEvents.length > 0))}
                calendarEmail={verifiedCalendarEmail}
                userRole={userProfile.role}
              />

              {/* 4. Personalized 3-Step Action Plan */}
              <GeminiProtocolCards
                synthesis={synthesis}
                isSynthesizing={isSynthesizing}
                onRefreshSynthesis={handleTriggerSynthesis}
                onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
                onApplyCalendarRules={handleApplyCalendarRules}
                calendarRulesApplied={calendarRulesApplied}
                lateMeetings={totalEveningCalls}
                sleepHours={userProfile.nightlySleepHours}
              />

              {/* 5. Hair's Journey Stepper */}
              <HairJourneyCard currentStep={4} />
            </div>
          )}

          {/* TAB 2: GOOGLE CALENDAR & TELEMETRY INSIGHTS */}
          {dashboardTab === 'calendar' && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              {/* Calendar header: status, actions and the three numbers that matter */}
              <section className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-5" aria-label="Your calendar load">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">Calendar tells us why</div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">Your calendar load</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`w-2 h-2 rounded-full ${verifiedCalendarEmail ? 'bg-emerald-500' : userProfile.isDemo ? 'bg-amber-400' : 'bg-slate-300'}`}
                      />
                      <span className="truncate max-w-[16rem] sm:max-w-md">
                        {verifiedCalendarEmail
                          ? `Connected: ${verifiedCalendarEmail}`
                          : userProfile.isDemo
                          ? 'Sample calendar, last 90 days'
                          : 'Not connected yet'}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleApplyCalendarRules}
                      className="px-4 py-2.5 rounded-xl bg-[#0D4F59] hover:bg-[#0B434B] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {calendarRulesApplied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      <span>{calendarRulesApplied ? 'Review changes again' : 'Review suggested changes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCalendarModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Connect Outlook or Google</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
                      <Moon className="w-3.5 h-3.5" />
                      <span>Meetings after 7 PM</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalEveningCalls}</span>
                      <span className="text-xs font-semibold text-slate-500">in 90 days</span>
                    </div>
                    <div className="text-[11px] text-rose-700 font-semibold mt-1">The first thing to change</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Meeting hours</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-900 font-mono">{Math.round(totalMeetingHours / 12)}</span>
                      <span className="text-xs font-semibold text-slate-500">per week</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{Math.round(totalMeetingHours)} hours in 90 days</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <Plane className="w-3.5 h-3.5" />
                      <span>Flights</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalFlights}</span>
                      <span className="text-xs font-semibold text-slate-500">in 90 days</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Travel across time zones disrupts sleep</div>
                  </div>
                </div>
              </section>

              {/* Interactive Calendar Feed Agenda Widget */}
              <CalendarSnippetWidget
                key={userProfile?.email?.toLowerCase().trim() || 'guest'}
                userEmail={verifiedCalendarEmail || userProfile?.email || ''}
                savedIcalUrl={savedCalendarIcalUrl}
                haircutDate={userProfile.haircutDate}
                initialEvents={savedCalendarEvents}
                telemetry={telemetry}
                feedSourceName={savedCalendarIcalUrl || (savedCalendarEvents && savedCalendarEvents.length > 0) ? 'real_ical' : undefined}
                onSyncTelemetry={(weeklyTel, email, url, evts) => handleApplyCalendarTelemetry(weeklyTel, email, url, evts)}
                onEventsUpdated={(evts) => setSavedCalendarEvents(evts)}
                onApplyRules={handleApplyCalendarRules}
                rulesApplied={calendarRulesApplied}
              />
            </div>
          )}

          {/* TAB 3: WEARABLE DATA & RECOVERY INSIGHTS */}
          {dashboardTab === 'wearables' && (
            <WearablesInsightWidget
              telemetry={telemetry}
              segments={segments}
              userProfile={userProfile}
              onOpenConnectModal={() => setIsWearableModalOpen(true)}
            />
          )}

          {/* TAB 4: TRICHA AI CHAT (Kept mounted via CSS display toggle to preserve active conversation transcript across tab navigation, but strictly isolated per account email) */}
          <div className={dashboardTab === 'tricha' ? 'block animate-fade-in' : 'hidden'}>
            <TrichaChatWidget
              key={userProfile?.email?.toLowerCase().trim() || 'demo_guest'}
              userProfile={userProfile}
              segments={segments}
              telemetry={telemetry}
              calendarEvents={savedCalendarEvents}
              calendarIcalUrl={savedCalendarIcalUrl}
              verifiedCalendarEmail={verifiedCalendarEmail}
              stressScore={synthesis.allostaticLoadScore}
              embedded={true}
            />
          </div>

          {/* TAB 5: PROFILE & LIFESTYLE SETTINGS */}
          {dashboardTab === 'profile' && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              <ProfileOverview
                userProfile={userProfile}
                verifiedCalendarEmail={verifiedCalendarEmail}
                onEditDetails={() => {
                  setModalStep('questionnaire');
                  setIsLifestyleModalOpen(true);
                }}
                onRerunSetup={() => setAppStage('wizard')}
                onSelectPreset={(preset) => {
                  const updated: UserProfile = {
                    ...userProfile,
                    role: preset.role,
                    sector: preset.sector,
                    weeklyHours: preset.weeklyHours,
                    isCustomRole: true,
                    stressDrivers: preset.stressDrivers,
                  };
                  setUserProfile(updated);
                  setSynthesis(computeDynamicSynthesis(updated, segments, telemetry));
                  saveUserDataToStorage(updated, segments, telemetry).catch(console.warn);
                }}
              />

              {/* PSS-10 validated stress questionnaire */}
              <Pss10Card
                result={userProfile.pss10}
                history={userProfile.pss10History}
                onComplete={handlePss10Complete}
              />

              <MedicalHistoryCard userProfile={userProfile} />

              {/* Data controls and activity log */}
              <PrivacyAndActivityPanel
                userProfile={userProfile}
                segments={segments}
                telemetry={telemetry}
                onDataDeleted={handleSignOut}
              />

              <AccountCard
                userProfile={userProfile}
                onEditDetails={() => {
                  setModalStep('questionnaire');
                  setIsLifestyleModalOpen(true);
                }}
                onSignOut={handleSignOut}
              />
            </div>
          )}
        </main>

        {/* Universal Fixed Bottom Navigation Bar (Matching user's flashcard app design) */}
        <BottomNavigationBar
          activeTab={dashboardTab}
          onSelectTab={setDashboardTab}
        />

        {/* Google Calendar Plugin Modal */}
        <GoogleCalendarPluginModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          userEmail={verifiedCalendarEmail}
          onApplyTelemetry={handleApplyCalendarTelemetry}
        />

        {/* Import Hair Cortisol Lab Report Modal with Auto-Refresh */}
        <ImportLabReportModal
          isOpen={isImportReportModalOpen}
          onClose={() => setIsImportReportModalOpen(false)}
          currentSegments={segments}
          onImportReport={handleImportLabReport}
        />

        {/* Profile & Questionnaire Modal */}
        <AuthAndOnboardingModal
          key={`${modalStep}_${userProfile.email}_${isLifestyleModalOpen}`}
          isOpen={isLifestyleModalOpen}
          onClose={() => setIsLifestyleModalOpen(false)}
          userProfile={userProfile}
          initialStep={modalStep}
          onSaveProfile={(updated) => {
            setUserProfile(updated);
            const syn = computeDynamicSynthesis(updated, segments, telemetry);
            setSynthesis(syn);
            saveUserDataToStorage(updated, segments, telemetry).catch(console.warn);
            if (typeof window !== 'undefined' && updated.email) {
              localStorage.setItem(`baalance_user_has_onboarded_${updated.email}`, 'true');
            }
          }}
        />

        {/* Co-Pilot Chat Drawer (if needed) */}
        <GeminiChatDrawer
          isOpen={isChatDrawerOpen}
          onClose={() => setIsChatDrawerOpen(false)}
          userProfile={userProfile}
          segments={segments}
          telemetry={telemetry}
          calendarEvents={savedCalendarEvents}
          calendarIcalUrl={savedCalendarIcalUrl}
          verifiedCalendarEmail={verifiedCalendarEmail}
        />

        {/* Calendar Defense AI Rescheduler Modal */}
        <CalendarDefenseModal
          isOpen={isDefenseModalOpen}
          onClose={() => setIsDefenseModalOpen(false)}
          events={userProfile.isDemo ? upcomingDemoEvents : defenseEvents}
          userEmail={verifiedCalendarEmail || userProfile?.email || 'user@example.com'}
          userName={userProfile?.name || 'User'}
          onConfirmReschedules={handleConfirmDefenseReschedules}
        />

        {/* Plug In Actual Wearable Data - Coming Soon Modal */}
        {isWearableModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 text-center relative animate-scale-up">
              <button
                type="button"
                onClick={() => setIsWearableModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-inner">
                <HeartPulse className="w-7 h-7 text-purple-600 animate-pulse" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/70 border border-purple-200 px-2.5 py-1 rounded-full mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Coming Soon
                </div>
                <h3 className="text-lg font-black text-black">
                  Wearable Biometrics Integration
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Wearables capture acute minute-to-minute fluctuations in stress (HRV, heart rate spikes), while hair cortisol captures chronic cumulative stress levels over 90 days. We are integrating both so BAALANCE AI can protect your calendar.
                </p>
              </div>

              {/* Providers Preview */}
              <div className="grid grid-cols-3 gap-2 py-1">
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center font-mono">
                    W
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Whoop 4.0</span>
                  <span className="text-[9px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                    Beta Ready
                  </span>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-[11px] font-black flex items-center justify-center">
                    ⭕
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Oura Ring</span>
                  <span className="text-[9px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                    In Testing
                  </span>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center">
                    
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Apple Watch</span>
                  <span className="text-[9px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                    In Alpha
                  </span>
                </div>
              </div>

              {/* Informative Callout */}
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-left text-xs text-blue-950 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#0D4F59] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Hardware OAuth Pipeline:</span>
                  <span className="text-blue-900 block mt-0.5 text-[11px]">
                    Direct OAuth and Bluetooth BLE syncing are currently in closed testing. Google Calendar integration is fully active and live today!
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWearableModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </PhoneSimulatorFrame>
  );
}
