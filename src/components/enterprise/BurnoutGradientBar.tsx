'use client';

import React, { useState } from 'react';
import { Sparkles, Info, ShieldCheck, Flame, AlertCircle } from 'lucide-react';
import { StressRiskLevel } from '@/lib/enterpriseTypes';

interface BurnoutGradientBarProps {
  meanScore: number; // e.g. 74
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
      label: 'Nominal & Calibrated',
      color: 'emerald',
      bgPill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeColor: 'bg-emerald-500',
      clinicalInference: 'Optimal nocturnal cortisol nadir. Intact delta slow-wave sleep and zero systemic exhaustion risk.',
      leadershipAction: 'Sustain current scheduling pacing and baseline resilience rituals.',
    },
    {
      range: '36 – 60',
      label: 'Compensated Load',
      color: 'blue',
      bgPill: 'bg-blue-100 text-blue-800 border-blue-300',
      badgeColor: 'bg-blue-500',
      clinicalInference: 'Mild physiological strain. Autonomic coping intact with adequate weekend recovery windows.',
      leadershipAction: 'Monitor high-friction shifts; ensure no consecutive night duties exceed limits.',
    },
    {
      range: '61 – 80',
      label: 'Elevated Strain',
      color: 'amber',
      bgPill: 'bg-amber-100 text-amber-800 border-amber-300',
      badgeColor: 'bg-amber-500',
      clinicalInference: 'Follicular cortisol elevation. Impaired REM recovery, morning grogginess, and rising cognitive fatigue.',
      leadershipAction: 'Deploy evening digital curfews and restrict late administrative notifications.',
    },
    {
      range: '81 – 100',
      label: 'Critical Burnout Hotspot',
      color: 'rose',
      bgPill: 'bg-rose-100 text-rose-800 border-rose-300',
      badgeColor: 'bg-rose-600',
      clinicalInference: 'Severe HPA-axis dysregulation. Blunted diurnal slope, chronic fatigue, and acute attrition / medical error liability.',
      leadershipAction: 'Immediate institutional duty caps, post-call sleep protection, and roster restructuring required.',
    },
  ];

  const activeInference = selectedTier !== null ? TIERS[selectedTier] : TIERS[currentTier];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Top Title & Score Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Institutional Biological Standard
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Burnout Score Gradation & Clinical Inferences
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Four-tier clinical framework derived from 90-day follicular cortisol accumulation.
          </p>
        </div>

        {/* Current Organization Score Capsule */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-2xs self-start sm:self-auto">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Organization Mean
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">Score {meanScore}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-2xs ${TIERS[currentTier].bgPill}`}
          >
            {TIERS[currentTier].label}
          </span>
        </div>
      </div>

      {/* CONTINUOUS 4-COLOR GRADIENT BAR WITH FLOATING NEEDLE */}
      <div className="space-y-2 pt-2">
        <div className="relative">
          {/* Glowing Needle Indicator */}
          <div
            className="absolute -top-7 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500"
            style={{ left: `${Math.min(Math.max(meanScore, 4), 96)}%` }}
          >
            <div className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-black shadow-md flex items-center gap-1 whitespace-nowrap">
              <span>Mean: {meanScore}</span>
            </div>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-slate-900" />
          </div>

          {/* The Multi-Stop Color Bar */}
          <div className="h-5 sm:h-6 w-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 via-amber-500 to-rose-600 shadow-inner p-0.5 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]" />
            {/* Division Tick Marks */}
            <div className="absolute top-0 bottom-0 left-[35%] w-0.5 bg-white/70" />
            <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-white/70" />
            <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-white/70" />
          </div>
        </div>

        {/* Range Labels beneath Gradient */}
        <div className="grid grid-cols-4 text-center text-[10px] sm:text-xs font-extrabold text-slate-500 pt-1">
          <div className="text-left text-emerald-700">0 – 35 (Nominal)</div>
          <div className="text-center text-blue-700">36 – 60 (Compensated)</div>
          <div className="text-center text-amber-700">61 – 80 (Elevated)</div>
          <div className="text-right text-rose-700">81 – 100 (Critical)</div>
        </div>
      </div>

      {/* 4 INTERACTIVE TIER TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {TIERS.map((tier, idx) => {
          const isOrgTier = currentTier === idx;
          const isSelected = (selectedTier === idx) || (selectedTier === null && isOrgTier);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedTier(idx)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/50'
                  : 'bg-slate-50/70 text-slate-800 border-slate-200/80 hover:bg-slate-100/80'
              }`}
            >
              {isOrgTier && (
                <div className="absolute top-2.5 right-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse block" title="Current Organization Standing" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${tier.badgeColor}`} />
                <span className={`text-[10px] font-mono font-black ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {tier.range}
                </span>
              </div>
              <h4 className="text-xs font-black tracking-tight">{tier.label}</h4>
              <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {tier.clinicalInference}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Inference Detail Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-blue-900">
              Clinical Action for {activeInference.label} ({activeInference.range}):
            </span>
            <p className="text-blue-800 text-[11px] mt-0.5">
              {activeInference.leadershipAction}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Biomarker Validated</span>
        </div>
      </div>
    </div>
  );
};
