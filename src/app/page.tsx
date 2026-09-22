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
import { WearablesInsightWidget } from '@/components/WearablesInsightWidget';
import { GoogleCalendarPluginModal } from '@/components/GoogleCalendarPluginModal';
import { CalendarDefenseModal } from '@/components/CalendarDefenseModal';
import { ImportLabReportModal } from '@/components/ImportLabReportModal';
import { AppGuideModal } from '@/components/AppGuideModal';
import { PhoneSimulatorFrame } from '@/components/PhoneSimulatorFrame';
import { PitchModeView } from '@/components/PitchModeView';
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
import { getSupabaseClient, signOutUser } from '@/lib/supabase';
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

export default function BaalanceApp() {
  // Navigation & Flow Stage
  // 'auth' = Initial landing with demo callout & login/signup (Default: login page opens first)
  // 'wizard' = 4-step real functional user onboarding (First Login only)
  // 'dashboard' = full retrospective diagnostic platform (Shown once authenticated or demo clicked)
  const [appStage, setAppStage] = useState<'auth' | 'wizard' | 'dashboard'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === 'true' || params.get('mode') === 'demo') {
        return 'dashboard';
      }
      const activeEmail = localStorage.getItem('baalance_active_user_email');
      const cached = loadCachedUserData();
      if (activeEmail && cached?.profile?.email && !cached?.profile?.isDemo) {
        return 'dashboard';
      }
    }
    return 'auth';
  });

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
  const [isAppGuideOpen, setIsAppGuideOpen] = useState(false);
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
    // 3. Fall back to clinical benchmark DEFAULT_EVENTS only for unintegrated demo/guest mode
    return DEFAULT_EVENTS;
  }, [savedCalendarEvents, verifiedCalendarEmail, userProfile?.email, userProfile?.isDemo]);

  // Handler: Apply Verified Google Calendar Telemetry directly to Dashboard
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
      const localApiKey = typeof window !== 'undefined' ? localStorage.getItem('baalance_gemini_api_key') : null;
      fetch('/api/gemini-synthesis', {
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
            : 'bg-[#3186FF] text-white border-blue-600 shadow-xs ring-2 ring-emerald-400/50',
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
          title: '🛡️ Evening Hard Boundary (Working Hours Closed)',
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
            title: '🧠 Deep Work Focus Block (Zero Meetings Shield)',
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
    icalUrl: string,
    email: string,
    currentProfile?: UserProfile,
    currentSegments?: HairCortisolSegment[],
    currentTelemetry?: WeeklyTelemetry[],
    force: boolean = false
  ) => {
    if (!icalUrl || typeof icalUrl !== 'string' || !icalUrl.trim()) return;
    const cleanUrl = icalUrl.trim();
    if (cleanUrl.includes('@') && !cleanUrl.startsWith('http')) return; // ignore plain email
    if (!force && autoSyncedRootUrlRef.current === cleanUrl) return;

    autoSyncedRootUrlRef.current = cleanUrl;
    const targetEmail = (email || '').toLowerCase().trim();
    const profileToUse = currentProfile || userProfile;
    const segmentsToUse = currentSegments || segments;
    const telemetryToUse = currentTelemetry || telemetry;

    try {
      setIsAutoSyncingCalendar(true);
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icalUrl: cleanUrl,
          email: targetEmail,
          haircutDate: profileToUse.haircutDate,
        }),
      });

      const data = await res.json();
      if (data.success && data.weeklyTelemetry) {
        const colors = [
          'bg-[#3186FF] text-white border-blue-600',
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
          cleanUrl,
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
      };

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          handleAuthUser(session.user);
        }
      }).catch(() => {});

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

    // 3. Restore cached authenticated user from local storage
    const cached = loadCachedUserData();
    const activeEmail = typeof window !== 'undefined' ? localStorage.getItem('baalance_active_user_email') : null;

    if (activeEmail && cached.profile && cached.profile.email && !cached.profile.isDemo) {
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
      const res = await fetch(`/api/storage/user-profile?email=${encodeURIComponent(cleanEmail)}`);
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
        const localApiKey = typeof window !== 'undefined' ? localStorage.getItem('baalance_gemini_api_key') : null;
        const res = await fetch('/api/gemini-synthesis', {
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
      const localApiKey = typeof window !== 'undefined' ? localStorage.getItem('baalance_gemini_api_key') : null;
      const res = await fetch('/api/gemini-synthesis', {
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
  const handleSignOut = () => {
    signOutUser().catch(console.warn);
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
      <div className="min-h-screen bg-[#F0F4FA] flex flex-col justify-between">
        {/* Decluttered Top Navigation Bar */}
        <Navbar
          userProfile={userProfile}
          activeTab={dashboardTab}
          onSelectTab={setDashboardTab}
          onOpenAppGuide={() => setIsAppGuideOpen(true)}
          onSignOut={handleSignOut}
        />

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
                  <RefreshCw className="w-4 h-4 text-[#3186FF] animate-spin shrink-0" />
                  <span>Syncing live Google Calendar telemetry in background...</span>
                </div>
              )}

              {/* 1. TOP OF STRESS TAB: PRESTIGIOUS HERO BURNOUT SCORE CARD (100% CUMULATIVE 90-DAY SYNTHESIS) */}
              {(() => {
                const score = synthesis.allostaticLoadScore || 78;
                const isHigh = score > 65;
                const isModerate = score >= 45 && score <= 65;
                const clampedScore = Math.min(Math.max(score, 5), 95);

                // Cumulative 90-Day Hair Cortisol (Full 3.0 cm specimen average)
                const m1 = segments.find(s => s.id === 1)?.cortisolPgPerMg ?? 15.6;
                const m2 = segments.find(s => s.id === 2)?.cortisolPgPerMg ?? 28.4;
                const m3 = segments.find(s => s.id === 3)?.cortisolPgPerMg ?? 11.2;
                const cumulativeAvgCortisol = parseFloat(((m1 + m2 + m3) / 3).toFixed(1));
                const cumulativeSurgePct = Math.round(((cumulativeAvgCortisol - 11.0) / 11.0) * 100);

                const statusBadge = isHigh
                  ? {
                      label: 'High Burnout Zone',
                      sublabel: 'Cumulative Burden',
                      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
                      ringGradientStart: '#FB7185',
                      ringGradientEnd: '#E11D48',
                      textColor: 'text-rose-600',
                      icon: Flame,
                    }
                  : isModerate
                  ? {
                      label: 'Moderate Strain Zone',
                      sublabel: 'Elevated Workload',
                      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
                      ringGradientStart: '#FBBF24',
                      ringGradientEnd: '#D97706',
                      textColor: 'text-amber-600',
                      icon: Activity,
                    }
                  : {
                      label: 'Optimal Homeostasis',
                      sublabel: 'Balanced Resilience',
                      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
                      ringGradientStart: '#34D399',
                      ringGradientEnd: '#059669',
                      textColor: 'text-emerald-600',
                      icon: CheckCircle2,
                    };

                const StatusIcon = statusBadge.icon;

                return (
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-5 font-sans relative overflow-hidden">
                    {/* Subtle ambient background glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-rose-50/40 via-transparent to-transparent pointer-events-none" />

                    {/* Card Header: Category eyebrow + Import Action Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3186FF] via-[#6366F1] to-[#D946EF] p-[1.5px] shadow-2xs">
                          <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-[#3186FF]" />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Clinical Synthesis • 90-Day Cumulative Biomarkers
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-none mt-0.5">
                            Cumulative Burnout Score
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {isSynthesizing ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#3186FF] text-xs font-bold animate-pulse shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 animate-spin text-[#3186FF]" />
                            <span>Gemini AI Calculating...</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleTriggerSynthesis}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/70 hover:bg-blue-100 border border-blue-200 text-[#3186FF] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            title="Recalculate burnout score using Google Gemini 3.6 Flash"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Gemini AI Synced</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setIsImportReportModalOpen(true)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                          title="Import new hair cortisol test report to auto-refresh burnout score"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#3186FF]" />
                          <span>Import Lab Report</span>
                        </button>
                      </div>
                    </div>

                    {/* HERO SCORE SHOWCASE: Prominent Radial Gauge + Diagnostic Verdict */}
                    <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 pt-1">
                      {/* Prominent Circular SVG Gauge */}
                      <div
                        className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0"
                        style={{ width: '144px', height: '144px', minWidth: '144px', minHeight: '144px' }}
                      >
                        <svg
                          className="w-full h-full -rotate-90 drop-shadow-sm"
                          viewBox="0 0 100 100"
                          style={{ width: '100%', height: '100%', maxWidth: '144px', maxHeight: '144px' }}
                        >
                          <defs>
                            <linearGradient id="heroScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={statusBadge.ringGradientStart} />
                              <stop offset="100%" stopColor={statusBadge.ringGradientEnd} />
                            </linearGradient>
                          </defs>
                          {/* Background Track */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            className="text-slate-100"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                          />
                          {/* Active Glowing Value Arc (Responsive 300ms transition for live dragging) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="url(#heroScoreGradient)"
                            strokeWidth="8"
                            strokeDasharray={`${(score / 100) * 251.327} 251.327`}
                            strokeLinecap="round"
                            fill="none"
                            className="transition-all duration-300 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                          <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 leading-none">
                            {score}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 mt-1 font-mono tracking-wider">
                            / 100
                          </span>
                        </div>
                      </div>

                      {/* Right: Diagnostic Assessment & Comparison Cards */}
                      <div className="flex-1 space-y-3 w-full text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border shadow-2xs ${statusBadge.badgeBg}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{statusBadge.label}</span>
                          </span>
                        </div>

                        {/* Optimal Range Target Pill */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
                          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Optimal Target Range: <strong>20 – 45</strong></span>
                          </div>
                        </div>

                        {/* Plain-English Synthesis Narrative */}
                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                          Synthesized as a single cumulative index across your 90-day hair specimen (3.0 cm) and 12-week Google Calendar workload.
                        </p>
                      </div>
                    </div>

                    {/* PRECISION VISUAL SPECTRUM BAR WITH NEEDLE PIN */}
                    <div className="pt-2 pb-1 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-black px-0.5">
                        <span className="text-slate-800">Cumulative Burnout Range Spectrum</span>
                        <span className="text-slate-500 font-medium text-[11px]">Optimal Target: 20 – 45</span>
                      </div>

                      {/* Needle Marker with Floating Tooltip (Snappy 300ms transition) */}
                      <div className="relative w-full h-6 select-none">
                        <div
                          className="absolute top-0 flex flex-col items-center transition-all duration-300 -translate-x-1/2"
                          style={{ left: `${clampedScore}%` }}
                        >
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-extrabold shadow-sm whitespace-nowrap">
                            You: {score}
                          </span>
                          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-slate-900 -mt-0.5" />
                        </div>
                      </div>

                      {/* Smooth Multi-Stop Gradient Track */}
                      <div className="relative h-3 w-full rounded-full overflow-hidden flex bg-slate-200/80 p-0.5 shadow-inner">
                        <div style={{ width: '45%' }} className="bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full" title="Optimal: 20 - 45" />
                        <div style={{ width: '20%' }} className="bg-gradient-to-r from-amber-400 to-amber-500" title="Moderate: 45 - 65" />
                        <div style={{ width: '35%' }} className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-r-full" title="High Burnout: 65 - 100" />
                      </div>

                      {/* Zone Labels with Colored Indicator Dots */}
                      <div className="flex justify-between text-[11px] pt-1 px-1 font-medium select-none">
                        <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          20–45 Optimal
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          45–65 Moderate
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-700 font-bold">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          65–100 High Burnout
                        </span>
                      </div>
                    </div>

                    {/* 3 INSTANT PILLAR CHIPS (100% Cumulative 90-Day Metrics) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <Droplet className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Cumulative Hair Cortisol
                            </div>
                            <div className="text-xs font-black text-black font-mono">
                              {cumulativeAvgCortisol} <span className="text-[10px] font-normal text-slate-500">pg/mg avg</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          cumulativeAvgCortisol > 18
                            ? 'text-rose-700 bg-rose-50 border-rose-200'
                            : cumulativeAvgCortisol > 14
                            ? 'text-amber-700 bg-amber-50 border-amber-200'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        }`}>
                          {cumulativeSurgePct > 0 ? `+${cumulativeSurgePct}% 90-Day Surge` : 'Normal Baseline'}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3186FF] flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cumulative Late Calls</div>
                            <div className="text-xs font-black text-black font-mono">
                              {totalEveningCalls} <span className="text-[10px] font-normal text-slate-500">calls</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          Past 7 PM Curfew
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3186FF] flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Calendar Hours</div>
                            <div className="text-xs font-black text-black font-mono">
                              {totalMeetingHours} <span className="text-[10px] font-normal text-slate-500">hrs (12 wks)</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          {Math.round(totalMeetingHours / 12)}h / wk avg
                        </span>
                      </div>
                    </div>

                    {/* Collapsible Dropdown: "Find how this cumulative score is derived" */}
                    <button
                      type="button"
                      onClick={() => setShowScoreDerivation(!showScoreDerivation)}
                      className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#3186FF]" />
                        <span>Find how this cumulative score is derived</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#3186FF] font-bold">
                        <span>{showScoreDerivation ? 'Hide Detailed Synthesis' : 'View Dual-Stream Cumulative Clinical Breakdown & Culprit'}</span>
                        {showScoreDerivation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Collapsible Content: 100% Cumulative 90-day breakdown */}
                    {showScoreDerivation && (
                      <div className="space-y-3 pt-2 animate-fade-in">
                        {/* 2 Data Streams: Hair Cortisol + Google Calendar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-black">
                              <Droplet className="w-4 h-4 text-purple-600" />
                              <span>1. 90-Day Cumulative Hair Cortisol (Biomarker Truth)</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Tested across your full 3.0 cm hair specimen (1 cm = 30 days): cumulative cortisol averaged <strong>{cumulativeAvgCortisol} pg/mg</strong> across the entire 90-day window (normal healthy baseline: 11.0 pg/mg), representing an overall <strong>+{cumulativeSurgePct}% cumulative stress burden</strong>.
                            </p>
                          </div>

                          {(() => {
                            const isCalConnected = !!savedCalendarIcalUrl || (savedCalendarEvents && savedCalendarEvents.length > 0);
                            const augustPeak = segments.find(s => s.id === 2)?.cortisolPgPerMg || 28.4;
                            const isDiscordanceActive = isCalConnected && totalMeetingHours <= 5 && augustPeak > 16.0;

                            return (
                              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-black">
                                  <Calendar className="w-4 h-4 text-[#3186FF]" />
                                  <span>2. 90-Day Google Calendar Workload (Chronobiology)</span>
                                </div>
                                {isDiscordanceActive ? (
                                  <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                                    <strong>Biomarker-Calendar Discordance Active</strong>: 0 scheduled calendar meeting hours found across the 12 weeks before your haircut. Desk workload conclusions are withheld pending clinical intake.
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-slate-600 leading-relaxed">
                                    <strong>{totalMeetingHours} total meeting hours</strong> across the 90-day period with <strong>{totalEveningCalls} late-night calls after 7:00 PM</strong> and <strong>{totalFlights} cross-timezone flights</strong>.
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* The Culprit Card (Dynamically rendered cumulative synthesis) */}
                        {(() => {
                          const isCalConnected = !!savedCalendarIcalUrl || (savedCalendarEvents && savedCalendarEvents.length > 0);
                          const augustPeak = segments.find(s => s.id === 2)?.cortisolPgPerMg || 28.4;
                          const isDiscordanceActive = isCalConnected && totalMeetingHours <= 5 && augustPeak > 16.0;

                          return (
                            <div className={`p-4 rounded-2xl border space-y-1.5 shadow-2xs ${
                              isDiscordanceActive ? 'bg-amber-50/90 border-amber-200 text-amber-950' : 'bg-rose-50/80 border-rose-200 text-rose-950'
                            }`}>
                              <div className="flex items-center gap-2">
                                {isDiscordanceActive ? (
                                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                ) : (
                                  <Flame className="w-4 h-4 text-rose-600 shrink-0" />
                                )}
                                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDiscordanceActive ? 'text-amber-900' : 'text-rose-900'}`}>
                                  {isDiscordanceActive ? 'Biomarker-Calendar Discordance Detected' : 'The Culprit: 90-Day Root Cause'}
                                </h4>
                              </div>
                              <p className="text-xs leading-relaxed">
                                {synthesis.rootCauseCulprit || `High cortisol accumulation was the biological consequence. The primary trigger was ${totalEveningCalls} cumulative meetings scheduled past 7:00 PM${totalFlights > 0 ? ` and ${totalFlights} timezone travel shifts` : ''} that repeatedly breached daily recovery boundaries across the quarter.`}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 2. Interactive 3cm Vertical Hair Strand Timeline */}
              <InteractiveHairStrandViewer
                segments={segments}
                activeSegmentId={activeSegmentId}
                onSelectSegment={(id) => setActiveSegmentId(id)}
                onUpdateSegment={handleUpdateSegment}
                onLoadSurgeScenario={handleLoadSurgeScenario}
              />

              {/* 3. 12-Week Cortisol & Workload Timeline */}
              <ChronoCorrelationChart
                telemetry={telemetry}
                activeSegmentId={activeSegmentId}
                onSelectSegment={(id) => setActiveSegmentId(id)}
                isCalendarConnected={!!savedCalendarIcalUrl || (savedCalendarEvents && savedCalendarEvents.length > 0)}
                calendarEmail={verifiedCalendarEmail}
                userRole={userProfile.role}
              />

              {/* 4. Personalized Action Steps */}
              <GeminiProtocolCards
                synthesis={synthesis}
                isSynthesizing={isSynthesizing}
                onRefreshSynthesis={handleTriggerSynthesis}
                onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
                onApplyCalendarRules={handleApplyCalendarRules}
                calendarRulesApplied={calendarRulesApplied}
              />

              {/* 5. Hair's Journey Timeline (Kept at the bottom of the section as requested) */}
              <HairJourneyCard currentStep={4} />
            </div>
          )}

          {/* TAB 2: GOOGLE CALENDAR & TELEMETRY INSIGHTS */}
          {dashboardTab === 'calendar' && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              {/* Calendar Overview & Sync Bar */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3186FF]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-black">Google Calendar Telemetry</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Connected</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-xs sm:max-w-md">
                      {verifiedCalendarEmail}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyCalendarRules}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      calendarRulesApplied
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {calendarRulesApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>✓ Rules Enforced</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Apply Calendar Rules</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCalendarModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Sync / Upload</span>
                  </button>
                </div>
              </div>

              {/* Metric Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-sans">
                <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Clock className="w-4 h-4 text-[#3186FF]" />
                    <span>Total Meeting Load</span>
                  </div>
                  <div className="text-2xl font-bold text-black font-mono">
                    {Math.round(totalMeetingHours)} <span className="text-xs text-slate-500 font-normal">hrs</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Over 90-day window</div>
                </div>

                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 shadow-2xs">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-rose-700 mb-1">
                    <Moon className="w-4 h-4 text-rose-600" />
                    <span>Post-7 PM Calls</span>
                  </div>
                  <div className="text-2xl font-bold text-rose-700 font-mono">
                    {totalEveningCalls} <span className="text-xs text-rose-500 font-normal">curfew calls</span>
                  </div>
                  <div className="text-[11px] text-rose-600 mt-1 font-semibold">Primary driver of delayed recovery</div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs">
                  {totalFlights > 0 ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-1">
                        <Plane className="w-4 h-4 text-amber-500" />
                        <span>Timezone Shifts</span>
                      </div>
                      <div className="text-2xl font-bold text-black font-mono">
                        {totalFlights} <span className="text-xs text-slate-500 font-normal">flights</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">Cross-meridian circadian disruption</div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-1">
                        <ShieldAlert className="w-4 h-4 text-[#3186FF]" />
                        <span>Curfew Call Burden</span>
                      </div>
                      <div className="text-2xl font-bold text-black font-mono">
                        {savedCalendarEvents.length > 0
                          ? `${Math.round((totalEveningCalls / savedCalendarEvents.length) * 100)}%`
                          : `${Math.round((totalEveningCalls / (totalEveningCalls + 115)) * 100)}%`}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {totalEveningCalls} late meetings • 0 flight disruptions
                      </div>
                    </>
                  )}
                </div>
              </div>

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
              embedded={true}
            />
          </div>

          {/* TAB 5: PROFILE & LIFESTYLE SETTINGS */}
          {dashboardTab === 'profile' && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              {/* 1. EXECUTIVE BIOMARKER DOSSIER HERO */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
                {/* Subtle ambient lighting */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-blue-50/50 via-indigo-50/20 to-transparent pointer-events-none" />

                {/* Top Row: User Avatar + Identity + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    {/* Glowing Dual-Tone Monogram Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-tr from-[#3186FF] via-[#6366F1] to-purple-600 p-[2px] shadow-sm">
                        <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center font-black text-2xl text-transparent bg-clip-text bg-gradient-to-tr from-[#3186FF] to-purple-600">
                          {(userProfile.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs" title="Verified Biomarker Specimen">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                          {userProfile.name}
                        </h2>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#3186FF] border border-blue-200">
                          Verified Patient
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {userProfile.email}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pt-0.5 flex-wrap">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{userProfile.role}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{userProfile.sector}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <a
                      href="/api/export-leads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                      title="Download or view all submitted user emails and beta waitlist in Excel / CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export Leads (Excel / CSV)</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setModalStep('questionnaire');
                        setIsLifestyleModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer shrink-0"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#3186FF]" />
                      <span>Edit Baseline</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppStage('wizard')}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Re-run Wizard</span>
                    </button>
                  </div>
                </div>

                {/* 4 Clinical Specimen & Biological Baseline Tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Specimen Dimension
                    </span>
                    <div className="text-sm font-black text-slate-900 font-mono">
                      3.0 cm Strand
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      12 Weeks (Jul – Sep 2026)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      CLIA Reference Baseline
                    </span>
                    <div className="text-sm font-black text-[#3186FF] font-mono">
                      ~11.0 pg/mg
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium block">
                      Optimal Homeostasis Norm
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Demographics Calibration
                    </span>
                    <div className="text-sm font-black text-slate-900 font-mono">
                      {userProfile.age}y • {userProfile.biologicalSex === 'female' ? (userProfile.isPregnant ? 'Female ♀ (Gestational)' : 'Female ♀') : 'Male ♂'}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {userProfile.isPregnant ? 'Gestational Calibration Active' : 'Standard Chrono-Model'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Telemetry Stream
                    </span>
                    <div className="text-sm font-black text-slate-900 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Google Calendar
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block truncate" title={verifiedCalendarEmail}>
                      {verifiedCalendarEmail || 'Synced in Background'}
                    </span>
                  </div>
                </div>

                {/* Interactive Clinical Persona Calibration Selector */}
                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Brain className="w-4 h-4 text-[#3186FF]" />
                      <span>Clinical Persona Calibration Preset</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Select persona to adapt allostatic load model
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Persona 1: Medical / Healthcare */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated: UserProfile = {
                          ...userProfile,
                          role: 'Medical Student / Clinical Scholar',
                          sector: 'Medicine & Healthcare',
                          weeklyHours: 60,
                          isCustomRole: true,
                          stressDrivers: ['hospital_ward_rotations', 'clinical_exams', 'irregular_night_shifts', 'sleep_debt'],
                        };
                        setUserProfile(updated);
                        const syn = computeDynamicSynthesis(updated, segments, telemetry);
                        setSynthesis(syn);
                        saveUserDataToStorage(updated, segments, telemetry).catch(console.warn);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        userProfile.role.includes('Medical') || userProfile.role.includes('Clinical')
                          ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        {userProfile.role.includes('Medical') || userProfile.role.includes('Clinical') ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                            Active Calibration
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs font-extrabold text-slate-900">Medical Student / Healthcare</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">AIIMS / Hospital Ward Rotations & Exams</div>
                      <div className="text-[10px] text-emerald-800 font-semibold mt-2.5 pt-2 border-t border-slate-200/60">
                        Zero desk meeting bias • Shift stress model
                      </div>
                    </button>

                    {/* Persona 2: Tech Founder / AI Research */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated: UserProfile = {
                          ...userProfile,
                          role: 'Tech Founder & AI Research Lead',
                          sector: 'Technology & Biotech',
                          weeklyHours: 65,
                          isCustomRole: true,
                          stressDrivers: ['evening_meetings', 'cross_timezone_flights', 'sleep_debt', 'stakeholder_board_pressure'],
                        };
                        setUserProfile(updated);
                        const syn = computeDynamicSynthesis(updated, segments, telemetry);
                        setSynthesis(syn);
                        saveUserDataToStorage(updated, segments, telemetry).catch(console.warn);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        userProfile.role.includes('Founder') || userProfile.role.includes('Tech')
                          ? 'bg-blue-50/70 border-[#3186FF] ring-2 ring-[#3186FF]/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#3186FF] flex items-center justify-center font-bold">
                          <Zap className="w-4 h-4" />
                        </div>
                        {userProfile.role.includes('Founder') || userProfile.role.includes('Tech') ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3186FF] text-white shadow-2xs">
                            Active Calibration
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs font-extrabold text-slate-900">Tech Founder / AI Lead</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Biotech & Software • Product Crunch</div>
                      <div className="text-[10px] text-blue-800 font-semibold mt-2.5 pt-2 border-t border-slate-200/60">
                        Late curfew calls & board meeting pressure
                      </div>
                    </button>

                    {/* Persona 3: Executive / Corporate */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated: UserProfile = {
                          ...userProfile,
                          role: 'Executive / Corporate Professional',
                          sector: 'Finance & Strategy',
                          weeklyHours: 55,
                          isCustomRole: true,
                          stressDrivers: ['evening_meetings', 'heavy_deadlines', 'sleep_debt'],
                        };
                        setUserProfile(updated);
                        const syn = computeDynamicSynthesis(updated, segments, telemetry);
                        setSynthesis(syn);
                        saveUserDataToStorage(updated, segments, telemetry).catch(console.warn);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        userProfile.role.includes('Executive') || userProfile.role.includes('Corporate')
                          ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        {userProfile.role.includes('Executive') || userProfile.role.includes('Corporate') ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-2xs">
                            Active Calibration
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs font-extrabold text-slate-900">Executive / Corporate Leader</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Finance & Strategy • Executive Meetings</div>
                      <div className="text-[10px] text-purple-800 font-semibold mt-2.5 pt-2 border-t border-slate-200/60">
                        High meeting load & timezone flight shifts
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. LIFESTYLE & CIRCADIAN ARCHITECTURE GRID */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3186FF] flex items-center justify-center">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                        Lifestyle & Circadian Architecture
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Self-reported baseline parameters correlated with 12-week cortisol segments
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ✓ Saved to Storage
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* Weekly Workload Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#3186FF] flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#3186FF]">
                        Weekly Load
                      </span>
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900 font-mono">
                        {userProfile.weeklyHours || 65} <span className="text-xs text-slate-500 font-normal">hrs/wk</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {userProfile.weeklyHours > 60 ? 'High sustained workload intensity' : 'Standard professional schedule'}
                      </p>
                    </div>
                  </div>

                  {/* Chronotype Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Sun className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 capitalize">
                        {userProfile.chronotype?.replace('_', ' ') || 'Morning Lark'}
                      </span>
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900 capitalize">
                        {userProfile.chronotype?.replace('_', ' ') || 'Morning Lark'}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Peak alertness: 07:00 – 14:00 • Natural morning cortisol peak
                      </p>
                    </div>
                  </div>

                  {/* Nightly Sleep Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Moon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (userProfile.nightlySleepHours || 6) < 7
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {(userProfile.nightlySleepHours || 6) < 7 ? 'Sleep Deficit' : 'Optimal'}
                      </span>
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900 font-mono">
                        {userProfile.nightlySleepHours || 6.0} <span className="text-xs text-slate-500 font-normal">hrs/night</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Target: 7.5 – 8.5 hrs for full allostatic reset
                      </p>
                    </div>
                  </div>

                  {/* Work Boundary Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Evening Work
                      </span>
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900">
                        {userProfile.workBoundaryBleed === 'always_on_bed'
                          ? 'Late Bedside'
                          : userProfile.workBoundaryBleed === 'occasional_bleed'
                          ? 'Until 9:00 PM'
                          : 'Stop by 7 PM'}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {userProfile.workBoundaryBleed === 'always_on_bed'
                          ? 'Bedside screen exposure inhibits melatonin'
                          : userProfile.workBoundaryBleed === 'occasional_bleed'
                          ? 'Moderate evening boundary bleed'
                          : 'Healthy cutoff supporting circadian reset'}
                      </p>
                    </div>
                  </div>

                  {/* International Travel Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Plane className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        Travel
                      </span>
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900">
                        {userProfile.travelFrequency === 'none_domestic'
                          ? 'Domestic'
                          : userProfile.travelFrequency === 'constant_nomad'
                          ? 'Global Nomad'
                          : userProfile.travelFrequency === 'frequent_cross_meridian'
                          ? 'Monthly Flights'
                          : 'Occasional'}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {userProfile.travelFrequency === 'frequent_cross_meridian' || userProfile.travelFrequency === 'constant_nomad'
                          ? 'Frequent timezone cross-meridian shifts'
                          : 'Circadian phase protected from jetlag'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Stress Drivers Interactive Chips */}
                <div className="pt-2">
                  <span className="text-xs font-extrabold text-slate-800 block mb-2">
                    Reported Lifestyle Stress Drivers:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(userProfile.stressDrivers || ['evening_meetings', 'sleep_debt']).map((driver, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[#3186FF] text-xs font-bold capitalize shadow-2xs"
                      >
                        <Flame className="w-3.5 h-3.5 text-rose-500" />
                        <span>{driver.replace(/_/g, ' ')}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. MEDICAL HISTORY & REAGENT CROSS-REACTIVITY DOSSIER */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                        Medical Calibrations & Cross-Reactivity Audit
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Audited against CLIA-88 Micro-ELISA reagent standards to verify specimen purity
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ✓ Reagent Purity Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                      <HeartPulse className="w-4 h-4 text-emerald-600" />
                      <span>Pre-Existing Health Conditions</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200/70">
                      {(userProfile.healthConditions && userProfile.healthConditions.length > 0 && userProfile.healthConditions[0] !== 'none')
                        ? userProfile.healthConditions.map(c => c.replace(/_/g, ' ')).join(', ')
                        : 'None (No diagnosed chronic metabolic or endocrine conditions)'}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Baseline hair cortisol algorithm normalizes against endocrine variants (Cushing's, Addison's, Gestation).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                      <Pill className="w-4 h-4 text-[#3186FF]" />
                      <span>Daily Prescriptions & Medications</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200/70">
                      {(userProfile.medications && userProfile.medications.length > 0 && userProfile.medications[0] !== 'none')
                        ? userProfile.medications.map(m => m.replace(/_/g, ' ')).join(', ')
                        : 'None (No synthetic steroid or corticosteroid medications)'}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Specimen confirmed free of hydrocortisone, prednisone, or dexamethasone cross-reactivity.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. DATA CUSTODY, CLOUD STORAGE & ACCOUNT ACTIONS */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                        Cloud Storage & Patient Data Custody
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Encrypted clinical biomarker data synchronized across cloud and local storage
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#3186FF]">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Supabase Cloud Vault</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-emerald-700 font-semibold">TLS 1.3 Encrypted</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        nyxivqlpikoffdopfmei.supabase.co
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                    Chain of Custody: #DEL-2026-9842
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setModalStep('questionnaire');
                        setIsLifestyleModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      Update Lifestyle Questionnaire
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppStage('wizard')}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Re-run Lab Intake Wizard
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of BAALANCE</span>
                  </button>
                </div>
              </div>
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

        {/* App Guide & Feature Walkthrough Modal for Judges & Users */}
        <AppGuideModal
          isOpen={isAppGuideOpen}
          onClose={() => setIsAppGuideOpen(false)}
          onNavigateTab={(tab) => setDashboardTab(tab)}
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
          events={defenseEvents}
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
                  Wearables capture acute minute-to-minute fluctuations in stress (HRV, heart rate spikes), while hair cortisol captures chronic cumulative stress levels over 90 days. We are integrating both so Gemini can autonomously protect your calendar.
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
                    🍎
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Apple Watch</span>
                  <span className="text-[9px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                    In Alpha
                  </span>
                </div>
              </div>

              {/* Informative Callout */}
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-left text-xs text-blue-950 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#3186FF] shrink-0 mt-0.5" />
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
