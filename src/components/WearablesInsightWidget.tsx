'use client';

import React, { useState, useMemo } from 'react';
import {
  Heart,
  Moon,
  BatteryCharging,
  Activity,
  Plus,
  Info,
  CheckCircle2,
  X,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { WeeklyTelemetry, HairCortisolSegment, UserProfile } from '@/lib/types';

interface WearablesInsightWidgetProps {
  telemetry: WeeklyTelemetry[];
  segments?: HairCortisolSegment[];
  userProfile?: UserProfile;
  onOpenConnectModal: () => void;
}

export const WearablesInsightWidget: React.FC<WearablesInsightWidgetProps> = ({
  telemetry,
  segments,
  userProfile,
  onOpenConnectModal,
}) => {
  // Selected month for sleep stages: 1 = July (Normal), 2 = August (Busy Crunch), 3 = September (Recovering)
  const [selectedMonth, setSelectedMonth] = useState<1 | 2 | 3>(2);
  // Selected metric for 12-week trend chart
  const [trendMetric, setTrendMetric] = useState<'deepSleep' | 'recovery' | 'rhr' | 'hrv'>('deepSleep');
  // Selected week index in chart
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(6);
  // Active info popup (e.g. 'deepSleep', 'recovery', 'rhr', 'hrv', 'rem', 'light', 'awake')
  const [activeInfoKey, setActiveInfoKey] = useState<string | null>(null);

  const toggleInfo = (key: string) => {
    setActiveInfoKey(prev => (prev === key ? null : key));
  };

  // Plain-English info explanations with zero biology buzzwords
  const INFO_DEFINITIONS: Record<string, { title: string; desc: string; tip: string }> = {
    deepSleep: {
      title: 'Deep Sleep',
      desc: 'The restorative physical stage of sleep where your muscles relax, your brain rests, and your body washes away daily stress.',
      tip: 'Healthy goal is at least 1.5 hours each night.',
    },
    recovery: {
      title: 'Daily Recovery',
      desc: 'A daily score (0–100%) showing how refreshed and ready your body is each morning after a night of sleep.',
      tip: 'Scores above 65% mean you have plenty of energy to handle your day.',
    },
    rhr: {
      title: 'Resting Heart Rate',
      desc: 'Your average heartbeats per minute while asleep. When you are calm and rested, your heart beats slower.',
      tip: 'A sudden jump (e.g. +10–15 bpm) signals your body is carrying extra stress overnight.',
    },
    hrv: {
      title: 'Stress Resilience (HRV)',
      desc: 'Heart Rate Variability measures the tiny variations between heartbeats. Higher numbers mean your body bounces back easily from pressure.',
      tip: 'Higher is better. Late-night work and screen time often drag this number down.',
    },
    stageDeep: {
      title: 'Deep Sleep Stage',
      desc: 'Physical repair time. This is when your body rebuilds tissues and clears out stress hormones.',
      tip: 'Aim for 1.5+ hours (around 20% of your night).',
    },
    stageRem: {
      title: 'Dream Sleep (REM)',
      desc: 'Mental recharge time. This stage helps your brain process memories and emotions so you wake up clear-headed.',
      tip: 'Usually accounts for 20–25% of your sleep.',
    },
    stageLight: {
      title: 'Light Sleep',
      desc: 'The baseline sleep stage that keeps your body resting comfortably between deeper cycles.',
      tip: 'Normally makes up about 50–60% of your total sleep.',
    },
    stageAwake: {
      title: 'Awake & Restless Time',
      desc: 'Minutes spent tossing, turning, or briefly waking up before falling back asleep.',
      tip: 'Under 10% is ideal. Late evening stress causes more restless wakeups.',
    },
  };

  // Calculate overall aggregate values from telemetry
  const validTelemetry = telemetry && telemetry.length > 0 ? telemetry : [];

  const avgDeepSleep = validTelemetry.length > 0
    ? (validTelemetry.reduce((sum, item) => sum + (item.deepSleepHours || 0), 0) / validTelemetry.length).toFixed(1)
    : '1.4';

  const avgRHR = validTelemetry.length > 0
    ? Math.round(validTelemetry.reduce((sum, item) => sum + (item.restingHeartRate || 55), 0) / validTelemetry.length)
    : 55;

  const avgHRV = validTelemetry.length > 0
    ? Math.round(validTelemetry.reduce((sum, item) => sum + (item.hrvRmssd || 60), 0) / validTelemetry.length)
    : 66;

  const avgRecovery = 44; // 44% during crisis period

  // Sleep breakdown by month (simplified, clear English)
  const sleepStagesData = useMemo(() => {
    if (selectedMonth === 1) {
      return {
        monthLabel: 'July',
        workloadLabel: 'Normal Workload',
        totalHours: 7.4,
        deep: { hours: 1.4, pct: 19, status: 'Healthy', note: 'Good physical recharge' },
        rem: { hours: 1.6, pct: 22, status: 'Healthy', note: 'Clear mental reset' },
        light: { hours: 4.0, pct: 54, status: 'Normal', note: 'Steady core sleep' },
        awake: { hours: 0.4, pct: 5, status: 'Low (Great)', note: 'Minimal restless minutes' },
        summary: 'In July, your sleep was calm and balanced. With 1.4 hours of deep sleep, your body was easily clearing away daily stress each night.',
      };
    } else if (selectedMonth === 2) {
      return {
        monthLabel: 'August',
        workloadLabel: 'Busy Crunch (Late Calls)',
        totalHours: 6.9,
        deep: { hours: 0.7, pct: 10, status: 'Low', note: 'Cut in half (only 42 min)' },
        rem: { hours: 1.4, pct: 20, status: 'Moderate', note: 'Delayed by evening screen time' },
        light: { hours: 3.9, pct: 56, status: 'Higher', note: 'Shallow restless rest' },
        awake: { hours: 0.9, pct: 14, status: 'High', note: 'Tossing and turning' },
        summary: 'In August, frequent late calls past 7:00 PM and bright screen exposure cut your deep sleep in half, leaving your body unable to fully recharge overnight.',
      };
    } else {
      return {
        monthLabel: 'September',
        workloadLabel: 'Recovering',
        totalHours: 7.1,
        deep: { hours: 1.1, pct: 15, status: 'Rebounding', note: 'Climbing back toward 1.5h' },
        rem: { hours: 1.5, pct: 21, status: 'Healthy', note: 'Normal dream sleep' },
        light: { hours: 3.9, pct: 55, status: 'Normal', note: 'Stable core sleep' },
        awake: { hours: 0.6, pct: 9, status: 'Improving', note: 'Fewer night wakeups' },
        summary: 'In September, as evening meetings tapered down, deep restorative sleep began rebounding toward 1.1 hours, helping your body start recovering.',
      };
    }
  }, [selectedMonth]);

  // Selected week data for chart
  const activeWeek = useMemo(() => {
    if (selectedWeekIndex !== null && validTelemetry[selectedWeekIndex]) {
      return validTelemetry[selectedWeekIndex];
    }
    return validTelemetry[6] || validTelemetry[0] || null;
  }, [selectedWeekIndex, validTelemetry]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in font-sans">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#3186FF] flex items-center justify-center shadow-xs shrink-0">
            <Moon className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Sleep & Recovery
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                90-Day Overview
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              See how your sleep and energy levels affect your daily stress and recharge.
            </p>
          </div>
        </div>

        {/* Action Button & Demo Data Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 relative z-10 shrink-0 self-start md:self-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            Currently using demo data
          </span>

          <button
            type="button"
            onClick={onOpenConnectModal}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#3186FF] hover:bg-blue-600 px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Real Device</span>
          </button>
        </div>
      </div>

      {/* 2. THE 4 ESSENTIAL RECOVERY CARDS (Simple, Glanceable, Zero Jargon) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Deep Sleep */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 flex flex-col justify-between space-y-3 relative hover:border-indigo-300 transition-all">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <span>Deep Sleep</span>
              </div>
              <button
                type="button"
                onClick={() => toggleInfo('deepSleep')}
                className="w-6 h-6 rounded-full text-slate-400 hover:text-[#3186FF] hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                title="What is deep sleep?"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {avgDeepSleep}
              </span>
              <span className="text-xs text-slate-500">hrs / night</span>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-1">
              <span className="font-semibold text-rose-600">Dropped to 42 min</span>
              <span>during August</span>
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Goal: ≥ 1.5 hrs</span>
              <span className="text-rose-600 font-bold">47% in August</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '47%' }} />
            </div>
          </div>
        </div>

        {/* Card 2: Daily Recovery */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 flex flex-col justify-between space-y-3 relative hover:border-amber-300 transition-all">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <span>Daily Recovery</span>
              </div>
              <button
                type="button"
                onClick={() => toggleInfo('recovery')}
                className="w-6 h-6 rounded-full text-slate-400 hover:text-[#3186FF] hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                title="What is daily recovery?"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
                {avgRecovery}%
              </span>
              <span className="text-xs text-slate-500">quarter avg</span>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-1">
              <span className="font-semibold text-amber-700">Strained</span>
              <span>for 4 weeks in August</span>
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Goal: ≥ 65%</span>
              <span className="text-amber-600 font-bold">44% Average</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full" style={{ width: '44%' }} />
            </div>
          </div>
        </div>

        {/* Card 3: Resting Heart Rate */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 flex flex-col justify-between space-y-3 relative hover:border-rose-300 transition-all">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <span>Resting Heart Rate</span>
              </div>
              <button
                type="button"
                onClick={() => toggleInfo('rhr')}
                className="w-6 h-6 rounded-full text-slate-400 hover:text-[#3186FF] hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                title="What is resting heart rate?"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {avgRHR}
              </span>
              <span className="text-xs text-slate-500">bpm pulse</span>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-1">
              <span className="font-semibold text-rose-600">Spiked to 69 bpm</span>
              <span>during crunch</span>
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Resting: 54 bpm</span>
              <span className="text-rose-600 font-bold">+15 bpm surge</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
        </div>

        {/* Card 4: Stress Resilience (HRV) */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 flex flex-col justify-between space-y-3 relative hover:border-emerald-300 transition-all">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <span>Stress Resilience</span>
              </div>
              <button
                type="button"
                onClick={() => toggleInfo('hrv')}
                className="w-6 h-6 rounded-full text-slate-400 hover:text-[#3186FF] hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                title="What is Stress Resilience (HRV)?"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {avgHRV}
              </span>
              <span className="text-xs text-slate-500">HRV score</span>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">66 ms baseline</span>
              <span>(dropped to 22 ms)</span>
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Normal: ≥ 55 ms</span>
              <span className="text-emerald-600 font-bold">Good resilience</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* POPUP INFO MODAL / DRAWER (Opened when user taps any "(i)" icon) */}
      {activeInfoKey && INFO_DEFINITIONS[activeInfoKey] && (
        <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-2xl animate-fade-in relative text-xs text-slate-800 shadow-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#3186FF] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-sm">
                {INFO_DEFINITIONS[activeInfoKey].title}
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                {INFO_DEFINITIONS[activeInfoKey].desc}
              </p>
              <div className="text-[11px] text-blue-700 font-semibold pt-0.5">
                💡 {INFO_DEFINITIONS[activeInfoKey].tip}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveInfoKey(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-black hover:bg-blue-100/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. SLEEP STAGES COMPARISON */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                How Your Sleep Stages Changed
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare how your nightly rest shifted between normal months and busy crunch weeks.
            </p>
          </div>

          {/* Month Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setSelectedMonth(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedMonth === 1
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              July (Normal)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMonth(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedMonth === 2
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900 bg-rose-50'
              }`}
            >
              <span>August (Crunch)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedMonth(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedMonth === 3
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              September (Recovering)
            </button>
          </div>
        </div>

        {/* Month Summary Bar */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${selectedMonth === 2 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'}`} />
            <span className="text-xs font-bold text-slate-900">
              {sleepStagesData.monthLabel} ({sleepStagesData.workloadLabel})
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Average Total Sleep:</span>
            <span className="font-extrabold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              {sleepStagesData.totalHours} hrs / night
            </span>
          </div>
        </div>

        {/* Visual Segmented Sleep Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-8 rounded-2xl overflow-hidden flex shadow-inner p-1 bg-slate-100 gap-1 border border-slate-200">
            {/* Deep Sleep */}
            <div
              style={{ width: `${sleepStagesData.deep.pct}%` }}
              className="h-full rounded-xl bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold px-1 overflow-hidden transition-all duration-300"
              title={`Deep Sleep: ${sleepStagesData.deep.hours} hrs (${sleepStagesData.deep.pct}%)`}
            >
              🌙 {sleepStagesData.deep.pct}%
            </div>

            {/* Dream Sleep (REM) */}
            <div
              style={{ width: `${sleepStagesData.rem.pct}%` }}
              className="h-full rounded-xl bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold px-1 overflow-hidden transition-all duration-300"
              title={`Dream Sleep: ${sleepStagesData.rem.hours} hrs (${sleepStagesData.rem.pct}%)`}
            >
              🧠 {sleepStagesData.rem.pct}%
            </div>

            {/* Light Sleep */}
            <div
              style={{ width: `${sleepStagesData.light.pct}%` }}
              className="h-full rounded-xl bg-slate-300 flex items-center justify-center text-slate-700 text-[10px] font-bold px-1 overflow-hidden transition-all duration-300"
              title={`Light Sleep: ${sleepStagesData.light.hours} hrs (${sleepStagesData.light.pct}%)`}
            >
              💤 {sleepStagesData.light.pct}%
            </div>

            {/* Awake */}
            <div
              style={{ width: `${sleepStagesData.awake.pct}%` }}
              className="h-full rounded-xl bg-rose-500 flex items-center justify-center text-white text-[10px] font-bold px-1 overflow-hidden transition-all duration-300"
              title={`Awake: ${sleepStagesData.awake.hours} hrs (${sleepStagesData.awake.pct}%)`}
            >
              ⚡ {sleepStagesData.awake.pct}%
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
            <span>Bedtime</span>
            <span>Sleep Stages</span>
            <span>Wakeup</span>
          </div>
        </div>

        {/* 4 Clean Sleep Stage Tiles with "(i)" buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Deep Sleep */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Deep Sleep
              </span>
              <button
                type="button"
                onClick={() => toggleInfo('stageDeep')}
                className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-slate-900">
              {sleepStagesData.deep.hours} hrs <span className="text-[10px] font-normal text-slate-500">({sleepStagesData.deep.pct}%)</span>
            </div>
            <div className="text-[10px] text-slate-500">{sleepStagesData.deep.note}</div>
          </div>

          {/* Dream Sleep (REM) */}
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Dream Sleep
              </span>
              <button
                type="button"
                onClick={() => toggleInfo('stageRem')}
                className="text-sky-400 hover:text-sky-700 cursor-pointer"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-slate-900">
              {sleepStagesData.rem.hours} hrs <span className="text-[10px] font-normal text-slate-500">({sleepStagesData.rem.pct}%)</span>
            </div>
            <div className="text-[10px] text-slate-500">{sleepStagesData.rem.note}</div>
          </div>

          {/* Light Sleep */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Light Sleep
              </span>
              <button
                type="button"
                onClick={() => toggleInfo('stageLight')}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-slate-900">
              {sleepStagesData.light.hours} hrs <span className="text-[10px] font-normal text-slate-500">({sleepStagesData.light.pct}%)</span>
            </div>
            <div className="text-[10px] text-slate-500">{sleepStagesData.light.note}</div>
          </div>

          {/* Awake Time */}
          <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Awake Time
              </span>
              <button
                type="button"
                onClick={() => toggleInfo('stageAwake')}
                className="text-rose-400 hover:text-rose-700 cursor-pointer"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-rose-600">
              {sleepStagesData.awake.hours} hrs <span className="text-[10px] font-normal text-slate-500">({sleepStagesData.awake.pct}%)</span>
            </div>
            <div className="text-[10px] text-slate-500">{sleepStagesData.awake.note}</div>
          </div>
        </div>

        {/* Friendly Plain English Explanation */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#3186FF] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {sleepStagesData.summary}
          </p>
        </div>
      </div>

      {/* 4. 12-WEEK SLEEP & ENERGY TREND (Interactive Visual Chart) */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#3186FF]" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                12-Week Sleep & Energy Trend
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tap any week to see your numbers during that time.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-center flex-wrap">
            <button
              type="button"
              onClick={() => setTrendMetric('deepSleep')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                trendMetric === 'deepSleep'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Deep Sleep</span>
            </button>
            <button
              type="button"
              onClick={() => setTrendMetric('recovery')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                trendMetric === 'recovery'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BatteryCharging className="w-3 h-3" />
              <span>Daily Recovery</span>
            </button>
            <button
              type="button"
              onClick={() => setTrendMetric('hrv')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                trendMetric === 'hrv'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Stress Resilience</span>
            </button>
            <button
              type="button"
              onClick={() => setTrendMetric('rhr')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                trendMetric === 'rhr'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>Resting Pulse</span>
            </button>
          </div>
        </div>

        {/* Month Headings */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <div className="p-1 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-900">
            July (Baseline)
          </div>
          <div className="p-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-extrabold flex items-center justify-center gap-1">
            <span>August (Crunch Period)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="p-1 rounded-xl bg-emerald-50/80 border border-emerald-100 text-emerald-900">
            September (Recovery)
          </div>
        </div>

        {/* 12-Week Interactive Bar Chart */}
        <div className="pt-2 pb-1 space-y-2">
          <div className="h-40 w-full flex items-end justify-between gap-1 sm:gap-2 px-1 relative">
            {/* Background highlight for August Crunch (Weeks 5-8) */}
            <div className="absolute top-0 bottom-0 left-[33.3%] right-[33.3%] bg-rose-50/60 rounded-2xl border-x border-rose-200/60 pointer-events-none" />

            {validTelemetry.map((item, idx) => {
              let val = 0;
              let maxVal = 100;
              let unit = '';
              let barColor = 'bg-indigo-600';
              const isCrisis = item.month === 2;

              if (trendMetric === 'deepSleep') {
                val = item.deepSleepHours || 0;
                maxVal = 1.8;
                unit = 'h';
                barColor = isCrisis ? 'bg-rose-500' : 'bg-indigo-600';
              } else if (trendMetric === 'recovery') {
                val = isCrisis
                  ? Math.max(25, Math.round(58 - (item.eveningCalls || 0) * 3))
                  : Math.min(85, Math.round(68 - (item.eveningCalls || 0) * 2));
                maxVal = 100;
                unit = '%';
                barColor = isCrisis ? 'bg-amber-500' : 'bg-emerald-600';
              } else if (trendMetric === 'hrv') {
                val = item.hrvRmssd || 50;
                maxVal = 80;
                unit = 'ms';
                barColor = isCrisis ? 'bg-amber-500' : 'bg-emerald-600';
              } else if (trendMetric === 'rhr') {
                val = item.restingHeartRate || 55;
                maxVal = 80;
                unit = 'bpm';
                barColor = isCrisis ? 'bg-rose-500' : 'bg-blue-500';
              }

              const heightPct = Math.min(100, Math.max(15, (val / maxVal) * 100));
              const isSelected = selectedWeekIndex === idx;

              return (
                <div
                  key={item.weekNumber}
                  onClick={() => setSelectedWeekIndex(idx)}
                  className="flex-1 h-full flex flex-col items-center justify-end z-10 cursor-pointer group"
                >
                  <div className={`text-[10px] font-mono font-bold mb-1 transition-all ${isSelected ? 'text-black font-black scale-110' : 'text-slate-400 group-hover:text-slate-800'}`}>
                    {val}{unit}
                  </div>

                  <div className="w-full max-w-[28px] h-28 flex items-end justify-center rounded-xl bg-slate-100 p-0.5">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-lg transition-all duration-300 ${barColor} ${isSelected ? 'ring-2 ring-black shadow-md scale-105' : 'group-hover:opacity-90'}`}
                    />
                  </div>

                  <div className={`text-[10px] font-mono mt-1 transition-all ${isSelected ? 'font-black text-black' : 'text-slate-400 group-hover:text-slate-700'}`}>
                    W{item.weekNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Week Detail Tile */}
        {activeWeek && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  Week {activeWeek.weekNumber} ({activeWeek.monthLabel} • {activeWeek.dateRange})
                </span>
                {activeWeek.month === 2 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    Crunch Period
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {activeWeek.triggerDetails || 'Standard quarterly cadence.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 font-mono text-[11px] flex-wrap">
              <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[9px] block">DEEP SLEEP</span>
                <span className="font-extrabold text-indigo-700">{activeWeek.deepSleepHours} hrs</span>
              </div>
              <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[9px] block">RESTING PULSE</span>
                <span className="font-extrabold text-rose-600">{activeWeek.restingHeartRate} bpm</span>
              </div>
              <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[9px] block">STRESS SCORE</span>
                <span className="font-extrabold text-emerald-600">{activeWeek.hrvRmssd} ms</span>
              </div>
              <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[9px] block">LATE CALLS</span>
                <span className="font-extrabold text-slate-800">{activeWeek.eveningCalls} calls</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. SIMPLE, ZERO-JARGON KEY TAKEAWAY */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 rounded-3xl border border-blue-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#3186FF] text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-sm">
              Key Recovery Takeaway
            </span>
            <span className="text-slate-600 text-xs">
              Deep sleep is your body's natural way to wash away daily stress. Stopping work by 7:00 PM helps protect that deep sleep so your body can fully recharge.
            </span>
          </div>
        </div>

        <span className="text-xs font-bold text-[#3186FF] px-3.5 py-1.5 rounded-xl bg-white border border-blue-200 shadow-2xs shrink-0 self-start sm:self-center">
          7 PM Curfew Recommended
        </span>
      </div>
    </div>
  );
};
