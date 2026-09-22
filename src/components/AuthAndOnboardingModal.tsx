'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Check,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Clock,
  Moon,
  Sun,
  Briefcase,
  Zap,
  Shield,
  Coffee,
  HeartPulse,
  Flame,
  AlertTriangle,
  PlusCircle,
  Activity,
  Bed,
  Layers,
  User,
  Pill,
  Eye,
  EyeOff,
  Plane,
} from 'lucide-react';

const HEALTH_CONDITION_OPTIONS = [
  { id: 'hypertension_cvd', label: 'Hypertension / Cardiovascular Disease' },
  { id: 'diabetes_metabolic', label: 'Type 2 Diabetes / Metabolic Strain' },
  { id: 'migraines_headaches', label: 'Chronic Migraines / Tension Headaches' },
  { id: 'ibs_gut_friction', label: 'IBS / Gastrointestinal Reflux (GERD)' },
  { id: 'autoimmune_disease', label: 'Autoimmune (Hashimoto’s, Alopecia, Psoriasis)' },
  { id: 'clinical_anxiety_depression', label: 'Clinical Anxiety / Major Depression' },
  { id: 'none', label: 'None (No diagnosed chronic conditions)' },
];

const MEDICATION_OPTIONS = [
  { id: 'beta_blockers', label: 'Beta Blockers (Propranolol, Metoprolol)' },
  { id: 'ssri_snri', label: 'SSRIs / SNRIs (Sertraline, Lexapro)' },
  { id: 'corticosteroids', label: 'Corticosteroids (Prednisone, Inhalers, Creams)' },
  { id: 'thyroid_replacement', label: 'Thyroid Replacement (Levothyroxine)' },
  { id: 'adhd_stimulants', label: 'ADHD Stimulants (Adderall, Vyvanse)' },
  { id: 'sleep_aids_sedatives', label: 'Sleep Aids / Melatonin / Sedatives' },
  { id: 'none', label: 'None (No daily prescriptions)' },
];
import {
  UserProfile,
  Chronotype,
  StressDriver,
  SleepQuality,
  WorkBoundaryBleed,
  TravelFrequency,
  CaffeineHabit,
  SomaticSymptom,
} from '@/lib/types';
import { BaalanceLogo } from './BaalanceLogo';

interface AuthAndOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  initialStep?: 'auth' | 'questionnaire';
}

const PRESET_ROLES = [
  { role: 'Tech Founder & AI Lead', sector: 'Artificial Intelligence & Software' },
  { role: 'Resident Physician & Surgeon', sector: 'Acute Healthcare & Hospital' },
  { role: 'Investment Banking / PE Analyst', sector: 'Capital Markets & M&A' },
  { role: 'Staff Infrastructure Engineer', sector: 'Cloud Platforms & SRE' },
  { role: 'Corporate Attorney & Litigator', sector: 'Corporate Law & Trial Practice' },
  { role: 'Management Consultant & Partner', sector: 'Corporate Strategy' },
  { role: 'Creative Director & Brand Lead', sector: 'Design & Digital Media' },
  { role: 'Quantitative Trader & Hedge Fund PM', sector: 'Quantitative Finance' },
  { role: 'Clinical Nurse / Emergency Specialist', sector: 'Intensive Care & Emergency' },
  { role: 'University Academic & Researcher', sector: 'Higher Education & Research' },
];

const STRESS_DRIVER_OPTIONS: { id: StressDriver; label: string; description: string }[] = [
  { id: 'evening_meetings', label: 'Late Evening Meetings', description: 'Calls or work past 7 PM that prevent winding down' },
  { id: 'cross_timezone_flights', label: 'Long Flights & Travel', description: 'Long-distance travel disrupting your natural sleep cycle' },
  { id: 'heavy_deadlines', label: 'High Workload & Deadlines', description: 'Prolonged intense focus causing elevated stress spikes' },
  { id: 'sleep_debt', label: 'Short Sleep (<6.5 hrs)', description: 'Lack of restorative sleep preventing biological reset' },
  { id: 'stakeholder_board_pressure', label: 'Boss, Client or Exam Pressure', description: 'High-stakes performance and evaluation demands' },
  { id: 'on_call_pager_duty', label: 'Always On-Call / Night Alerts', description: 'Interrupted sleep due to urgent notifications' },
  { id: 'caregiver_family_strain', label: 'Family & Home Demands', description: 'Balancing personal duties with professional pressure' },
  { id: 'financial_runway_anxiety', label: 'Financial or Project Stress', description: 'Uncertainty over business, budget, or personal finances' },
  { id: 'high_glycemic_irregular_meals', label: 'Skipping Meals & Irregular Food', description: 'Blood sugar volatility triggering adrenaline and stress' },
];

const SOMATIC_OPTIONS: { id: SomaticSymptom; label: string; note: string }[] = [
  { id: 'brain_fog', label: 'Brain Fog & Executive Fatigue', note: 'Delayed cognitive retrieval' },
  { id: 'tension_headaches', label: 'Tension Headaches & Neck Rigidity', note: 'Persistent muscular contraction' },
  { id: 'heart_palpitations', label: 'Heart Palpitations & Restless Pulse', note: 'Elevated sympathetic tone' },
  { id: 'gi_gut_friction', label: 'GI Friction & Acid Reflux', note: 'Cortisol-mediated gut barrier shifts' },
];

export const AuthAndOnboardingModal: React.FC<AuthAndOnboardingModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  initialStep = 'questionnaire',
}) => {
  const [step, setStep] = useState<'auth' | 'questionnaire'>(initialStep);
  const [email, setEmail] = useState(userProfile.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Role states
  const [isCustomRole, setIsCustomRole] = useState(
    userProfile.isCustomRole || !PRESET_ROLES.some(r => r.role === userProfile.role)
  );
  const [selectedRole, setSelectedRole] = useState(userProfile.role);
  const [selectedSector, setSelectedSector] = useState(userProfile.sector);
  const [customRoleInput, setCustomRoleInput] = useState(
    !PRESET_ROLES.some(r => r.role === userProfile.role) ? userProfile.role : ''
  );
  const [customSectorInput, setCustomSectorInput] = useState(
    !PRESET_ROLES.some(r => r.role === userProfile.role) ? userProfile.sector : ''
  );

  // Deeper stress parameters
  const [weeklyHours, setWeeklyHours] = useState(userProfile.weeklyHours || 65);
  const [chronotype, setChronotype] = useState<Chronotype>(userProfile.chronotype || 'morning_lark');
  const [nightlySleepHours, setNightlySleepHours] = useState(userProfile.nightlySleepHours || 6.0);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>(userProfile.sleepQuality || 'middle_night_awakenings');
  const [workBoundaryBleed, setWorkBoundaryBleed] = useState<WorkBoundaryBleed>(userProfile.workBoundaryBleed || 'always_on_bed');
  const [travelFrequency, setTravelFrequency] = useState<TravelFrequency>(userProfile.travelFrequency || 'occasional');
  const [caffeineHabit, setCaffeineHabit] = useState<CaffeineHabit>(userProfile.caffeineHabit || 'immediate_waking');
  const [somaticSymptoms, setSomaticSymptoms] = useState<SomaticSymptom[]>(userProfile.somaticSymptoms || ['brain_fog']);
  const [perceivedStressRating, setPerceivedStressRating] = useState<number>(userProfile.perceivedStressRating || 7);
  const [stressDrivers, setStressDrivers] = useState<StressDriver[]>(userProfile.stressDrivers || ['evening_meetings', 'sleep_debt']);

  // Demographic baseline
  const [fullName, setFullName] = useState<string>(userProfile.name || '');
  const [age, setAge] = useState<number>(userProfile.age || 32);
  const [biologicalSex, setBiologicalSex] = useState<'male' | 'female' | 'other'>(userProfile.biologicalSex || 'male');
  const [isPregnant, setIsPregnant] = useState<boolean>(userProfile.isPregnant || false);

  // Pre-existing Health Conditions
  const [healthConditions, setHealthConditions] = useState<string[]>(userProfile.healthConditions || ['none']);
  const [customHealthCondition, setCustomHealthCondition] = useState('');
  const [showCustomHealthInput, setShowCustomHealthInput] = useState(false);

  // Current Medications
  const [medications, setMedications] = useState<string[]>(userProfile.medications || ['none']);
  const [customMedication, setCustomMedication] = useState('');
  const [showCustomMedInput, setShowCustomMedInput] = useState(false);
  // Synchronize state whenever modal opens or userProfile updates
  useEffect(() => {
    if (isOpen) {
      setFullName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setAge(userProfile.age || 32);
      setBiologicalSex(userProfile.biologicalSex || 'male');
      setIsPregnant(userProfile.isPregnant || false);
      setSelectedRole(userProfile.role);
      setSelectedSector(userProfile.sector);
      const isPreset = PRESET_ROLES.some(r => r.role === userProfile.role);
      setIsCustomRole(userProfile.isCustomRole || !isPreset);
      setCustomRoleInput(!isPreset ? userProfile.role : '');
      setCustomSectorInput(!isPreset ? userProfile.sector : '');
      setWeeklyHours(userProfile.weeklyHours || 65);
      setChronotype(userProfile.chronotype || 'morning_lark');
      setNightlySleepHours(userProfile.nightlySleepHours || 6.0);
      setSleepQuality(userProfile.sleepQuality || 'middle_night_awakenings');
      setWorkBoundaryBleed(userProfile.workBoundaryBleed || 'always_on_bed');
      setTravelFrequency(userProfile.travelFrequency || 'occasional');
      setCaffeineHabit(userProfile.caffeineHabit || 'immediate_waking');
      setSomaticSymptoms(userProfile.somaticSymptoms || ['brain_fog']);
      setPerceivedStressRating(userProfile.perceivedStressRating || 7);
      setStressDrivers(userProfile.stressDrivers || ['evening_meetings', 'sleep_debt']);
      setHealthConditions(userProfile.healthConditions || ['none']);
      setMedications(userProfile.medications || ['none']);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleToggleStressDriver = (driver: StressDriver) => {
    if (stressDrivers.includes(driver)) {
      setStressDrivers(stressDrivers.filter(d => d !== driver));
    } else {
      setStressDrivers([...stressDrivers, driver]);
    }
  };

  const handleToggleSomatic = (symptom: SomaticSymptom) => {
    if (somaticSymptoms.includes(symptom)) {
      setSomaticSymptoms(somaticSymptoms.filter(s => s !== symptom));
    } else {
      setSomaticSymptoms([...somaticSymptoms, symptom]);
    }
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

  const handleSelectPresetRole = (role: string, sector: string) => {
    setIsCustomRole(false);
    setSelectedRole(role);
    setSelectedSector(sector);
  };

  const handleQuickDemoBypass = () => {
    onSaveProfile({
      ...userProfile,
      email: 'elena.rostova@gemini-biomed.ai',
      role: 'Tech Founder & AI Research Lead',
      sector: 'Artificial Intelligence & Biotech',
      isCustomRole: false,
      age: 32,
      biologicalSex: 'female',
      isPregnant: false,
      healthConditions: ['none'],
      medications: ['none'],
      weeklyHours: 68,
      chronotype: 'morning_lark',
      nightlySleepHours: 5.8,
      sleepQuality: 'middle_night_awakenings',
      workBoundaryBleed: 'always_on_bed',
      caffeineHabit: 'immediate_waking',
      somaticSymptoms: ['brain_fog', 'tension_headaches'],
      stressDrivers: ['evening_meetings', 'cross_timezone_flights', 'sleep_debt', 'stakeholder_board_pressure'],
      perceivedStressRating: 8,
      isDemo: true,
    });
    onClose();
  };

  const handleSaveQuestionnaire = () => {
    const finalRole = isCustomRole ? (customRoleInput.trim() || 'Custom Professional') : selectedRole;
    const finalSector = isCustomRole ? (customSectorInput.trim() || 'Specialized Industry') : selectedSector;

    onSaveProfile({
      ...userProfile,
      name: fullName.trim() || userProfile.name,
      email,
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
      somaticSymptoms,
      stressDrivers,
      perceivedStressRating,
    });
    onClose();
  };

  // Calculate a live estimated baseline strain score right in the modal
  const liveEstimatedStrain = Math.min(
    Math.round(
      20 +
      (weeklyHours > 60 ? (weeklyHours - 60) * 0.8 : 0) +
      (nightlySleepHours < 7 ? (7 - nightlySleepHours) * 6 : 0) +
      (sleepQuality === 'exhausted_wired' ? 12 : sleepQuality === 'middle_night_awakenings' ? 9 : 3) +
      (workBoundaryBleed === 'always_on_bed' ? 10 : workBoundaryBleed === 'occasional_bleed' ? 4 : 0) +
      (caffeineHabit === 'immediate_waking' ? 4 : caffeineHabit === 'afternoon_excess' ? 5 : caffeineHabit === 'no_coffee' ? -2 : 0) +
      somaticSymptoms.length * 3 +
      stressDrivers.length * 2.5 +
      perceivedStressRating * 2.5
    ),
    98
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Baalance Logo and Tagline */}
        <div className="p-5 bg-[#F0F4FA] border-b border-[#E2E8F0] flex flex-col items-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-white text-[#5F6368] hover:text-[#000000] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <BaalanceLogo size="md" showTagline={true} animated={true} />

          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[#5F6368]">
              {step === 'auth'
                ? 'Clinical Specimen Authentication'
                : 'Profile & Lifestyle Baseline Settings'}
            </span>

            {step === 'questionnaire' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#3186FF] border border-blue-200">
                <Activity className="w-3 h-3" />
                Est. Strain: {liveEstimatedStrain}/100
              </span>
            )}
          </div>
        </div>

        {/* Modal Body with smooth scrolling */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {step === 'auth' ? (
            <div className="space-y-4">
              {/* Quick Demo Mode Pill Button */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3186FF]">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Evaluation Bypass Available</span>
                  </div>
                  <p className="text-[11px] text-[#5F6368]">
                    Auto-load sample profile (Dr. Elena Rostova, 68h/wk, Surge Case)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoBypass}
                  className="px-3 py-1.5 rounded-lg bg-[#3186FF] text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                >
                  Quick Demo Mode
                </button>
              </div>


              {/* Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#000000] mb-1">Clinic / Researcher Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#5F6368] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#3186FF] text-[#000000]"
                      placeholder="name@institution.edu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#000000] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5F6368] absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#3186FF] text-[#000000]"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('questionnaire')}
                  className="w-full py-2.5 rounded-xl bg-[#3186FF] text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Sign In & Calibrate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* DEMOGRAPHIC BASELINE */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/50 border border-[#E2E8F0] space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-black flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#3186FF]" />
                      <span>Demographic Baseline & Identity</span>
                    </h3>
                    <p className="text-[10px] text-[#5F6368] mt-0.5">
                      Calibrates reference cortisol baselines and healthy recovery thresholds.
                    </p>
                  </div>
                </div>

                {/* 1. Full Legal Name (Top Priority before Age & Sex) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative max-w-md">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Enter your full legal name"
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E2E8F0] bg-white text-black font-semibold focus:ring-2 focus:ring-[#3186FF] focus:outline-none shadow-xs"
                    />
                  </div>
                </div>

                {/* 2. Age & Biological Sex Controls */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#E2E8F0] shadow-xs">
                    <span className="text-[11px] font-bold text-slate-700">Age:</span>
                    <input
                      type="number"
                      min="18"
                      max="85"
                      value={age}
                      onChange={e => setAge(Math.max(18, Math.min(85, Number(e.target.value) || 18)))}
                      className="w-12 text-xs font-bold font-mono text-black focus:outline-none bg-transparent"
                    />
                    <span className="text-[10px] text-slate-400">yrs</span>
                  </div>

                  <div className="flex items-center p-0.5 rounded-xl bg-slate-200/70 border border-slate-300/60 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setBiologicalSex('male');
                        setIsPregnant(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                        biologicalSex === 'male' ? 'bg-white font-bold text-black shadow-xs' : 'text-slate-600 hover:text-black'
                      }`}
                    >
                      Male ♂
                    </button>
                    <button
                      type="button"
                      onClick={() => setBiologicalSex('female')}
                      className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                        biologicalSex === 'female' ? 'bg-white font-bold text-black shadow-xs' : 'text-slate-600 hover:text-black'
                      }`}
                    >
                      Female ♀
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBiologicalSex('other');
                        setIsPregnant(false);
                      }}
                      className={`px-2 py-1 rounded-lg transition-all text-xs ${
                        biologicalSex === 'other' ? 'bg-white font-bold text-black shadow-xs' : 'text-slate-600 hover:text-black'
                      }`}
                    >
                      Other
                    </button>
                  </div>
                </div>

                {/* Conditional Pregnancy Check for Female */}
                {biologicalSex === 'female' && (
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fade-in">
                    <div>
                      <span className="text-xs font-bold text-purple-950">
                        Are you currently pregnant or postpartum (&lt;6 months)?
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsPregnant(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isPregnant ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-purple-900 border border-purple-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPregnant(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          !isPregnant ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-purple-900 border border-purple-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 1: JOB ROLE & INDUSTRY SECTOR (PRESETS + CUSTOM ROLE) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#000000] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-[#3186FF]" />
                    <span>Job Role & Sector Specialization</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 pr-1.5 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                  {PRESET_ROLES.map(item => {
                    const isSelected = !isCustomRole && selectedRole === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleSelectPresetRole(item.role, item.sector)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'border-[#3186FF] bg-blue-50/70 text-[#000000] ring-1 ring-[#3186FF] font-semibold'
                            : 'border-[#E2E8F0] bg-white text-[#5F6368] hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-[#000000] truncate">{item.role}</div>
                        <div className="text-[10px] text-[#5F6368] mt-0.5 truncate">{item.sector}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom / Other Role Button & Drawer */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCustomRole(!isCustomRole)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isCustomRole
                        ? 'border-[#3186FF] bg-blue-50/50 text-[#3186FF] font-semibold'
                        : 'border-dashed border-slate-300 bg-white text-[#5F6368] hover:border-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4" />
                      <span>{isCustomRole ? 'Custom Role Mode Active' : '+ Enter Custom Job / Other Sector'}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {isCustomRole ? 'Active' : 'Custom'}
                    </span>
                  </button>

                  {isCustomRole && (
                    <div className="mt-2.5 p-3 rounded-xl bg-blue-50/30 border border-blue-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fade-in">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#000000] mb-1">
                          Custom Job Title / Profession
                        </label>
                        <input
                          type="text"
                          value={customRoleInput}
                          onChange={e => setCustomRoleInput(e.target.value)}
                          placeholder="e.g. Lead Cinematographer, Emergency Veterinarian"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#3186FF] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#000000] mb-1">
                          Industry / Domain Focus
                        </label>
                        <input
                          type="text"
                          value={customSectorInput}
                          onChange={e => setCustomSectorInput(e.target.value)}
                          placeholder="e.g. Film Production, Veterinary Critical Care"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#3186FF] bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: WORKLOAD INTENSITY & BOUNDARY BLEED */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F0F4FA] border border-[#E2E8F0]">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#000000] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#3186FF]" />
                      <span>Weekly Working Hours</span>
                    </label>
                    <span className="font-bold text-[#3186FF] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                      {weeklyHours} hrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="95"
                    step="1"
                    value={weeklyHours}
                    onChange={e => setWeeklyHours(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3186FF]"
                  />
                  <div className="flex justify-between text-[10px] text-[#5F6368] mt-1">
                    <span>35h (Standard)</span>
                    <span>65h (Surge)</span>
                    <span>95h (Extreme)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#000000] mb-1.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#3186FF]" />
                      <span>Evening Work & Late Calls</span>
                    </label>
                    <select
                      value={workBoundaryBleed}
                      onChange={e => setWorkBoundaryBleed(e.target.value as WorkBoundaryBleed)}
                      className="w-full p-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#000000] focus:ring-2 focus:ring-[#3186FF]"
                    >
                      <option value="strict_boundaries">🌅 Stop by 7:00 PM (No late work)</option>
                      <option value="occasional_bleed">🌗 Work until 9:00 PM sometimes</option>
                      <option value="always_on_bed">🌑 Work late into the night / from bed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#000000] mb-1.5 flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-sky-600" />
                      <span>International Travel & Timezones</span>
                    </label>
                    <select
                      value={travelFrequency}
                      onChange={e => setTravelFrequency(e.target.value as TravelFrequency)}
                      className="w-full p-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#000000] focus:ring-2 focus:ring-[#3186FF]"
                    >
                      <option value="none_domestic">✈️ None / Domestic travel only</option>
                      <option value="occasional">🌍 Occasional (1–2 trips/year)</option>
                      <option value="frequent_cross_meridian">🛫 Frequent (Monthly flights)</option>
                      <option value="constant_nomad">🌐 Constant / Global nomad</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: SLEEP ARCHITECTURE & NOCTURNAL RESTORATION */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                    <Bed className="w-4 h-4 text-indigo-600" />
                    <span>Sleep Architecture & Nocturnal Recovery</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 font-mono">
                    Avg: {nightlySleepHours} hrs/night
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#000000] mb-1">
                      Average Nightly Sleep Duration
                    </label>
                    <input
                      type="range"
                      min="4.0"
                      max="9.5"
                      step="0.5"
                      value={nightlySleepHours}
                      onChange={e => setNightlySleepHours(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-[#5F6368] mt-1">
                      <span>4h (Severe debt)</span>
                      <span>6.5h</span>
                      <span>9.5h (Surplus)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#000000] mb-1">
                      Morning Awakening Sensation
                    </label>
                    <select
                      value={sleepQuality}
                      onChange={e => setSleepQuality(e.target.value as SleepQuality)}
                      className="w-full p-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#000000] focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="middle_night_awakenings">Frequent 3:00 AM Awakenings (Adrenal Spike)</option>
                      <option value="exhausted_wired">Wake Up "Exhausted & Wired" (High Cortisol)</option>
                      <option value="moderate">Moderate / Fragmented Light Sleep</option>
                      <option value="fully_restored">Deeply Restored & Clear-Headed (NREM 3)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4: CHRONOTYPE & CAFFEINE HABITS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chronotype Affinity */}
                <div>
                  <label className="block text-xs font-bold text-[#000000] mb-1.5">
                    Chronotype Affinity
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setChronotype('morning_lark')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        chronotype === 'morning_lark'
                          ? 'border-[#3186FF] bg-blue-50/70 text-[#000000] font-semibold ring-1 ring-[#3186FF]'
                          : 'border-[#E2E8F0] bg-white text-[#5F6368]'
                      }`}
                    >
                      <Sun className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                      <div className="font-semibold text-[11px]">Morning Lark</div>
                      <div className="text-[9px] text-[#5F6368]">06:00–11:00 Peak</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChronotype('night_owl')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        chronotype === 'night_owl'
                          ? 'border-[#3186FF] bg-blue-50/70 text-[#000000] font-semibold ring-1 ring-[#3186FF]'
                          : 'border-[#E2E8F0] bg-white text-[#5F6368]'
                      }`}
                    >
                      <Moon className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                      <div className="font-semibold text-[11px]">Night Owl</div>
                      <div className="text-[9px] text-[#5F6368]">18:00–23:00 Peak</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChronotype('shift_biphasic')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        chronotype === 'shift_biphasic'
                          ? 'border-[#3186FF] bg-blue-50/70 text-[#000000] font-semibold ring-1 ring-[#3186FF]'
                          : 'border-[#E2E8F0] bg-white text-[#5F6368]'
                      }`}
                    >
                      <Activity className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                      <div className="font-semibold text-[11px]">Shift Worker</div>
                      <div className="text-[9px] text-[#5F6368]">Biphasic / Varied</div>
                    </button>
                  </div>
                </div>

                {/* Caffeine Ingestion Timing */}
                <div>
                  <label className="block text-xs font-bold text-[#000000] mb-1.5 flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-600" />
                    <span>First Caffeine Ingestion Timing</span>
                  </label>
                  <select
                    value={caffeineHabit}
                    onChange={e => setCaffeineHabit(e.target.value as CaffeineHabit)}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#000000] focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="no_coffee">No coffee / Zero caffeine consumption</option>
                    <option value="immediate_waking">Within 30m of waking (Blunts adenosine clearance)</option>
                    <option value="delayed_morning">Delayed 90–120m (Protects natural cortisol curve)</option>
                    <option value="afternoon_excess">Afternoon / Evening cups (Blocks NREM deep sleep)</option>
                  </select>
                </div>
              </div>

              {/* SECTION 5: CLINICAL PERCEIVED STRESS RATING & SOMATIC SYMPTOMS */}
              <div className="space-y-3 p-4 rounded-xl border border-rose-100 bg-rose-50/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-600" />
                    <span>Perceived Stress Scale (PSS-4 Clinical Severity Gauge)</span>
                  </label>
                  <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-mono">
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
                <div className="flex justify-between text-[10px] text-rose-800">
                  <span>1: Centered & in control</span>
                  <span>5: Moderate baseline strain</span>
                  <span>10: Approaching functional exhaustion</span>
                </div>

                {/* Somatic Manifestations */}
                <div className="pt-2">
                  <span className="block text-[11px] font-semibold text-[#000000] mb-1.5">
                    Active Somatic Stress Manifestations (Select all that apply):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {SOMATIC_OPTIONS.map(som => {
                      const isChecked = somaticSymptoms.includes(som.id);
                      return (
                        <button
                          key={som.id}
                          type="button"
                          onClick={() => handleToggleSomatic(som.id)}
                          className={`p-2 rounded-xl border text-left flex items-start justify-between transition-all ${
                            isChecked
                              ? 'border-rose-300 bg-white text-rose-950 shadow-xs'
                              : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-[11px]">{som.label}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{som.note}</div>
                          </div>
                          <div
                            className={`w-3.5 h-3.5 rounded mt-0.5 shrink-0 flex items-center justify-center border ${
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

              {/* SECTION 6: MULTI-SELECT CHRONIC STRESS DRIVERS (9 DETAILED DRIVERS) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#000000] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Chronic Stress Drivers</span>
                  </label>
                  <span className="text-[11px] text-[#5F6368]">{stressDrivers.length} selected</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto p-1 pr-1.5 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                  {STRESS_DRIVER_OPTIONS.map(opt => {
                    const isSelected = stressDrivers.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleStressDriver(opt.id)}
                        className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-[#3186FF] bg-blue-50/50 text-[#000000] shadow-xs'
                            : 'border-[#E2E8F0] bg-white text-[#5F6368] hover:border-slate-300'
                        }`}
                      >
                        <div className="pr-3">
                          <div className="font-semibold text-[#000000] text-xs">{opt.label}</div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                            isSelected ? 'bg-[#3186FF] border-[#3186FF] text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 7: PRE-EXISTING HEALTH CONDITIONS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#000000] flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    <span>Pre-Existing Health Conditions</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HEALTH_CONDITION_OPTIONS.map(cond => {
                    const isChecked = healthConditions.includes(cond.id);
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => handleToggleHealthCondition(cond.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                          isChecked
                            ? cond.id === 'none'
                              ? 'border-emerald-300 bg-emerald-50/60 font-semibold text-emerald-900'
                              : 'border-rose-300 bg-rose-50/50 font-semibold text-rose-950'
                            : 'border-[#E2E8F0] bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="truncate pr-1">{cond.label}</span>
                        <div className={`w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center border ${
                          isChecked
                            ? cond.id === 'none'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-rose-500 text-white border-rose-500'
                            : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Other Custom Health Condition */}
                  {healthConditions.filter(c => !HEALTH_CONDITION_OPTIONS.some(opt => opt.id === c)).map(custom => (
                    <div
                      key={custom}
                      className="p-2.5 rounded-xl border border-rose-300 bg-rose-50/50 text-xs flex items-center justify-between font-semibold text-rose-950"
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
                      <PlusCircle className="w-3 h-3" />
                      <span>+ Add other health condition</span>
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

              {/* SECTION 8: CURRENT MEDICATIONS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#000000] flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-purple-600" />
                    <span>Current Medications</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MEDICATION_OPTIONS.map(med => {
                    const isChecked = medications.includes(med.id);
                    return (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => handleToggleMedication(med.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                          isChecked
                            ? med.id === 'none'
                              ? 'border-emerald-300 bg-emerald-50/60 font-semibold text-emerald-900'
                              : 'border-purple-300 bg-purple-50/50 font-semibold text-purple-950'
                            : 'border-[#E2E8F0] bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="truncate pr-1">{med.label}</span>
                        <div className={`w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center border ${
                          isChecked
                            ? med.id === 'none'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-purple-600 text-white border-purple-600'
                            : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Other Custom Medication */}
                  {medications.filter(m => !MEDICATION_OPTIONS.some(opt => opt.id === m)).map(custom => (
                    <div
                      key={custom}
                      className="p-2.5 rounded-xl border border-purple-300 bg-purple-50/50 text-xs flex items-center justify-between font-semibold text-purple-950"
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
                      <PlusCircle className="w-3 h-3" />
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

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={initialStep === 'questionnaire' ? onClose : () => setStep('auth')}
                  className="text-xs text-[#5F6368] hover:text-[#000000] font-medium transition-colors"
                >
                  {initialStep === 'questionnaire' ? 'Cancel' : '← Back to Auth'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuestionnaire}
                  className="px-6 py-2.5 rounded-xl bg-[#3186FF] text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Profile & Recalibrate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
