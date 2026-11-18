'use client';

import React from 'react';
import {
  Briefcase,
  Stethoscope,
  Zap,
  Clock,
  Sun,
  Moon,
  Laptop,
  Plane,
  CalendarDays,
  HeartPulse,
  Pill,
  LogOut,
  SlidersHorizontal,
  RefreshCw,
  UserRound,
  Check,
  ArrowRight,
} from 'lucide-react';
import type { HairCortisolSegment, StressDriver, UserProfile } from '@/lib/types';

const CARD = 'bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 font-sans';
const EYEBROW = 'text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]';
const TITLE = 'text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1';
const GHOST =
  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 transition-colors cursor-pointer';

export interface RolePreset {
  key: 'medical' | 'tech' | 'executive';
  label: string;
  hint: string;
  role: string;
  sector: string;
  weeklyHours: number;
  stressDrivers: StressDriver[];
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    key: 'medical',
    label: 'Medicine and healthcare',
    hint: 'Ward rotations, exams and night shifts',
    role: 'Medical Student / Clinical Scholar',
    sector: 'Medicine & Healthcare',
    weeklyHours: 60,
    stressDrivers: ['hospital_ward_rotations', 'clinical_exams', 'irregular_night_shifts', 'sleep_debt'],
  },
  {
    key: 'tech',
    label: 'Founder or tech lead',
    hint: 'Late calls, launches and investor pressure',
    role: 'Tech Founder & AI Research Lead',
    sector: 'Technology & Biotech',
    weeklyHours: 65,
    stressDrivers: ['evening_meetings', 'cross_timezone_flights', 'sleep_debt', 'stakeholder_board_pressure'],
  },
  {
    key: 'executive',
    label: 'Corporate professional',
    hint: 'Heavy meeting load and deadlines',
    role: 'Executive / Corporate Professional',
    sector: 'Finance & Strategy',
    weeklyHours: 55,
    stressDrivers: ['evening_meetings', 'heavy_deadlines', 'sleep_debt'],
  },
];

const PRESET_ICON = { medical: Stethoscope, tech: Zap, executive: Briefcase };

const activePreset = (role: string): RolePreset['key'] | null =>
  /medical|clinical/i.test(role) ? 'medical' : /founder|tech/i.test(role) ? 'tech' : /executive|corporate/i.test(role) ? 'executive' : null;

const CHRONOTYPE: Record<string, string> = {
  morning_lark: 'Morning person',
  night_owl: 'Night owl',
  shift_biphasic: 'Shift pattern',
};
const SLEEP_QUALITY: Record<string, string> = {
  exhausted_wired: 'Wake up tired',
  middle_night_awakenings: 'Wake in the night',
  moderate: 'Fair sleep',
  fully_restored: 'Wake up rested',
};
const BOUNDARY: Record<string, string> = {
  always_on_bed: 'Work until bedtime',
  occasional_bleed: 'Some evening work',
  strict_boundaries: 'Evenings protected',
};
const TRAVEL: Record<string, string> = {
  none_domestic: 'Rarely travel',
  occasional: 'Occasional travel',
  frequent_cross_meridian: 'Frequent time-zone travel',
  constant_nomad: 'Constantly travelling',
};
const titleCase = (text: string) => text.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());

interface ProfileOverviewProps {
  userProfile: UserProfile;
  verifiedCalendarEmail?: string;
  segments?: HairCortisolSegment[];
  /** The dashboard's 3-month stress score. */
  stressScore?: number;
  onEditDetails: () => void;
  onRerunSetup: () => void;
  onSelectPreset: (preset: RolePreset) => void;
  onTakeQuestionnaire?: () => void;
  onConnectCalendar?: () => void;
  onAddHairResult?: () => void;
}

/** Who you are, what your weeks look like, and the work pattern used to read your result. */
export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  userProfile,
  verifiedCalendarEmail,
  segments = [],
  stressScore,
  onEditDetails,
  onRerunSetup,
  onSelectPreset,
  onTakeQuestionnaire,
  onConnectCalendar,
  onAddHairResult,
}) => {
  const selected = activePreset(userProfile.role || '');
  const calendarLabel = verifiedCalendarEmail || (userProfile.isDemo ? 'Sample calendar' : 'Not connected yet');
  const routine = [
    { icon: Clock, label: 'Work', value: `${userProfile.weeklyHours || 0} hours a week` },
    { icon: Sun, label: 'Body clock', value: CHRONOTYPE[userProfile.chronotype] || 'Not set' },
    {
      icon: Moon,
      label: 'Sleep',
      value: `${userProfile.nightlySleepHours || 0} hours a night`,
      note: SLEEP_QUALITY[userProfile.sleepQuality],
    },
    { icon: Laptop, label: 'Evenings', value: BOUNDARY[userProfile.workBoundaryBleed] || 'Not set' },
    { icon: Plane, label: 'Travel', value: TRAVEL[userProfile.travelFrequency || 'occasional'] },
    { icon: CalendarDays, label: 'Calendar', value: calendarLabel },
  ];
  const drivers = userProfile.stressDrivers || [];

  const isDemo = !!userProfile.isDemo;
  const peak = segments.length ? segments.reduce((a, b) => (b.cortisolPgPerMg > a.cortisolPgPerMg ? b : a)) : null;
  const nextSample = new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const score = typeof stressScore === 'number' && stressScore > 0 ? Math.round(stressScore) : null;
  const scoreWord = score === null ? '' : score > 80 ? 'Very high' : score > 60 ? 'High' : score > 35 ? 'Manageable' : 'Healthy';

  // What makes the result more accurate, and what is still missing.
  const checklist = [
    {
      title: 'Hair cortisol result',
      done: segments.length > 0,
      status: segments.length > 0 ? (isDemo ? 'Sample result loaded' : 'Three months on file') : 'Not added yet',
      action: 'Add result',
      onAction: onAddHairResult,
    },
    {
      title: 'Calendar',
      done: !!verifiedCalendarEmail || isDemo,
      status: verifiedCalendarEmail ? `Connected: ${verifiedCalendarEmail}` : isDemo ? 'Sample calendar loaded' : 'Not connected yet',
      action: 'Connect',
      onAction: onConnectCalendar,
    },
    {
      title: 'About you and your routine',
      done: !!userProfile.role && !!userProfile.weeklyHours,
      status: userProfile.role ? 'Filled in' : 'Not filled in yet',
      action: 'Fill in',
      onAction: onEditDetails,
    },
    {
      title: 'Stress questionnaire (PSS-10)',
      done: !!userProfile.pss10,
      status: userProfile.pss10 ? `Score ${userProfile.pss10.score} of 40` : '10 questions, about 2 minutes',
      action: 'Start',
      onAction: onTakeQuestionnaire,
    },
  ];
  const doneCount = checklist.filter(item => item.done).length;
  const completeness = Math.round((doneCount / checklist.length) * 100);
  const ring = 2 * Math.PI * 26;

  return (
    <>
      {/* Member pass: who you are and where you stand, on one card */}
      <section
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16636E] via-[#0D4F59] to-[#072B31] text-white shadow-cardHover p-5 sm:p-7 font-sans"
        aria-label="Your profile"
        data-testid="profile-overview"
      >
        {/* a single hair strand, drawn large and faint, as the card's watermark */}
        <svg viewBox="0 0 600 240" className="absolute -right-10 -top-6 w-[560px] max-w-none opacity-[0.12] pointer-events-none" aria-hidden="true">
          <path d="M-10 190 C120 60 300 40 620 110" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
          <path d="M-10 214 C140 96 320 78 620 150" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          {[120, 210, 300, 390, 480].map(x => (
            <circle key={x} cx={x} cy={150 - (x - 120) * 0.12} r="6" fill="#F6B73C" />
          ))}
        </svg>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full bg-white/10 ring-2 ring-white/40 flex items-center justify-center text-2xl font-black shrink-0">
              {(userProfile.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F0C9B5]">BAALANCE {isDemo ? 'sample pass' : 'member'}</div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight truncate">{userProfile.name}</h2>
              <p className="text-xs text-white/70 truncate">
                {userProfile.role}
                {userProfile.sector ? ` · ${userProfile.sector}` : ''}
              </p>
              <p className="text-[11px] text-white/50 truncate">{userProfile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="relative w-16 h-16" role="img" aria-label={`Profile ${completeness}% complete`}>
              <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="6" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#F6B73C"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={ring}
                  strokeDashoffset={ring * (1 - completeness / 100)}
                  style={{ transition: 'stroke-dashoffset 900ms ease' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{completeness}%</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={onEditDetails}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#0D4F59] hover:bg-[#FBF7F2] text-xs font-bold transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Edit details</span>
              </button>
              <button
                type="button"
                onClick={onRerunSetup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Run setup again</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-6">
          {[
            { label: 'Stress score', value: score !== null ? String(score) : 'Not yet', unit: score !== null ? `of 100 · ${scoreWord}` : 'Not calculated yet' },
            { label: 'Highest month', value: peak ? String(peak.cortisolPgPerMg) : 'Not yet', unit: peak ? `pg/mg in ${peak.title}` : 'No hair result yet' },
            { label: 'How you feel', value: userProfile.pss10 ? String(userProfile.pss10.score) : 'Not yet', unit: userProfile.pss10 ? 'of 40 on PSS-10' : 'PSS-10 not taken' },
            { label: 'Next hair sample', value: nextSample.split(' ').slice(0, 2).join(' '), unit: `${nextSample.split(' ').slice(2).join(' ')} · in 8 weeks` },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm px-3.5 py-3 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">{stat.label}</div>
              <div className="text-2xl font-black font-mono leading-tight mt-0.5 truncate">{stat.value}</div>
              <div className="text-[11px] text-white/70 truncate">{stat.unit}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What is on file, and what would sharpen the result */}
      <section className={`${CARD} space-y-4`} aria-label="Profile checklist" data-testid="profile-checklist">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={EYEBROW}>{doneCount === checklist.length ? 'All set' : 'Sharpen your result'}</div>
            <h2 className={TITLE}>
              {doneCount} of {checklist.length} pieces in place
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">The more of these we have, the better we can explain your hair result.</p>
          </div>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {checklist.map(item => (
            <li
              key={item.title}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 ${item.done ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-white border-slate-200'}`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 border border-dashed border-slate-300'
                }`}
              >
                {item.done ? <Check className="w-4 h-4 stroke-[3]" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-slate-900">{item.title}</div>
                <div className="text-xs text-slate-500 truncate">{item.status}</div>
              </div>
              {!item.done && item.onAction && (
                <button
                  type="button"
                  onClick={item.onAction}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D4F59] hover:bg-[#0B434B] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>{item.action}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className={`${CARD} space-y-4`} aria-label="Your work">
        <div className="space-y-2.5">
          <div className="text-xs font-extrabold text-slate-900">What best describes your work?</div>
          <p className="text-xs text-slate-500 -mt-1.5">We read your result against the pattern for your kind of work.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ROLE_PRESETS.map(preset => {
              const Icon = PRESET_ICON[preset.key];
              const isActive = selected === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  aria-pressed={isActive}
                  className={`p-4 rounded-2xl border text-left transition-colors cursor-pointer flex items-start gap-3 ${
                    isActive ? 'bg-[#0D4F59]/5 border-[#0D4F59] ring-1 ring-[#0D4F59]' : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-[#0D4F59] text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{preset.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{preset.hint}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${CARD} space-y-5`} aria-label="Your routine">
        <div>
          <div className={EYEBROW}>From your questionnaire</div>
          <h2 className={TITLE}>Your routine</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">The habits we use to read your hair result in context.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {routine.map(item => (
            <div key={item.label} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-1.5 truncate" title={item.value}>
                {item.value}
              </div>
              {item.note && <div className="text-[11px] text-slate-500 mt-0.5">{item.note}</div>}
            </div>
          ))}
        </div>

        {drivers.length > 0 && (
          <div>
            <div className="text-xs font-extrabold text-slate-900 mb-2">What you said adds to your stress</div>
            <div className="flex flex-wrap gap-2">
              {drivers.map(driver => (
                <span
                  key={driver}
                  className="px-3 py-1.5 rounded-full bg-[#FBF7F2] border border-[#EFE6DA] text-xs font-semibold text-[#6B3A25]"
                >
                  {titleCase(driver)}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

/** Conditions and medicines that change hair cortisol, so the result is read in context. */
export const MedicalHistoryCard: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
  const list = (items?: string[]) =>
    items && items.length > 0 && items[0] !== 'none' ? items.map(titleCase).join(', ') : 'None reported';

  return (
    <section className={`${CARD} space-y-5`} aria-label="Medical history">
      <div>
        <div className={EYEBROW}>Read in context</div>
        <h2 className={TITLE}>Medical history</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Some conditions and medicines change hair cortisol. If you report one, we flag it on your result.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Health conditions</span>
          </div>
          <div className="text-sm font-extrabold text-slate-900 mt-1.5">{list(userProfile.healthConditions)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Cushing&apos;s, Addison&apos;s and pregnancy all change cortisol.</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Pill className="w-3.5 h-3.5" />
            <span>Medicines</span>
          </div>
          <div className="text-sm font-extrabold text-slate-900 mt-1.5">{list(userProfile.medications)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Steroid medicines and hair dye can affect readings.</p>
        </div>
      </div>
    </section>
  );
};

/** Account actions. */
export const AccountCard: React.FC<{ userProfile: UserProfile; onEditDetails: () => void; onSignOut: () => void }> = ({
  userProfile,
  onEditDetails,
  onSignOut,
}) => (
  <section className={`${CARD} flex flex-col sm:flex-row sm:items-center justify-between gap-4`} aria-label="Account">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
        <UserRound className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-extrabold text-slate-900">Account</div>
        <p className="text-xs text-slate-500 truncate">
          {userProfile.isDemo ? 'You are exploring the sample case. Nothing is saved to an account.' : `Signed in as ${userProfile.email}`}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          <a href="/privacy" className="underline font-semibold">Privacy policy</a> · <a href="/terms" className="underline font-semibold">Terms of use</a>
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap shrink-0">
      <button type="button" onClick={onEditDetails} className={GHOST}>
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
        <span>Update questionnaire</span>
      </button>
      <button
        type="button"
        onClick={onSignOut}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-xs font-bold text-rose-600 border border-rose-200 transition-colors cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>{userProfile.isDemo ? 'Leave the demo' : 'Sign out'}</span>
      </button>
    </div>
  </section>
);
