'use client';

import React, { useState } from 'react';
import { Info, ShieldCheck, CheckCircle2, AlertTriangle, Flame } from 'lucide-react';

interface BurnoutGradientBarProps {
  meanScore: number;
  organizationName: string;
}

export const BurnoutGradientBar: React.FC<BurnoutGradientBarProps> = ({
  meanScore,
  organizationName,
}) => {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const getTierFromScore = (score: number) => {
    if (score <= 35) return 0;
    if (score <= 60) return 1;
    if (score <= 80) return 2;
    return 3;
  };

  const currentTier = getTierFromScore(meanScore);

  const TIERS = [
    {
      range: '0 – 35',
      label: 'Healthy & Thriving',
      emoji: '🟢',
      color: 'green',
      hex: '#10B981',
      bgPill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeBg: 'bg-emerald-500',
      description: 'Low stress, well-rested, and high daily energy. People have a healthy work-life balance and zero burnout risk.',
      actionAdvice: 'Keep up current balanced schedules and positive team habits.',
    },
    {
      range: '36 – 60',
      label: 'Manageable Workload',
      emoji: '🔵',
      color: 'blue',
      hex: '#3B82F6',
      bgPill: 'bg-blue-100 text-blue-800 border-blue-300',
      badgeBg: 'bg-blue-500',
      description: 'Normal everyday work pressure. Teams handle deadlines well and have enough energy to recover during evenings.',
      actionAdvice: 'Keep workloads steady and encourage taking full weekends off to recharge.',
    },
    {
      range: '61 – 80',
      label: 'High Stress Warning',
      emoji: '🟠',
      color: 'orange',
      hex: '#F97316',
      bgPill: 'bg-orange-100 text-orange-800 border-orange-300',
      badgeBg: 'bg-orange-500',
      description: 'Heavy overload and ongoing fatigue. People feel frequently tired, mentally drained, and stressed out.',
      actionAdvice: 'Stop late-night emails, cancel unnecessary meetings, and give teams breathing room.',
    },
    {
      range: '81 – 100',
      label: 'Critical Burnout Risk',
      emoji: '🔴',
      color: 'red',
      hex: '#EF4444',
      bgPill: 'bg-rose-100 text-rose-800 border-rose-300',
      badgeBg: 'bg-rose-600',
      description: 'Severe mental and physical exhaustion. High risk of people burning out, making mistakes, or quitting.',
      actionAdvice: 'Immediate action required: cut long shifts, mandate rest days, and stop overtime.',
    },
  ];

  const activeInference = selectedTier !== null ? TIERS[selectedTier] : TIERS[currentTier];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Top Title & Score Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Stress Severity Scale
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Organization Burnout Scale & Health Zones
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Four simple health zones showing overall fatigue and workload pressure across the organization.
          </p>
        </div>

        {/* Current Organization Score Capsule */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-2xs self-start sm:self-auto">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Overall Average
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">Score {meanScore}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-xl text-xs font-black shadow-2xs border ${TIERS[currentTier].bgPill}`}
          >
            {TIERS[currentTier].label}
          </span>
        </div>
      </div>

      {/* CLEAN 4-COLOR SEVERITY GRADIENT BAR (GREEN -> BLUE -> ORANGE -> RED) */}
      <div className="space-y-2 pt-2">
        <div className="relative">
          {/* Floating Pointer Needle */}
          <div
            className="absolute -top-7 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500"
            style={{ left: `${Math.min(Math.max(meanScore, 4), 96)}%` }}
          >
            <div className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-black shadow-md flex items-center gap-1 whitespace-nowrap">
              <span>Average: {meanScore}</span>
            </div>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-slate-900" />
          </div>

          {/* 4 Connected Vivid Color Zones (Crisp Green, Blue, Orange, Red) */}
          <div className="h-6 w-full rounded-2xl p-1 bg-slate-100 border border-slate-200 shadow-inner flex gap-1 overflow-hidden">
            {/* Zone 1: Green (0-35) */}
            <div
              className="h-full rounded-l-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-[10px] font-black text-white shadow-xs"
              style={{ width: '35%' }}
            >
              <span className="hidden sm:inline">Healthy</span>
            </div>
            {/* Zone 2: Blue (36-60) */}
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-xs"
              style={{ width: '25%' }}
            >
              <span className="hidden sm:inline">Manageable</span>
            </div>
            {/* Zone 3: Orange (61-80) */}
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-[10px] font-black text-white shadow-xs"
              style={{ width: '20%' }}
            >
              <span className="hidden sm:inline">High Stress</span>
            </div>
            {/* Zone 4: Red (81-100) */}
            <div
              className="h-full rounded-r-xl bg-gradient-to-r from-rose-500 to-red-600 flex items-center justify-center text-[10px] font-black text-white shadow-xs"
              style={{ width: '20%' }}
            >
              <span className="hidden sm:inline">Burnout</span>
            </div>
          </div>
        </div>

        {/* Range Labels beneath Gradient */}
        <div className="grid grid-cols-4 text-center text-[10px] sm:text-xs font-extrabold pt-1">
          <div className="text-left text-emerald-700 font-bold">0 – 35 (Green)</div>
          <div className="text-center text-blue-700 font-bold">36 – 60 (Blue)</div>
          <div className="text-center text-orange-700 font-bold">61 – 80 (Orange)</div>
          <div className="text-right text-red-700 font-bold">81 – 100 (Red)</div>
        </div>
      </div>

      {/* 4 INTERACTIVE SIMPLE NON-MEDICAL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {TIERS.map((tier, idx) => {
          const isOrgTier = currentTier === idx;
          const isSelected = (selectedTier === idx) || (selectedTier === null && isOrgTier);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedTier(idx)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-400'
                  : 'bg-slate-50/70 text-slate-800 border-slate-200/80 hover:bg-slate-100/80'
              }`}
            >
              {isOrgTier && (
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Current</span>
                </div>
              )}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{tier.emoji}</span>
                <span className={`text-[11px] font-mono font-black ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {tier.range}
                </span>
              </div>
              <h4 className="text-xs font-black tracking-tight">{tier.label}</h4>
              <p className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                {tier.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Action Recommendation Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-blue-900">
              Recommended Action for {activeInference.label} ({activeInference.range}):
            </span>
            <p className="text-blue-800 text-[11px] mt-0.5 font-medium">
              {activeInference.actionAdvice}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold text-slate-600 bg-white px-3 py-1 rounded-xl border border-blue-200 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Action Ready</span>
        </div>
      </div>
    </div>
  );
};
