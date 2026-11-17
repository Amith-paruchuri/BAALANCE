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
} from 'lucide-react';
import type { StressDriver, UserProfile } from '@/lib/types';

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
  onEditDetails: () => void;
  onRerunSetup: () => void;
  onSelectPreset: (preset: RolePreset) => void;
}

/** Who you are, what your weeks look like, and the work pattern used to read your result. */
export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  userProfile,
  verifiedCalendarEmail,
  onEditDetails,
  onRerunSetup,
  onSelectPreset,
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

  return (
    <>
      <section className={`${CARD} space-y-6`} aria-label="Your profile" data-testid="profile-overview">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-[#0D4F59] text-white flex items-center justify-center text-xl font-black shrink-0">
              {(userProfile.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">{userProfile.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3E4D7] text-[#6B3A25] border border-[#E6CDB8]">
                  {userProfile.isDemo ? 'Sample case' : 'Member'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                {userProfile.role}
                {userProfile.sector ? ` · ${userProfile.sector}` : ''}
                {userProfile.age ? ` · ${userProfile.age} years` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button type="button" onClick={onEditDetails} className={GHOST}>
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#BF6F4E]" />
              <span>Edit details</span>
            </button>
            <button type="button" onClick={onRerunSetup} className={GHOST}>
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Run setup again</span>
            </button>
          </div>
        </div>

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
