'use client';

import React from 'react';
import { Sparkles, Upload, ChevronDown, ChevronUp, Droplet, CalendarClock, Clock, Plane } from 'lucide-react';
import type { HairCortisolSegment } from '@/lib/types';

interface StressScoreCardProps {
  score: number;
  segments: HairCortisolSegment[];
  totalMeetingHours: number;
  totalEveningCalls: number;
  totalFlights: number;
  /** The AI's (or the rule-based fallback's) one-paragraph explanation. */
  rootCause?: string;
  isSynthesizing: boolean;
  onRecalculate: () => void;
  onImportReport: () => void;
  showBreakdown: boolean;
  onToggleBreakdown: () => void;
}

const ZONES = [
  { from: 0, to: 35, label: 'Healthy', range: '0 to 35', color: '#10B981' },
  { from: 35, to: 60, label: 'Manageable', range: '36 to 60', color: '#38BDF8' },
  { from: 60, to: 80, label: 'High', range: '61 to 80', color: '#F59E0B' },
  { from: 80, to: 100, label: 'Very high', range: '81 to 100', color: '#F43F5E' },
];

const VERDICT = [
  { above: 80, title: 'Very high stress load', note: 'Worth acting on now.' },
  { above: 60, title: 'High stress load', note: 'Your evenings are carrying too much.' },
  { above: 35, title: 'Manageable', note: 'Normal pressure, keep an eye on it.' },
  { above: -1, title: 'Healthy range', note: 'Your body is recovering well.' },
];

// Half-circle gauge: 0 on the left, 100 on the right.
const CX = 120;
const CY = 118;
const R = 92;
const point = (score: number, radius = R) => {
  const theta = Math.PI * (1 - Math.min(Math.max(score, 0), 100) / 100);
  return { x: CX + radius * Math.cos(theta), y: CY - radius * Math.sin(theta) };
};
const arc = (from: number, to: number) => {
  const a = point(from);
  const b = point(to);
  return `M${a.x.toFixed(2)} ${a.y.toFixed(2)} A${R} ${R} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
};

export const StressScoreCard: React.FC<StressScoreCardProps> = ({
  score,
  segments,
  totalMeetingHours,
  totalEveningCalls,
  totalFlights,
  rootCause,
  isSynthesizing,
  onRecalculate,
  onImportReport,
  showBreakdown,
  onToggleBreakdown,
}) => {
  const safeScore = Math.round(Math.min(Math.max(score, 0), 100));
  const zone = ZONES.find(z => safeScore <= z.to) || ZONES[ZONES.length - 1];
  const verdict = VERDICT.find(v => safeScore > v.above) || VERDICT[VERDICT.length - 1];
  const marker = point(safeScore);
  const ordered = [...segments].sort((a, b) => a.id - b.id);
  const maxCortisol = Math.max(30, ...ordered.map(s => s.cortisolPgPerMg));
  const weeklyHours = Math.round(totalMeetingHours / 12);

  const inputs = [
    { icon: CalendarClock, label: 'Meetings after 7 PM', value: String(totalEveningCalls), unit: 'in 90 days' },
    { icon: Clock, label: 'Meeting hours', value: String(weeklyHours), unit: 'per week' },
    { icon: Plane, label: 'Flights', value: String(totalFlights), unit: 'in 90 days' },
  ];

  return (
    <section
      className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-6 font-sans"
      aria-label="Three-month stress score"
      data-testid="stress-score-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">Hair and calendar combined</div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">Your 3-month stress score</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            One number from your hair cortisol and your calendar load. Healthy is below 35.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={onRecalculate}
            disabled={isSynthesizing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 transition-colors cursor-pointer disabled:opacity-60"
            title="Recalculate the stress score with AI"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#BF6F4E] ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Updating with AI…' : 'Recalculate with AI'}</span>
          </button>
          <button
            type="button"
            onClick={onImportReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Import a new hair cortisol lab report"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import lab report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 items-center">
        {/* Gauge */}
        <div className="rounded-2xl border border-[#EFE6DA] bg-gradient-to-b from-[#FBF7F2] to-white p-5 flex flex-col items-center">
          <div className="relative w-full max-w-[280px]">
            <svg viewBox="0 0 240 132" className="w-full h-auto block" role="img" aria-label={`Stress score ${safeScore} out of 100, ${zone.label.toLowerCase()} zone`}>
              {ZONES.map(z => (
                <path
                  key={z.label}
                  d={arc(z.from + (z.from === 0 ? 0 : 1), z.to - (z.to === 100 ? 0 : 1))}
                  fill="none"
                  stroke={z.color}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeOpacity={z === zone ? 1 : 0.28}
                  style={{ transition: 'stroke-opacity 300ms ease' }}
                />
              ))}
              <circle cx={marker.x} cy={marker.y} r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" style={{ transition: 'all 300ms ease' }} />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center select-none">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 leading-none">{safeScore}</span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="text-sm font-extrabold" style={{ color: zone.color }}>{verdict.title}</div>
            <div className="text-xs text-slate-600 mt-0.5">{verdict.note}</div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-1.5 w-full text-center">
            {ZONES.map(z => (
              <div key={z.label} className={`rounded-lg py-1 ${z === zone ? 'bg-white ring-1 ring-slate-200 shadow-2xs' : ''}`}>
                <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: z.color }} />
                  {z.label}
                </div>
                <div className="text-[10px] text-slate-400">{z.range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* What goes into it */}
        <div className="space-y-3">
          <div className="text-xs font-extrabold text-slate-900">What goes into this score</div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <Droplet className="w-3.5 h-3.5" />
              <span>Hair cortisol, month by month (pg/mg)</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 items-end">
              {ordered.map(seg => {
                const v = seg.cortisolPgPerMg;
                const color = v > 20 ? '#F43F5E' : v > 14 ? '#F59E0B' : '#10B981';
                return (
                  <div key={seg.id} className="text-center">
                    <div className="h-16 flex items-end justify-center">
                      <div
                        className="w-full max-w-[56px] rounded-t-lg"
                        style={{ height: `${Math.max(12, (v / maxCortisol) * 100)}%`, backgroundColor: color, transition: 'height 300ms ease' }}
                      />
                    </div>
                    <div className="text-sm font-black font-mono text-slate-900 mt-1">{v}</div>
                    <div className="text-[10px] font-semibold text-slate-500">{seg.title}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {inputs.map(item => (
              <div key={item.label} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                <item.icon className="w-3.5 h-3.5 text-slate-400" />
                <div className="text-lg font-black font-mono text-slate-900 leading-tight mt-1">{item.value}</div>
                <div className="text-[10px] font-semibold text-slate-600 leading-tight">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.unit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onToggleBreakdown}
          aria-expanded={showBreakdown}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
        >
          <span>{showBreakdown ? 'Hide the explanation' : 'How this is calculated, and the likely cause'}</span>
          {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showBreakdown && (
          <div id="score-breakdown" className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 animate-fade-in">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <div className="text-xs font-extrabold text-slate-900">1. Hair cortisol</div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Measured along 3 cm of hair, 1 cm per month:{' '}
                {ordered.map(s => `${s.title} ${s.cortisolPgPerMg}`).join(', ')} pg/mg. Healthy is below 14.0.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <div className="text-xs font-extrabold text-slate-900">2. Calendar workload</div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {Math.round(totalMeetingHours)} meeting hours over 12 weeks, {totalEveningCalls} meetings after 7 PM and{' '}
                {totalFlights} flights in the same period.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-[#EFE6DA] bg-[#FBF7F2]">
              <div className="text-xs font-extrabold text-[#8A4B32]">Most likely cause</div>
              <p className="text-xs text-slate-700 leading-relaxed mt-1">
                {rootCause ||
                  `The months with the most meetings after 7 PM line up with your highest hair cortisol. Late meetings are the first thing to change.`}
              </p>
            </div>
            <p className="md:col-span-3 text-[11px] text-slate-500">
              The score is a guide for spotting trends, not a diagnosis. An association with your calendar is not proof of cause.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
