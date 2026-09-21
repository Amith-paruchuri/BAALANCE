'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Calendar,
  Activity,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Play,
  ShieldCheck,
  Clock,
  Moon,
  PlusCircle,
  Scissors,
  Check,
  RefreshCw,
  Zap,
  Link as LinkIcon,
  ExternalLink,
  HelpCircle,
  User,
  HeartPulse,
  Pill,
  Cpu,
  Stethoscope,
  TrendingUp,
  Server,
  Scale,
  Compass,
  Palette,
  BarChart3,
  Plane,
  Flame,
  BatteryLow,
  Users,
  BellRing,
  TrendingDown,
  Brain,
  Droplet,
  Heart,
  Plus,
  Minus,
  Lock,
  AlertTriangle,
  AlertCircle,
  FileText,
  Sun,
  Coffee,
  Bed,
} from 'lucide-react';
import {
  UserProfile,
  HairCortisolSegment,
  WeeklyTelemetry,
  Chronotype,
  StressDriver,
  SleepQuality,
  WorkBoundaryBleed,
  TravelFrequency,
  CaffeineHabit,
  SomaticSymptom,
} from '@/lib/types';
import { BaalanceLogo } from './BaalanceLogo';
import { saveUserDataToStorage } from '@/lib/storageService';
import { parseIcsContent } from '@/lib/icalParser';
import { WEEKLY_12_WEEK_TELEMETRY } from '@/lib/mockData';

interface FunctionalOnboardingWizardProps {
  initialProfile: UserProfile;
  onComplete: (data: {
    profile: UserProfile;
    segments: HairCortisolSegment[];
    telemetry: WeeklyTelemetry[];
    calendarIcalUrl?: string;
    calendarEvents?: any[];
  }) => void;
  onCancel: () => void;
  onStartDemo?: () => void;
}

const PRESET_ROLES = [
  {
    role: 'Tech Founder & AI Lead',
    sector: 'Software & AI',
    icon: Cpu,
    iconColor: 'text-[#3186FF]',
    iconBg: 'bg-blue-50 border-blue-200',
    accentGradient: 'from-blue-500 to-indigo-600',
    description: 'Sprint crunches & runway pressure',
  },
  {
    role: 'Resident Physician & Surgeon',
    sector: 'Acute Healthcare',
    icon: Stethoscope,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200',
    accentGradient: 'from-emerald-500 to-teal-600',
    description: 'Night rotations & critical vigilance',
  },
  {
    role: 'Investment Banking / PE',
    sector: 'Capital Markets',
    icon: TrendingUp,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200',
    accentGradient: 'from-amber-500 to-orange-600',
    description: 'Live deal flow & 80h+ closing weeks',
  },
  {
    role: 'Staff Infrastructure Engineer',
    sector: 'Cloud & SRE',
    icon: Server,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-50 border-cyan-200',
    accentGradient: 'from-cyan-500 to-blue-600',
    description: '24/7 on-call cascades & SEV-0 alerts',
  },
  {
    role: 'Corporate Attorney',
    sector: 'Corporate Law',
    icon: Scale,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 border-purple-200',
    accentGradient: 'from-purple-500 to-indigo-600',
    description: 'High-stakes litigation & billables',
  },
  {
    role: 'Management Consultant',
    sector: 'Strategy & Ops',
    icon: Compass,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-200',
    accentGradient: 'from-indigo-500 to-violet-600',
    description: 'Client deliverables & Monday travel',
  },
  {
    role: 'Creative Director',
    sector: 'Design & Media',
    icon: Palette,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50 border-pink-200',
    accentGradient: 'from-pink-500 to-rose-600',
    description: 'Agency pitch blitzes & campaign deadlines',
  },
  {
    role: 'Quantitative Trader',
    sector: 'High-Freq Finance',
    icon: BarChart3,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50 border-teal-200',
    accentGradient: 'from-teal-500 to-emerald-600',
    description: 'Market open volatility & risk limits',
  },
];

const STRESS_DRIVER_OPTIONS: { id: StressDriver; label: string; icon: any; iconColor: string; bg: string }[] = [
  { id: 'evening_meetings', label: 'Late Evening Meetings', icon: Moon, iconColor: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'cross_timezone_flights', label: 'Long Flights & Travel', icon: Plane, iconColor: 'text-sky-600', bg: 'bg-sky-50' },
  { id: 'heavy_deadlines', label: 'High Workload & Deadlines', icon: Flame, iconColor: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'sleep_debt', label: 'Short Sleep (<6.5 hrs)', icon: BatteryLow, iconColor: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'stakeholder_board_pressure', label: 'Boss, Client or Exam Pressure', icon: Users, iconColor: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'on_call_pager_duty', label: 'Always On-Call / Night Alerts', icon: BellRing, iconColor: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'financial_runway_anxiety', label: 'Financial or Project Stress', icon: TrendingDown, iconColor: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const HEALTH_CONDITION_OPTIONS = [
  { id: 'hypertension_cvd', label: 'Hypertension / Cardiovascular Strain', icon: Heart, iconColor: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'diabetes_metabolic', label: 'Type 2 Diabetes / Metabolic Strain', icon: Droplet, iconColor: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'migraines_headaches', label: 'Chronic Migraines / Tension Headaches', icon: Brain, iconColor: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'ibs_gut_friction', label: 'IBS / Gastrointestinal Reflux (GERD)', icon: Activity, iconColor: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'autoimmune_disease', label: 'Autoimmune (Hashimoto’s, Alopecia, Psoriasis)', icon: ShieldCheck, iconColor: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'clinical_anxiety_depression', label: 'Clinical Anxiety / Major Depression', icon: Sparkles, iconColor: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'none', label: 'None (No diagnosed chronic conditions)', icon: CheckCircle2, iconColor: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const MEDICATION_OPTIONS = [
  { id: 'beta_blockers', label: 'Beta Blockers (Propranolol, Metoprolol)', icon: Pill, iconColor: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'ssri_snri', label: 'SSRIs / SNRIs (Sertraline, Lexapro)', icon: Pill, iconColor: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'corticosteroids', label: 'Corticosteroids (Prednisone, Inhalers, Creams)', icon: Pill, iconColor: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'thyroid_replacement', label: 'Thyroid Replacement (Levothyroxine)', icon: Pill, iconColor: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'adhd_stimulants', label: 'ADHD Stimulants (Adderall, Vyvanse)', icon: Zap, iconColor: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'sleep_aids_sedatives', label: 'Sleep Aids / Melatonin / Sedatives', icon: Moon, iconColor: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'none', label: 'None (No daily prescriptions)', icon: CheckCircle2, iconColor: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const SOMATIC_OPTIONS: { id: SomaticSymptom; label: string; note: string }[] = [
  { id: 'brain_fog', label: 'Brain Fog & Executive Fatigue', note: 'Delayed cognitive retrieval' },
  { id: 'tension_headaches', label: 'Tension Headaches & Neck Rigidity', note: 'Persistent muscular contraction' },
  { id: 'heart_palpitations', label: 'Heart Palpitations & Restless Pulse', note: 'Elevated sympathetic tone' },
  { id: 'gi_gut_friction', label: 'GI Friction & Acid Reflux', note: 'Cortisol-mediated gut barrier shifts' },
];

export const FunctionalOnboardingWizard: React.FC<FunctionalOnboardingWizardProps> = ({
  initialProfile,
  onComplete,
  onCancel,
  onStartDemo,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // STEP 1: LIFESTYLE & STRESS PROFILE
  const [selectedRole, setSelectedRole] = useState(initialProfile.role || 'Tech Founder & AI Lead');
  const [selectedSector, setSelectedSector] = useState(initialProfile.sector || 'Software & AI');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRole, setCustomRole] = useState('');
  const [customSector, setCustomSector] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(initialProfile.weeklyHours || 65);
  const [chronotype, setChronotype] = useState<Chronotype>(initialProfile.chronotype || 'morning_lark');
  const [nightlySleepHours, setNightlySleepHours] = useState(initialProfile.nightlySleepHours || 6.0);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>(initialProfile.sleepQuality || 'middle_night_awakenings');
  const [workBoundaryBleed, setWorkBoundaryBleed] = useState<WorkBoundaryBleed>(initialProfile.workBoundaryBleed || 'always_on_bed');
  const [travelFrequency, setTravelFrequency] = useState<TravelFrequency>(initialProfile.travelFrequency || 'occasional');
  const [caffeineHabit, setCaffeineHabit] = useState<CaffeineHabit>(initialProfile.caffeineHabit || 'immediate_waking');
  const [perceivedStressRating, setPerceivedStressRating] = useState<number>(initialProfile.perceivedStressRating || 7);
  const [somaticSymptoms, setSomaticSymptoms] = useState<SomaticSymptom[]>(
    initialProfile.somaticSymptoms && initialProfile.somaticSymptoms.length > 0
      ? initialProfile.somaticSymptoms
      : ['brain_fog', 'tension_headaches']
  );
  const [stressDrivers, setStressDrivers] = useState<StressDriver[]>(initialProfile.stressDrivers || ['evening_meetings', 'sleep_debt']);

  const handleToggleSomatic = (id: SomaticSymptom) => {
    setSomaticSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Demographic Baseline - populated from auth input or blank
  const [fullName, setFullName] = useState<string>(
    initialProfile.name && initialProfile.name !== 'Dr. Elena Rostova' ? initialProfile.name : ''
  );
  const [age, setAge] = useState<number>(initialProfile.age || 32);
  const [biologicalSex, setBiologicalSex] = useState<'male' | 'female' | 'other'>(initialProfile.biologicalSex || 'male');
  const [isPregnant, setIsPregnant] = useState<boolean>(initialProfile.isPregnant || false);

  // Pre-existing Health Conditions
  const [healthConditions, setHealthConditions] = useState<string[]>(initialProfile.healthConditions || ['none']);
  const [customHealthCondition, setCustomHealthCondition] = useState('');
  const [showCustomHealthInput, setShowCustomHealthInput] = useState(false);

  // Current Medications
  const [medications, setMedications] = useState<string[]>(initialProfile.medications || ['none']);
  const [customMedication, setCustomMedication] = useState('');
  const [showCustomMedInput, setShowCustomMedInput] = useState(false);

  const handleToggleStressDriver = (id: StressDriver) => {
    setStressDrivers(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleToggleHealthCondition = (id: string) => {
    setHealthConditions(prev => {
      if (id === 'none') {
        return prev.includes('none') ? [] : ['none'];
      }
      const withoutNone = prev.filter(c => c !== 'none');
      if (withoutNone.includes(id)) {
        return withoutNone.filter(c => c !== id);
      }
      return [...withoutNone, id];
    });
  };

  const handleAddCustomHealthCondition = () => {
    if (customHealthCondition.trim()) {
      setHealthConditions(prev => [...prev.filter(c => c !== 'none'), customHealthCondition.trim()]);
      setCustomHealthCondition('');
      setShowCustomHealthInput(false);
    }
  };

  const handleToggleMedication = (id: string) => {
    setMedications(prev => {
      if (id === 'none') {
        return prev.includes('none') ? [] : ['none'];
      }
      const withoutNone = prev.filter(m => m !== 'none');
      if (withoutNone.includes(id)) {
        return withoutNone.filter(m => m !== id);
      }
      return [...withoutNone, id];
    });
  };

  const handleAddCustomMedication = () => {
    if (customMedication.trim()) {
      setMedications(prev => [...prev.filter(m => m !== 'none'), customMedication.trim()]);
      setCustomMedication('');
      setShowCustomMedInput(false);
    }
  };

  // STEP 2: GOOGLE CALENDAR & WEARABLE INTEGRATIONS
  const [calendarEmail, setCalendarEmail] = useState(
    initialProfile.email && initialProfile.email !== 'elena.rostova@gemini-biomed.ai' ? initialProfile.email : ''
  );
  const [calendarSyncMode, setCalendarSyncMode] = useState<'ical_link' | 'oauth' | 'file_upload' | 'demo'>('ical_link');
  const [icalUrlInput, setIcalUrlInput] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [showCustomClientIdInput, setShowCustomClientIdInput] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState('');
  const [syncedEvents, setSyncedEvents] = useState<any[]>([]);
  const [feedSourceName, setFeedSourceName] = useState<'real_ical' | 'imported_file' | 'clinical_benchmark'>('clinical_benchmark');
  const [verifiedCalendarData, setVerifiedCalendarData] = useState<any>(null);
  const [calendarStats, setCalendarStats] = useState({
    totalEvents: 148,
    totalMeetingHours: 396,
    eveningCalls: 23,
    flights: 4,
    curfewBreachPct: 15.5,
    busiestDay: 'Thursday',
    peakLateDay: 'Thursday',
    avgLateTimeRange: '7:30 PM to 9:45 PM',
    avgMeetingDurationMins: 45,
  });

  const [showSecretIcalInstructions, setShowSecretIcalInstructions] = useState(false);

  // Step 3 Specimen & ELISA State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [barcode, setBarcode] = useState('#BL-8942');
  const [salonSite, setSalonSite] = useState('LAKME Salon, South Extension, Delhi');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [labUploadError, setLabUploadError] = useState<string>('');
  const [labExtractionStatus, setLabExtractionStatus] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [hasLoadedLabData, setHasLoadedLabData] = useState<boolean>(false);
  const [labDataSource, setLabDataSource] = useState<'demo' | 'uploaded' | 'manual' | null>(null);
  const [m1Value, setM1Value] = useState(11.2); // July (Tip: 2-3cm)
  const [m2Value, setM2Value] = useState(28.4); // August (Mid: 1-2cm)
  const [m3Value, setM3Value] = useState(15.6); // September (Root: 0-1cm)

  // Step 4 Synthesis State
  const [synthesisProgress, setSynthesisProgress] = useState(0);

  const handleSyncIcalUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!icalUrlInput.trim()) return;

    setIsConnectingCalendar(true);
    setCalendarError('');
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icalUrl: icalUrlInput.trim(), email: calendarEmail }),
      });
      const data = await res.json();
      if (data.success && data.events && data.events.length > 0) {
        const events = data.events || [];
        const totalEvents = data.totalEvents || events.length;
        const totalMeetingHours = data.totalMeetingHours || Math.round(events.reduce((s: number, e: any) => s + (e.durationHours || 1), 0));
        const eveningCalls = data.eveningCalls ?? events.filter((e: any) => e.isCurfewBreach).length;
        const flights = data.flights ?? 0;
        const curfewBreachPct = data.curfewBreachPct ?? (totalEvents > 0 ? parseFloat(((eveningCalls / totalEvents) * 100).toFixed(1)) : 0);
        const busiestDay = data.busiestDay || 'Thursday';
        const peakLateDay = data.peakLateDay || 'Thursday';
        const avgLateTimeRange = data.avgLateTimeRange || '7:00 PM to 10:00 PM';
        const avgMeetingDurationMins = data.avgMeetingDurationMins || 45;

        setVerifiedCalendarData(data);
        setSyncedEvents(events);
        setFeedSourceName('real_ical');
        setCalendarStats({
          totalEvents,
          totalMeetingHours,
          eveningCalls,
          flights,
          curfewBreachPct,
          busiestDay,
          peakLateDay,
          avgLateTimeRange,
          avgMeetingDurationMins,
        });
        setIsCalendarConnected(true);
      } else {
        setCalendarError(data.error || 'No calendar events found at this URL. Please verify the secret link.');
      }
    } catch (err: any) {
      setCalendarError(err.message || 'Error syncing calendar URL');
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  const handleIcsFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsConnectingCalendar(true);
    setCalendarError('');
    try {
      const text = await file.text();
      const parsed = parseIcsContent(text);
      if (parsed.totalEvents > 0) {
        setSyncedEvents(parsed.events);
        setFeedSourceName('imported_file');
        setCalendarStats({
          totalEvents: parsed.totalEvents,
          totalMeetingHours: parsed.totalMeetingHours,
          eveningCalls: parsed.eveningCalls,
          flights: parsed.totalFlights,
          curfewBreachPct: parsed.curfewBreachPct,
          busiestDay: parsed.busiestDay,
          peakLateDay: parsed.peakLateDay,
          avgLateTimeRange: parsed.avgLateTimeRange,
          avgMeetingDurationMins: parsed.avgMeetingDurationMins,
        });
        setVerifiedCalendarData({
          provider: 'Exported .ics File',
          totalEvents: parsed.totalEvents,
          totalMeetingHours: parsed.totalMeetingHours,
          eveningCalls: parsed.eveningCalls,
          flights: parsed.totalFlights,
          curfewBreachPct: parsed.curfewBreachPct,
          busiestDay: parsed.busiestDay,
          peakLateDay: parsed.peakLateDay,
          avgLateTimeRange: parsed.avgLateTimeRange,
          avgMeetingDurationMins: parsed.avgMeetingDurationMins,
          weeklyTelemetry: parsed.weeklyTelemetry,
          events: parsed.events,
        });
        setIsCalendarConnected(true);
      } else {
        setCalendarError('No valid events found in this .ics file.');
      }
    } catch (err: any) {
      setCalendarError('Error parsing file: ' + err.message);
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  const handleLoadDemoData = () => {
    setFeedSourceName('clinical_benchmark');
    setSyncedEvents([]);
    setCalendarStats({
      totalEvents: 148,
      totalMeetingHours: 396,
      eveningCalls: 23,
      flights: 4,
      curfewBreachPct: 15.5,
      busiestDay: 'Thursday',
      peakLateDay: 'Thursday',
      avgLateTimeRange: '7:30 PM to 9:45 PM',
      avgMeetingDurationMins: 45,
    });
    setVerifiedCalendarData({
      provider: 'Demo Clinical Benchmark',
      totalEvents: 148,
      totalMeetingHours: 396,
      eveningCalls: 23,
      flights: 4,
      weeklyTelemetry: WEEKLY_12_WEEK_TELEMETRY,
    });
    setIsCalendarConnected(true);
    setCalendarError('');
  };

  const handleVerifyGoogleCalendar = async () => {
    setIsConnectingCalendar(true);
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: calendarEmail.trim() || 'amithparuchuri@gmail.com' }),
      });
      const data = await res.json();
      if (data.success) {
        setVerifiedCalendarData(data);
        setIsCalendarConnected(true);
      }
    } catch (e) {
      console.warn('Calendar sync error:', e);
      setIsCalendarConnected(true);
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  const handleLoadDemoLabData = () => {
    setM1Value(11.2); // Month 1: July (Tip: 2-3cm)
    setM2Value(28.4); // Month 2: August (Mid: 1-2cm)
    setM3Value(15.6); // Month 3: September (Root: 0-1cm)
    setUploadedFileName('Clinical-Benchmark-ELISA-Report.pdf');
    setHasLoadedLabData(true);
    setLabDataSource('demo');
    setLabUploadError('');
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setLabUploadError('Please select a valid PDF file. Only certified laboratory PDF reports can be analyzed.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setLabUploadError('The selected file exceeds the 20MB limit. Please upload a standard laboratory report PDF.');
      return;
    }

    setIsExtractingPdf(true);
    setLabUploadError('');
    setLabExtractionStatus('Scanning report with Gemini AI...');

    try {
      // Convert file to Base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file from browser.'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/parse-lab-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: base64Data,
          mimeType: file.type || 'application/pdf',
        }),
      });

      const data = await res.json();

      if (data.success && data.isHairCortisolReport) {
        setUploadedFileName(file.name);
        if (data.barcode) setBarcode(data.barcode);
        if (data.salonOrLab) setSalonSite(data.salonOrLab);
        if (data.month1?.cortisolPgPerMg) setM1Value(Number(data.month1.cortisolPgPerMg));
        if (data.month2?.cortisolPgPerMg) setM2Value(Number(data.month2.cortisolPgPerMg));
        if (data.month3?.cortisolPgPerMg) setM3Value(Number(data.month3.cortisolPgPerMg));
        setHasLoadedLabData(true);
        setLabDataSource('uploaded');
        setLabUploadError('');
      } else {
        // Document rejected as not being a hair cortisol ELISA report
        setLabUploadError(
          data.rejectionReason ||
          data.error ||
          'The uploaded document is not a certified Hair Cortisol ELISA / Spectrometry report. Please upload a valid laboratory report, or try demo data instead.'
        );
        setUploadedFileName('');
        setHasLoadedLabData(false);
        setLabDataSource(null);
      }
    } catch (err: any) {
      console.error('[Gemini Lab Report Scan Error]', err);
      setLabUploadError(
        `Could not scan document: ${err.message || 'Processing error'}. Please upload a certified Hair Cortisol report, or try demo data instead.`
      );
      setUploadedFileName('');
      setHasLoadedLabData(false);
      setLabDataSource(null);
    } finally {
      setIsExtractingPdf(false);
      setLabExtractionStatus('');
    }
  };

  const handleSimulateReportUpload = () => {
    setIsExtractingPdf(true);
    setTimeout(() => {
      setUploadedFileName('ELISA-Spectrometry-BL8942.pdf');
      setM1Value(11.2); // Month 1: July (Tip: 2-3cm)
      setM2Value(28.4); // Month 2: August (Mid: 1-2cm)
      setM3Value(15.6); // Month 3: September (Root: 0-1cm)
      setHasLoadedLabData(true);
      setLabDataSource('uploaded');
      setLabUploadError('');
      setIsExtractingPdf(false);
    }, 700);
  };

  const handleTriggerSynthesis = () => {
    if (!hasLoadedLabData) {
      setHasLoadedLabData(true);
      setLabDataSource('demo');
      setM1Value(11.2);
      setM2Value(28.4);
      setM3Value(15.6);
    }
    setCurrentStep(4);
    setSynthesisProgress(25);

    setTimeout(() => {
      setSynthesisProgress(60);
    }, 500);

    setTimeout(() => {
      setSynthesisProgress(100);
      setTimeout(() => {
        const finalRole = isCustomRole ? (customRole.trim() || 'Specialized Professional') : selectedRole;
        const finalSector = isCustomRole ? (customSector.trim() || 'Industry') : selectedSector;

        const updatedProfile: UserProfile = {
          ...initialProfile,
          name: fullName.trim() || initialProfile.name,
          email: calendarEmail.trim() || initialProfile.email,
          calendarIcalUrl: icalUrlInput.trim() || initialProfile.calendarIcalUrl,
          role: finalRole,
          sector: finalSector,
          isCustomRole,
          age,
          biologicalSex,
          isPregnant: biologicalSex === 'female' ? isPregnant : false,
          healthConditions,
          medications,
          weeklyHours,
          chronotype,
          nightlySleepHours,
          sleepQuality,
          workBoundaryBleed,
          travelFrequency,
          caffeineHabit,
          perceivedStressRating,
          somaticSymptoms,
          stressDrivers,
          isDemo: false,
        };

        const updatedSegments: HairCortisolSegment[] = [
          {
            id: 1,
            segmentKey: 'month1',
            title: 'July',
            anatomicalRegion: 'Tip (2.0–3.0 cm)',
            distanceCm: '2.0–3.0 cm',
            timeWindow: '60–90d ago (July)',
            cortisolPgPerMg: m1Value,
            referenceBaseline: 11.0,
            status: m1Value > 20 ? 'acute_surge' : m1Value > 14 ? 'incomplete_recovery' : 'baseline',
            clinicalStatusLabel: m1Value > 20 ? 'Acute Surge' : m1Value > 14 ? 'Elevated' : 'Homeostasis',
            clinicalNote: 'July tip baseline segment.',
          },
          {
            id: 2,
            segmentKey: 'month2',
            title: 'August',
            anatomicalRegion: 'Mid-Shaft (1.0–2.0 cm)',
            distanceCm: '1.0–2.0 cm',
            timeWindow: '30–60d ago (August)',
            cortisolPgPerMg: m2Value,
            referenceBaseline: 11.0,
            status: m2Value > 20 ? 'acute_surge' : 'incomplete_recovery',
            clinicalStatusLabel: m2Value > 20 ? 'Acute Surge' : 'Elevated',
            clinicalNote: 'August mid-shaft acute surge.',
          },
          {
            id: 3,
            segmentKey: 'month3',
            title: 'September',
            anatomicalRegion: 'Root (0.0–1.0 cm)',
            distanceCm: '0.0–1.0 cm',
            timeWindow: 'Last 30d (September)',
            cortisolPgPerMg: m3Value,
            referenceBaseline: 11.0,
            status: m3Value > 14 ? 'incomplete_recovery' : 'optimal',
            clinicalStatusLabel: m3Value > 14 ? 'Incomplete Recovery' : 'Homeostasis',
            clinicalNote: 'September scalp root recent growth.',
          },
        ];

        // 12-week telemetry reflecting real ingested calendar data when available
        const defaultTelemetry: WeeklyTelemetry[] = [
          { weekNumber: 1, weekLabel: 'W1', month: 1, monthLabel: 'July', dateRange: 'Jun 22 - Jun 28', cortisolPgPerMg: 11.2, meetingHours: 25.0, eveningCalls: 1, flightShifts: 0, deepSleepHours: 1.4, restingHeartRate: 55, hrvRmssd: 66, isSleepDeficit: false, triggerDetails: 'Baseline physiological regulation' },
          { weekNumber: 2, weekLabel: 'W2', month: 1, monthLabel: 'July', dateRange: 'Jun 29 - Jul 05', cortisolPgPerMg: 11.5, meetingHours: 26.5, eveningCalls: 1, flightShifts: 0, deepSleepHours: 1.35, restingHeartRate: 56, hrvRmssd: 63, isSleepDeficit: false, triggerDetails: 'Standard operating load' },
          { weekNumber: 3, weekLabel: 'W3', month: 1, monthLabel: 'July', dateRange: 'Jul 06 - Jul 12', cortisolPgPerMg: 11.8, meetingHours: 28.0, eveningCalls: 2, flightShifts: 0, deepSleepHours: 1.3, restingHeartRate: 56, hrvRmssd: 61, isSleepDeficit: false, triggerDetails: 'Roadmap kickoffs' },
          { weekNumber: 4, weekLabel: 'W4', month: 1, monthLabel: 'July', dateRange: 'Jul 13 - Jul 19', cortisolPgPerMg: 12.4, meetingHours: 30.0, eveningCalls: 3, flightShifts: 1, deepSleepHours: 1.15, restingHeartRate: 58, hrvRmssd: 56, isSleepDeficit: false, triggerDetails: 'Cross-country flight' },
          { weekNumber: 5, weekLabel: 'W5', month: 2, monthLabel: 'August', dateRange: 'Jul 20 - Jul 26', cortisolPgPerMg: 21.0, meetingHours: 38.0, eveningCalls: 6, flightShifts: 1, deepSleepHours: 0.70, restingHeartRate: 63, hrvRmssd: 42, isSleepDeficit: true, triggerDetails: 'Late conference calls' },
          { weekNumber: 6, weekLabel: 'W6', month: 2, monthLabel: 'August', dateRange: 'Jul 27 - Aug 02', cortisolPgPerMg: 26.2, meetingHours: 45.0, eveningCalls: 9, flightShifts: 2, deepSleepHours: 0.50, restingHeartRate: 67, hrvRmssd: 27, isSleepDeficit: true, triggerDetails: 'Travel + late calls' },
          { weekNumber: 7, weekLabel: 'W7', month: 2, monthLabel: 'August', dateRange: 'Aug 03 - Aug 09', cortisolPgPerMg: 28.4, meetingHours: 47.5, eveningCalls: 11, flightShifts: 4, deepSleepHours: 0.44, restingHeartRate: 70, hrvRmssd: 21, isSleepDeficit: true, triggerDetails: 'Peak load: 47.5h & 11 calls' },
          { weekNumber: 8, weekLabel: 'W8', month: 2, monthLabel: 'August', dateRange: 'Aug 10 - Aug 16', cortisolPgPerMg: 24.0, meetingHours: 40.0, eveningCalls: 7, flightShifts: 1, deepSleepHours: 0.60, restingHeartRate: 65, hrvRmssd: 30, isSleepDeficit: true, triggerDetails: 'High stress peak' },
          { weekNumber: 9, weekLabel: 'W9', month: 3, monthLabel: 'September', dateRange: 'Aug 17 - Aug 23', cortisolPgPerMg: 19.5, meetingHours: 33.0, eveningCalls: 4, flightShifts: 0, deepSleepHours: 0.76, restingHeartRate: 63, hrvRmssd: 37, isSleepDeficit: true, triggerDetails: 'Gradual ramp-down' },
          { weekNumber: 10, weekLabel: 'W10', month: 3, monthLabel: 'September', dateRange: 'Aug 24 - Aug 30', cortisolPgPerMg: 17.8, meetingHours: 30.0, eveningCalls: 3, flightShifts: 0, deepSleepHours: 0.84, restingHeartRate: 61, hrvRmssd: 42, isSleepDeficit: false, triggerDetails: 'Recovery phase' },
          { weekNumber: 11, weekLabel: 'W11', month: 3, monthLabel: 'September', dateRange: 'Aug 31 - Sep 06', cortisolPgPerMg: 16.4, meetingHours: 28.5, eveningCalls: 3, flightShifts: 0, deepSleepHours: 0.88, restingHeartRate: 59, hrvRmssd: 47, isSleepDeficit: false, triggerDetails: 'Partial rest' },
          { weekNumber: 12, weekLabel: 'W12', month: 3, monthLabel: 'September', dateRange: 'Sep 07 - Sep 13', cortisolPgPerMg: 15.6, meetingHours: 28.0, eveningCalls: 2, flightShifts: 0, deepSleepHours: 0.91, restingHeartRate: 58, hrvRmssd: 50, isSleepDeficit: false, triggerDetails: 'Lagging recovery root' },
        ];

        const isRealCalendar = feedSourceName !== 'clinical_benchmark' && verifiedCalendarData?.weeklyTelemetry?.length === 12;

        const generatedTelemetry: WeeklyTelemetry[] = isRealCalendar
          ? defaultTelemetry.map((base, idx) => {
              const synced = verifiedCalendarData.weeklyTelemetry[idx];
              if (!synced) return base;
              const calls = synced.eveningCalls ?? 0;
              const hours = synced.meetingHours ?? 0;
              const flights = synced.flightShifts ?? 0;
              // Biometrics derived strictly from real calendar evening meetings and workload
              const deepSleep = Math.max(0.35, parseFloat((1.45 - calls * 0.10).toFixed(2)));
              const rhr = Math.min(76, Math.round(54 + calls * 1.4));
              const hrv = Math.max(20, Math.round(68 - calls * 3.0));
              const isDeficit = calls >= 3 || deepSleep < 0.8;

              return {
                ...base,
                meetingHours: hours,
                eveningCalls: calls,
                flightShifts: flights,
                deepSleepHours: deepSleep,
                restingHeartRate: rhr,
                hrvRmssd: hrv,
                isSleepDeficit: isDeficit,
                triggerDetails: calls >= 5
                  ? `${calls} late calls past 7 PM (${hours}h schedule)`
                  : calls > 0
                  ? `${calls} evening calls past 7 PM`
                  : hours > 35
                  ? `High daytime schedule (${hours}h)`
                  : 'Standard schedule load',
              };
            })
          : defaultTelemetry;

        // Persist to Supabase, server API, and local storage platform
        saveUserDataToStorage(
          updatedProfile,
          updatedSegments,
          generatedTelemetry,
          icalUrlInput.trim(),
          syncedEvents
        ).catch(err => {
          console.warn('[BAALANCE Wizard] Storage background sync:', err);
        });

        onComplete({
          profile: updatedProfile,
          segments: updatedSegments,
          telemetry: generatedTelemetry,
          calendarIcalUrl: icalUrlInput.trim(),
          calendarEvents: syncedEvents,
        });
      }, 500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] py-5 px-3 sm:px-6 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
          <BaalanceLogo size="sm" showTagline={false} animated={true} />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onStartDemo || onCancel}
              className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Launch the pre-loaded 90-day interactive clinical demo directly"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Open Demo Version</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-[#5F6368] hover:text-black transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              ← Exit
            </button>
          </div>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-xs mb-5">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${currentStep === 1 ? 'border-[#3186FF] bg-blue-50/60 font-bold text-[#3186FF] shadow-2xs' : currentStep > 1 ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50' : 'border-[#E2E8F0] text-slate-400 hover:bg-slate-50'}`}
            >
              <span className="font-mono">1.</span> Lifestyle
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${currentStep === 2 ? 'border-[#3186FF] bg-blue-50/60 font-bold text-[#3186FF] shadow-2xs' : currentStep > 2 ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50' : 'border-[#E2E8F0] text-slate-400 hover:bg-slate-50'}`}
            >
              <span className="font-mono">2.</span> Calendar Integration
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${currentStep === 3 ? 'border-[#3186FF] bg-blue-50/60 font-bold text-[#3186FF] shadow-2xs' : currentStep > 3 ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50' : 'border-[#E2E8F0] text-slate-400 hover:bg-slate-50'}`}
            >
              <span className="font-mono">3.</span> Hair Test (Cortisol)
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${currentStep === 4 ? 'border-[#3186FF] bg-blue-50/60 font-bold text-[#3186FF] shadow-2xs' : 'border-[#E2E8F0] text-slate-400 hover:bg-slate-50'}`}
            >
              <span className="font-mono">4.</span> Synthesis
            </button>
          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7">
          {/* STEP 1: LIFESTYLE STRESS PROFILE */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in font-sans">
              {/* 1. TOP HERO: Full Name Priority, Demographics & Clinical Profile */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/60 border border-[#E2E8F0] shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#3186FF] to-[#6366F1] text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-blue-100">
                      {fullName.trim() ? fullName.trim().charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-black tracking-tight">
                          Demographic & Clinical Baseline
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          CLIA Norms
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                    Step 1 of 4
                  </span>
                </div>

                {/* Primary Field: Full Legal Name */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-7">
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#3186FF]" />
                        <span>Full Legal Name</span>
                        <span className="text-rose-500">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Enter your full legal name"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E2E8F0] bg-white text-black font-semibold focus:ring-2 focus:ring-[#3186FF] focus:outline-none shadow-xs transition-all"
                      />
                    </div>
                  </div>

                  {/* Age Stepper & Biological Sex */}
                  <div className="lg:col-span-5 flex flex-wrap items-center gap-3">
                    {/* Age Stepper with - / + buttons */}
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Age
                      </label>
                      <div className="flex items-center bg-white rounded-xl border border-[#E2E8F0] p-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setAge(Math.max(14, (age || 18) - 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                          title="Decrease age"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex-1 flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min={14}
                            max={99}
                            value={age || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setAge(0);
                              } else {
                                const parsed = parseInt(val, 10);
                                if (!isNaN(parsed)) setAge(parsed);
                              }
                            }}
                            onBlur={() => {
                              if (!age || age < 14) setAge(18);
                              else if (age > 99) setAge(99);
                            }}
                            className="w-10 text-center font-mono font-bold text-xs sm:text-sm text-black bg-slate-50 focus:bg-white border border-transparent focus:border-[#3186FF] rounded py-0.5 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Age"
                            title="Click to type age or use +/- buttons"
                          />
                          <span className="text-[10px] text-slate-400 font-sans font-normal">yrs</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAge(Math.min(99, (age || 18) + 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                          title="Increase age"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Biological Sex Buttons */}
                    <div className="flex-1 min-w-[170px]">
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Biological Sex
                      </label>
                      <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            setBiologicalSex('male');
                            setIsPregnant(false);
                          }}
                          className={`flex-1 py-1.5 rounded-lg transition-all text-xs flex items-center justify-center gap-1 ${
                            biologicalSex === 'male' ? 'bg-white font-bold text-black shadow-xs' : 'text-slate-600 hover:text-black'
                          }`}
                        >
                          <span>Male</span>
                          <span className="text-[11px] text-blue-600">♂</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBiologicalSex('female')}
                          className={`flex-1 py-1.5 rounded-lg transition-all text-xs flex items-center justify-center gap-1 ${
                            biologicalSex === 'female' ? 'bg-white font-bold text-black shadow-xs' : 'text-slate-600 hover:text-black'
                          }`}
                        >
                          <span>Female</span>
                          <span className="text-[11px] text-rose-500">♀</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBiologicalSex('other');
                            setIsPregnant(false);
                          }}
                          className={`py-1.5 px-2 rounded-lg transition-all text-xs ${
                            biologicalSex === 'other' ? 'bg-white font-bold text-black shadow-xs' : 'text-slate-600 hover:text-black'
                          }`}
                        >
                          ⚧
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditional Pregnancy Check for Female */}
                {biologicalSex === 'female' && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/80 to-pink-50/50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-purple-950">
                          Currently pregnant or postpartum (&lt;6 months)?
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsPregnant(true)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isPregnant ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-50'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPregnant(false)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          !isPregnant ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-50'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. JOB ROLE & SECTOR */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#3186FF]" />
                    <span>Professional Role</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {PRESET_ROLES.map(r => {
                    const isSelected = !isCustomRole && selectedRole === r.role;
                    const Icon = r.icon;

                    return (
                      <div
                        key={r.role}
                        onClick={() => {
                          setIsCustomRole(false);
                          setSelectedRole(r.role);
                          setSelectedSector(r.sector);
                        }}
                        className={`cursor-pointer p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between group ${
                          isSelected
                            ? 'border-[#3186FF] bg-blue-50/50 ring-2 ring-[#3186FF]/30 shadow-xs'
                            : 'border-[#E2E8F0] hover:border-slate-300 bg-white hover:shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${r.iconBg} ${r.iconColor} transition-transform group-hover:scale-105`}>
                              <Icon className="w-4 h-4" />
                            </div>

                            {isSelected && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#3186FF] text-white">
                                ✓ Active
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-bold text-black leading-snug">
                            {r.role}
                          </div>
                          <div className="text-[10px] font-semibold text-[#3186FF] mt-0.5">
                            {r.sector}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Role Option */}
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCustomRole(!isCustomRole)}
                    className={`w-full p-2.5 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                      isCustomRole
                        ? 'border-[#3186FF] bg-blue-50/50 text-[#3186FF] font-semibold shadow-2xs'
                        : 'border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-[#3186FF]" />
                      <span>{isCustomRole ? 'Custom Role Selected' : '+ Enter Other Specialized Profession'}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200">
                      {isCustomRole ? 'Active' : 'Custom'}
                    </span>
                  </button>

                  {isCustomRole && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-blue-50/40 rounded-2xl border border-blue-200 animate-fade-in">
                      <input
                        type="text"
                        value={customRole}
                        onChange={e => setCustomRole(e.target.value)}
                        placeholder="Job Title (e.g. Airline Pilot, Architect)"
                        className="w-full p-2 text-xs rounded-xl border border-[#E2E8F0] bg-white font-medium"
                      />
                      <input
                        type="text"
                        value={customSector}
                        onChange={e => setCustomSector(e.target.value)}
                        placeholder="Industry (e.g. Commercial Aviation, Architecture)"
                        className="w-full p-2 text-xs rounded-xl border border-[#E2E8F0] bg-white font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 3. WORKLOAD & CURFEW BOUNDARY VISUALIZER */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                {/* Hours Slider with Dynamic Burnout Risk Meter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-black flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#3186FF]" />
                      <span>Weekly Workload</span>
                    </span>
                    <span className="text-xs font-bold text-black font-mono bg-white px-2.5 py-0.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
                      {weeklyHours} hrs/week
                    </span>
                  </div>

                  <input
                    type="range"
                    min="35"
                    max="95"
                    value={weeklyHours}
                    onChange={e => setWeeklyHours(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#3186FF] bg-slate-200"
                  />

                  {/* Dynamic Risk Pill */}
                  <div className="mt-2.5 p-2 rounded-xl text-[11px] font-semibold flex items-center justify-between border transition-all"
                    style={{
                      backgroundColor: weeklyHours > 60 ? '#FFF1F2' : weeklyHours > 45 ? '#FFFBEB' : '#ECFDF5',
                      borderColor: weeklyHours > 60 ? '#FECDD3' : weeklyHours > 45 ? '#FDE68A' : '#A7F3D0',
                      color: weeklyHours > 60 ? '#BE123C' : weeklyHours > 45 ? '#B45309' : '#047857',
                    }}
                  >
                    <span>
                      {weeklyHours > 60
                        ? '🔴 Heavy Workload Crunch (+78% Stress Increase)'
                        : weeklyHours > 45
                        ? '🟡 Elevated Stress Load (+35% Stress Increase)'
                        : '🟢 Balanced Workload (Normal Baseline)'}
                    </span>
                    <span className="text-[10px] font-mono font-bold">
                      {weeklyHours > 60 ? 'High Risk' : weeklyHours > 45 ? 'Moderate' : 'Optimal'}
                    </span>
                  </div>
                </div>

                {/* Evening Work & International Travel Frequency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Evening Work Boundary */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-black flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Evening Work & Late Calls</span>
                      </span>
                    </div>

                    <select
                      value={workBoundaryBleed}
                      onChange={e => setWorkBoundaryBleed(e.target.value as WorkBoundaryBleed)}
                      className="w-full p-2.5 text-xs rounded-xl border border-[#E2E8F0] bg-white text-black font-semibold shadow-2xs focus:ring-2 focus:ring-[#3186FF] focus:outline-none"
                    >
                      <option value="strict_boundaries">🌅 Stop by 7:00 PM (No late work)</option>
                      <option value="occasional_bleed">🌗 Work until 9:00 PM sometimes</option>
                      <option value="always_on_bed">🌑 Work late into the night / from bed</option>
                    </select>
                  </div>

                  {/* International Travel Frequency */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-black flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-sky-600" />
                        <span>International Travel & Timezones</span>
                      </span>
                    </div>

                    <select
                      value={travelFrequency}
                      onChange={e => setTravelFrequency(e.target.value as TravelFrequency)}
                      className="w-full p-2.5 text-xs rounded-xl border border-[#E2E8F0] bg-white text-black font-semibold shadow-2xs focus:ring-2 focus:ring-[#3186FF] focus:outline-none"
                    >
                      <option value="none_domestic">✈️ None / Domestic travel only</option>
                      <option value="occasional">🌍 Occasional (1–2 trips/year)</option>
                      <option value="frequent_cross_meridian">🛫 Frequent (Monthly flights)</option>
                      <option value="constant_nomad">🌐 Constant / Global nomad</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. SLEEP ARCHITECTURE & NOCTURNAL RECOVERY */}
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-950">
                    <Bed className="w-4 h-4 text-indigo-600" />
                    <span>Sleep Architecture & Nocturnal Recovery</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 font-mono bg-indigo-100/70 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                    Avg: {nightlySleepHours} hrs/night
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">
                      Average Nightly Sleep Duration
                    </label>
                    <input
                      type="range"
                      min="4.0"
                      max="9.5"
                      step="0.5"
                      value={nightlySleepHours}
                      onChange={e => setNightlySleepHours(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-[#5F6368] mt-1 font-medium">
                      <span>4h (Severe debt)</span>
                      <span>6.5h (Baseline)</span>
                      <span>9.5h (Surplus)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">
                      Morning Awakening Sensation
                    </label>
                    <select
                      value={sleepQuality}
                      onChange={e => setSleepQuality(e.target.value as SleepQuality)}
                      className="w-full p-2.5 text-xs rounded-xl border border-[#E2E8F0] bg-white text-black font-semibold shadow-2xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    >
                      <option value="middle_night_awakenings">Frequent 3:00 AM Awakenings (Adrenal Spike)</option>
                      <option value="exhausted_wired">Wake Up "Exhausted & Wired" (High Cortisol)</option>
                      <option value="moderate">Moderate / Fragmented Light Sleep</option>
                      <option value="fully_restored">Deeply Restored & Clear-Headed (NREM 3)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. CHRONOTYPE AFFINITY & FIRST CAFFEINE INGESTION TIMING */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                {/* Chronotype Affinity */}
                <div>
                  <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Chronotype Affinity</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setChronotype('morning_lark')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        chronotype === 'morning_lark'
                          ? 'border-[#3186FF] bg-blue-50/70 text-black font-semibold ring-1 ring-[#3186FF] shadow-2xs'
                          : 'border-[#E2E8F0] bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Sun className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                      <div className="font-semibold text-[11px] leading-tight">Morning Lark</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">06:00–11:00 Peak</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChronotype('night_owl')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        chronotype === 'night_owl'
                          ? 'border-[#3186FF] bg-blue-50/70 text-black font-semibold ring-1 ring-[#3186FF] shadow-2xs'
                          : 'border-[#E2E8F0] bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Moon className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                      <div className="font-semibold text-[11px] leading-tight">Night Owl</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">18:00–23:00 Peak</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChronotype('shift_biphasic')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        chronotype === 'shift_biphasic'
                          ? 'border-[#3186FF] bg-blue-50/70 text-black font-semibold ring-1 ring-[#3186FF] shadow-2xs'
                          : 'border-[#E2E8F0] bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Activity className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                      <div className="font-semibold text-[11px] leading-tight">Shift Worker</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Biphasic / Varied</div>
                    </button>
                  </div>
                </div>

                {/* First Caffeine Ingestion Timing */}
                <div>
                  <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-600" />
                    <span>First Caffeine Ingestion Timing</span>
                  </label>
                  <select
                    value={caffeineHabit}
                    onChange={e => setCaffeineHabit(e.target.value as CaffeineHabit)}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#E2E8F0] bg-white text-black font-semibold shadow-2xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="no_coffee">☕ No coffee / Zero caffeine consumption</option>
                    <option value="immediate_waking">🌅 Within 30m of waking (Blunts adenosine clearance)</option>
                    <option value="delayed_morning">☀️ Delayed 90–120m (Protects natural cortisol curve)</option>
                    <option value="afternoon_excess">🌆 Afternoon / Evening cups (Blocks NREM deep sleep)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Timing of adenosine receptor blockade directly impacts cortisol awakening response (CAR) amplitude.
                  </p>
                </div>
              </div>

              {/* 6. CLINICAL PERCEIVED STRESS RATING & SOMATIC SYMPTOMS */}
              <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-rose-950 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-600" />
                    <span>Perceived Stress Scale (PSS-4 Clinical Severity Gauge)</span>
                  </label>
                  <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-mono border border-rose-200">
                    {perceivedStressRating} / 10 • {perceivedStressRating >= 8 ? 'Severe' : perceivedStressRating >= 6 ? 'High' : 'Moderate'}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={perceivedStressRating}
                  onChange={e => setPerceivedStressRating(Number(e.target.value))}
                  className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[10px] text-rose-800 font-medium">
                  <span>1: Centered & in control</span>
                  <span>5: Moderate baseline strain</span>
                  <span>10: Approaching functional exhaustion</span>
                </div>

                {/* Somatic Manifestations */}
                <div className="pt-2">
                  <span className="block text-xs font-bold text-black mb-2">
                    Active Somatic Stress Manifestations (Select all that apply):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SOMATIC_OPTIONS.map(som => {
                      const isChecked = somaticSymptoms.includes(som.id);
                      return (
                        <button
                          key={som.id}
                          type="button"
                          onClick={() => handleToggleSomatic(som.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                            isChecked
                              ? 'border-rose-300 bg-white text-rose-950 shadow-2xs ring-1 ring-rose-200'
                              : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-xs text-black">{som.label}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{som.note}</div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition-all ${
                              isChecked ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 7. KEY STRESS DRIVERS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Key Stress Drivers</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {STRESS_DRIVER_OPTIONS.map(d => {
                    const isChecked = stressDrivers.includes(d.id);
                    const Icon = d.icon;

                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleToggleStressDriver(d.id)}
                        className={`p-2.5 rounded-2xl border text-left text-xs flex items-center justify-between transition-all group ${
                          isChecked
                            ? 'border-[#3186FF] bg-blue-50/60 font-semibold text-black shadow-2xs'
                            : 'border-[#E2E8F0] hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${d.bg} ${d.iconColor}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{d.label}</span>
                        </div>

                        <div className={`w-4 h-4 rounded-md shrink-0 flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-[#3186FF] text-white border-[#3186FF]'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 8. PRE-EXISTING HEALTH CONDITIONS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    <span>Pre-Existing Health Conditions</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {HEALTH_CONDITION_OPTIONS.map(cond => {
                    const isChecked = healthConditions.includes(cond.id);
                    const Icon = cond.icon;

                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => handleToggleHealthCondition(cond.id)}
                        className={`p-2.5 rounded-2xl border text-left text-xs flex items-center justify-between transition-all group ${
                          isChecked
                            ? cond.id === 'none'
                              ? 'border-emerald-300 bg-emerald-50/70 font-semibold text-emerald-950 shadow-2xs'
                              : 'border-rose-300 bg-rose-50/60 font-semibold text-rose-950 shadow-2xs'
                            : 'border-[#E2E8F0] hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${cond.bg} ${cond.iconColor}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{cond.label}</span>
                        </div>

                        <div className={`w-4 h-4 rounded-md shrink-0 flex items-center justify-center border transition-all ${
                          isChecked
                            ? cond.id === 'none'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-rose-500 text-white border-rose-500'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Other Custom Health Condition */}
                  {healthConditions.filter(c => !HEALTH_CONDITION_OPTIONS.some(opt => opt.id === c)).map(custom => (
                    <div
                      key={custom}
                      className="p-2.5 rounded-2xl border border-rose-300 bg-rose-50/60 text-xs flex items-center justify-between font-semibold text-rose-950"
                    >
                      <span className="truncate pr-1">{custom}</span>
                      <button
                        type="button"
                        onClick={() => setHealthConditions(prev => prev.filter(c => c !== custom))}
                        className="text-rose-600 hover:text-rose-800 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-2">
                  {!showCustomHealthInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomHealthInput(true)}
                      className="text-[11px] text-[#3186FF] hover:underline font-semibold flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Add other medical condition</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 mt-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        value={customHealthCondition}
                        onChange={e => setCustomHealthCondition(e.target.value)}
                        placeholder="e.g. Chronic Fatigue Syndrome, Fibromyalgia"
                        className="flex-1 p-1.5 text-xs rounded-lg border border-[#E2E8F0] bg-white"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomHealthCondition();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomHealthCondition}
                        className="px-3 py-1.5 rounded-lg bg-[#3186FF] text-white text-xs font-bold shrink-0"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCustomHealthInput(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 9. CURRENT MEDICATIONS WITH PILL LOGOS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-purple-600" />
                    <span>Current Medications</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MEDICATION_OPTIONS.map(med => {
                    const isChecked = medications.includes(med.id);
                    const Icon = med.icon;

                    return (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => handleToggleMedication(med.id)}
                        className={`p-2.5 rounded-2xl border text-left text-xs flex items-center justify-between transition-all group ${
                          isChecked
                            ? med.id === 'none'
                              ? 'border-emerald-300 bg-emerald-50/70 font-semibold text-emerald-950 shadow-2xs'
                              : 'border-purple-300 bg-purple-50/60 font-semibold text-purple-950 shadow-2xs'
                            : 'border-[#E2E8F0] hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${med.bg} ${med.iconColor}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{med.label}</span>
                        </div>

                        <div className={`w-4 h-4 rounded-md shrink-0 flex items-center justify-center border transition-all ${
                          isChecked
                            ? med.id === 'none'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-purple-600 text-white border-purple-600'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Other Custom Medication */}
                  {medications.filter(m => !MEDICATION_OPTIONS.some(opt => opt.id === m)).map(custom => (
                    <div
                      key={custom}
                      className="p-2.5 rounded-2xl border border-purple-300 bg-purple-50/60 text-xs flex items-center justify-between font-semibold text-purple-950"
                    >
                      <span className="truncate pr-1">{custom}</span>
                      <button
                        type="button"
                        onClick={() => setMedications(prev => prev.filter(m => m !== custom))}
                        className="text-purple-600 hover:text-purple-800 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-2">
                  {!showCustomMedInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomMedInput(true)}
                      className="text-[11px] text-[#3186FF] hover:underline font-semibold flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Add other medication</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 mt-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        value={customMedication}
                        onChange={e => setCustomMedication(e.target.value)}
                        placeholder="e.g. Bupropion, Statins, Hydrocortisone"
                        className="flex-1 p-1.5 text-xs rounded-lg border border-[#E2E8F0] bg-white"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomMedication();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomMedication}
                        className="px-3 py-1.5 rounded-lg bg-[#3186FF] text-white text-xs font-bold shrink-0"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCustomMedInput(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 7. LIVE ENDOCRINE CALIBRATION SUMMARY BADGE */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-black">{fullName || 'User'}</span>
                    {' • '}
                    <span className="font-medium">{age}y {biologicalSex === 'female' ? (isPregnant ? '♀ (Pregnant)' : '♀') : biologicalSex === 'male' ? '♂' : '⚧'}</span>
                    {' • '}
                    <span className="font-medium text-[#3186FF]">{isCustomRole ? customRole || 'Custom Role' : selectedRole}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    CLIA Baseline: ~11.0 pg/mg
                  </span>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span>Continue to Calendar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GOOGLE CALENDAR INTEGRATION */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
                <div>
                  <h3 className="text-sm font-bold text-black flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#3186FF]" />
                    <span>Google Calendar Integration</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Connect your schedule to correlate weekly meeting load and evening calls past 7:00 PM with your cortisol segments.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isCalendarConnected ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Calendar Linked ({syncedEvents.length > 0 ? `${syncedEvents.length} Events` : 'Active'})</span>
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                      Optional: Link calendar or use demo data
                    </span>
                  )}
                </div>
              </div>

              {/* Option 1: Direct .ics Upload (100% Reliable for Personal & Institutional accounts) */}
              <div className={`p-4 rounded-2xl border-2 border-dashed transition-all space-y-2 ${
                feedSourceName === 'imported_file' && isCalendarConnected
                  ? 'border-emerald-400 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-blue-400 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3186FF]">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-black block">
                        Upload .ics Calendar File
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Settings ⚙️ &gt; Import &amp; export &gt; Export. Works with all accounts (@aiims.edu, Gmail, etc.)
                      </span>
                    </div>
                  </div>

                  <label className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all shrink-0">
                    <span>{feedSourceName === 'imported_file' && isCalendarConnected ? 'Replace .ics' : 'Browse File'}</span>
                    <input
                      type="file"
                      accept=".ics,text/calendar"
                      onChange={handleIcsFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Option 2: Live Secret iCal Sync */}
              <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                feedSourceName === 'real_ical' && isCalendarConnected
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-white border-[#E2E8F0]'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#3186FF]" />
                    <span className="text-xs font-bold text-black">Live Secret iCal Link</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Instructions Button to Help Find Secret iCal URL */}
                    <button
                      type="button"
                      onClick={() => setShowSecretIcalInstructions(!showSecretIcalInstructions)}
                      className="text-xs px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#3186FF] font-bold border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showSecretIcalInstructions ? 'Hide Instructions' : 'Instructions: Where to find URL?'}</span>
                    </button>

                    <a
                      href="https://calendar.google.com/calendar/u/0/r/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#3186FF] hover:underline"
                    >
                      Google Settings ↗
                    </a>
                  </div>
                </div>

                {/* Step-by-Step Instructions Card for Secret Google Calendar URL */}
                {showSecretIcalInstructions && (
                  <div className="p-3.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 rounded-2xl border border-blue-200 text-xs text-slate-700 space-y-2.5 animate-fade-in shadow-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 border-b border-blue-200/60 pb-1.5">
                      <span className="flex items-center gap-1.5 text-blue-900">
                        <HelpCircle className="w-4 h-4 text-[#3186FF]" />
                        <span>Step-by-Step: Where to find your Secret Google Calendar URL</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSecretIcalInstructions(false)}
                        className="text-slate-400 hover:text-black font-bold px-1.5 py-0.5 rounded-md hover:bg-white/60 transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-700 leading-relaxed font-sans">
                      <li>Open Google Calendar in your desktop web browser (<a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">calendar.google.com</a>).</li>
                      <li>In the left sidebar under <strong>"My calendars"</strong>, find your main calendar, hover over it, click the <strong>3 vertical dots (⋮)</strong>, and select <strong>Settings and sharing</strong>.</li>
                      <li>In the left settings navigation bar, scroll down and click <strong>"Integrate calendar"</strong>.</li>
                      <li>Locate the section labeled <strong>"Secret address in iCal format"</strong>. <em>(Important: Do not use the Public URL)</em>.</li>
                      <li>Click the <strong>Copy icon</strong> to copy your secret URL (it ends in <code>/basic.ics</code>) and paste it into the input box below.</li>
                    </ol>

                    <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-t border-blue-200/60 text-[10px]">
                      <span className="text-emerald-800 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Your secret link is masked, encrypted, and stored locally for live real-time sync.</span>
                      </span>
                      <a
                        href="https://calendar.google.com/calendar/u/0/r/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3186FF] font-bold hover:underline self-end sm:self-auto"
                      >
                        Open Calendar Settings ↗
                      </a>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSyncIcalUrl} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={icalUrlInput}
                    onChange={e => setIcalUrlInput(e.target.value)}
                    placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#3186FF]"
                  />
                  <button
                    type="submit"
                    disabled={isConnectingCalendar || !icalUrlInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#3186FF] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    {isConnectingCalendar ? 'Syncing...' : 'Sync'}
                  </button>
                </form>

                {icalUrlInput.trim().includes('@') && !icalUrlInput.trim().startsWith('http') && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    You typed an email. Live sync requires the full "Secret address in iCal format" from Google Calendar Settings, or click <strong>Browse File</strong> above to import your .ics file directly.
                  </p>
                )}

                {calendarError && (
                  <p className="text-xs text-rose-600 font-medium">{calendarError}</p>
                )}
              </div>

              {/* Option 3: Use Demo Calendar Data */}
              <div className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                feedSourceName === 'clinical_benchmark' && isCalendarConnected
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-slate-50/50 border-[#E2E8F0]'
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Use Demo Calendar Data</span>
                    <span className="text-[10px] text-slate-500">Pre-loaded 90-day clinical schedule (148 meetings, 23 evening calls, 4 flights)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleLoadDemoData}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      feedSourceName === 'clinical_benchmark' && isCalendarConnected
                        ? 'bg-emerald-600 text-white border border-emerald-600 shadow-xs'
                        : 'border border-[#3186FF] bg-blue-50 hover:bg-blue-100 text-[#3186FF]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{feedSourceName === 'clinical_benchmark' && isCalendarConnected ? 'Demo Calendar Ingested ✓' : 'Use Demo Calendar Data'}</span>
                  </button>
                </div>
              </div>

              {/* Connected Telemetry Summary */}
              {isCalendarConnected && (
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        {feedSourceName === 'clinical_benchmark'
                          ? 'Demo Benchmark Ingested'
                          : 'Calendar Ingested (Live Insights)'}
                      </span>
                    </span>
                    <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                      {feedSourceName === 'clinical_benchmark' ? 'Demo Telemetry' : 'Live Synced • Your Calendar Only'}
                    </span>
                  </div>

                  {/* 3 Core Metric Cards */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">Total Meetings</div>
                      <div className="text-base font-bold text-black font-mono mt-0.5">{calendarStats.totalEvents}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5 font-medium">~{calendarStats.avgMeetingDurationMins}m / event</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                      <div className="text-[10px] text-rose-700 font-medium">Post-7 PM Calls</div>
                      <div className="text-base font-bold text-rose-700 font-mono mt-0.5">{calendarStats.eveningCalls}</div>
                      <div className="text-[9px] text-rose-600 mt-0.5 font-semibold">{calendarStats.curfewBreachPct}% of schedule</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">
                        {calendarStats.flights > 0 ? 'Timezone Flights' : 'Scheduled Load'}
                      </div>
                      <div className="text-base font-bold text-black font-mono mt-0.5">
                        {calendarStats.flights > 0 ? `${calendarStats.flights}` : `${calendarStats.totalMeetingHours} hrs`}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 font-medium">
                        {calendarStats.flights > 0 ? 'Travel shifts' : '90-day workload'}
                      </div>
                    </div>
                  </div>

                  {/* Calendar Chrono-Insights Derived Exclusively From User's Events */}
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-[#3186FF]" />
                      <span>Chrono-Insights Extracted From Your Calendar</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-blue-100/60 shadow-2xs">
                        <Moon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900">Late Curfew Strain:</strong> {calendarStats.eveningCalls} calls scheduled past 7:00 PM ({calendarStats.curfewBreachPct}% of events), typically spanning {calendarStats.avgLateTimeRange}. Peak late load: {calendarStats.peakLateDay}s.
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-blue-100/60 shadow-2xs">
                        <Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900">Schedule Density:</strong> Heaviest meeting load on {calendarStats.busiestDay}s. {calendarStats.flights > 0 ? `${calendarStats.flights} travel/flight shifts detected.` : 'Zero timezone travel shifts detected (localized schedule).'}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-blue-950 font-medium bg-blue-100/50 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                      <span>✓ All synthesis insights and recovery protocols will model strictly from this calendar stream.</span>
                      <span className="font-mono text-[9px] text-blue-800">Permanent Link Active</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isCalendarConnected) {
                      handleLoadDemoData();
                    }
                    setCurrentStep(3);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>Continue to Hair Specimen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SPECIMEN & ELISA LAB REPORT UPLOAD */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-black">Step 3: Hair Specimen & Cortisol Test (ELISA)</h3>

              {/* Ingestion Options */}
              <div className="space-y-2.5">
                {/* Hidden Real PDF File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="application/pdf,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    // Reset input value so re-selecting same file triggers onChange
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                {/* Option 1: Functional Upload Zone with Drag & Drop */}
                <div
                  onClick={() => !isExtractingPdf && fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isDraggingFile
                      ? 'border-[#3186FF] bg-blue-100/50 scale-[1.01]'
                      : uploadedFileName && labDataSource === 'uploaded'
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : labUploadError
                      ? 'border-rose-300 hover:border-rose-400 bg-rose-50/20'
                      : 'border-[#3186FF]/40 hover:border-[#3186FF] bg-blue-50/20'
                  }`}
                >
                  {isExtractingPdf ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Sparkles className="w-6 h-6 text-[#3186FF] animate-spin" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 block">
                          {labExtractionStatus || 'Gemini AI Scanning Document...'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Extracting 90-day micro-spectrometry & ELISA assay data...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        uploadedFileName && labDataSource === 'uploaded'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100/70 text-[#3186FF]'
                      }`}>
                        {uploadedFileName && labDataSource === 'uploaded' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-black">
                        {uploadedFileName && labDataSource === 'uploaded'
                          ? uploadedFileName
                          : 'Option 1: Upload Hair Cortisol Test Report PDF'}
                      </span>
                      <span className="text-[10px] text-[#5F6368] max-w-xs">
                        {uploadedFileName && labDataSource === 'uploaded'
                          ? '✓ Verified Hair Cortisol ELISA Report (Click to re-upload another PDF)'
                          : 'Click to select or drag & drop laboratory PDF report (Gemini AI will scan & verify)'}
                      </span>
                    </>
                  )}
                </div>

                {/* Gemini Rejection Error Alert Banner */}
                {labUploadError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2.5 animate-fade-in shadow-2xs">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                          <span>Not a Hair Cortisol ELISA Report</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-rose-200/60 text-rose-900 rounded">Verification Failed</span>
                        </div>
                        <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                          {labUploadError}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/70">
                      <button
                        type="button"
                        onClick={() => {
                          handleLoadDemoLabData();
                          setLabUploadError('');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Try Demo Data Instead</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-100/50 text-rose-800 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Choose Another PDF
                      </button>
                    </div>
                  </div>
                )}

                {/* Option 2: Use Demo Data */}
                <div className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  hasLoadedLabData && labDataSource === 'demo'
                    ? 'bg-emerald-50/40 border-emerald-300'
                    : 'bg-slate-50/50 border-[#E2E8F0]'
                }`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Option 2: Use Demo Data</span>
                      <span className="text-[10px] text-slate-500">Pre-load 90-day clinical ELISA benchmark (Jul: 11.2, Aug: 28.4, Sep: 15.6 pg/mg)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handleLoadDemoLabData}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        hasLoadedLabData && labDataSource === 'demo'
                          ? 'bg-emerald-600 text-white border border-emerald-600 shadow-xs'
                          : 'border border-[#3186FF] bg-blue-50 hover:bg-blue-100 text-[#3186FF]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{hasLoadedLabData && labDataSource === 'demo' ? 'Demo Lab Data Ingested ✓' : 'Use Demo Data'}</span>
                    </button>
                  </div>
                </div>

                {/* Manual entry fallback prompt if data not yet loaded */}
                {!hasLoadedLabData && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setHasLoadedLabData(true);
                        setLabDataSource('manual');
                      }}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Or enter cortisol values manually →
                    </button>
                  </div>
                )}
              </div>

              {/* 3 Month-Wise Cortisol Segments - ONLY SHOWN WHEN DEMO DATA IS LOADED OR REPORT IS UPLOADED/ENTERED */}
              {hasLoadedLabData && (
                <div className="space-y-2 pt-1 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        3-Month Cortisol Segments ({labDataSource === 'demo' ? 'Demo Benchmark' : labDataSource === 'uploaded' ? 'Extracted from PDF' : 'Manual Entry'})
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      1 cm hair ≈ 30 days retrospective
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                      <div className="text-[10px] text-slate-500 font-medium">Tip (2–3cm • Jul)</div>
                      <input
                        type="number"
                        step="0.1"
                        value={m1Value}
                        onChange={e => setM1Value(parseFloat(e.target.value) || 0)}
                        className="w-16 mx-auto p-1 text-xs font-bold text-center rounded border bg-white font-mono mt-1 text-slate-800"
                      />
                      <span className="text-[10px] text-slate-500 block mt-0.5">pg/mg</span>
                      <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">Baseline</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/40">
                      <div className="text-[10px] text-rose-700 font-medium">Mid (1–2cm • Aug)</div>
                      <input
                        type="number"
                        step="0.1"
                        value={m2Value}
                        onChange={e => setM2Value(parseFloat(e.target.value) || 0)}
                        className="w-16 mx-auto p-1 text-xs font-bold text-center rounded border border-rose-300 bg-white font-mono text-rose-700 mt-1"
                      />
                      <span className="text-[10px] text-rose-500 block mt-0.5">pg/mg</span>
                      <span className="text-[9px] text-rose-600 font-semibold block mt-0.5">Acute Surge (2.6x)</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/40">
                      <div className="text-[10px] text-amber-700 font-medium">Root (0–1cm • Sep)</div>
                      <input
                        type="number"
                        step="0.1"
                        value={m3Value}
                        onChange={e => setM3Value(parseFloat(e.target.value) || 0)}
                        className="w-16 mx-auto p-1 text-xs font-bold text-center rounded border border-amber-300 bg-white font-mono text-amber-700 mt-1"
                      />
                      <span className="text-[10px] text-amber-500 block mt-0.5">pg/mg</span>
                      <span className="text-[9px] text-amber-600 font-semibold block mt-0.5">Recovery Lag</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-[#5F6368] hover:text-black flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerSynthesis}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#3186FF] via-[#6366F1] to-[#FB7185] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Gemini Synthesis</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: GEMINI SYNTHESIS ANIMATION */}
          {currentStep === 4 && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3186FF] via-[#6366F1] to-[#FB7185] flex items-center justify-center shadow-md">
                <Sparkles className="w-7 h-7 text-white animate-spin" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-black">Gemini Biomedical Synthesis</h3>
                <span className="text-xs font-mono font-semibold text-[#3186FF]">{synthesisProgress}%</span>
              </div>

              <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-[#3186FF] via-[#6366F1] to-[#FB7185] transition-all duration-300"
                  style={{ width: `${synthesisProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
