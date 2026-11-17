'use client';

import React, { useState } from 'react';
import { Sparkles, Scissors, SlidersHorizontal, BookOpen, ArrowRight, X, ShieldCheck, CheckCircle2, Droplets, Lock, Activity, Dna, Info, Calendar, Flame } from 'lucide-react';
import { HairCortisolSegment } from '@/lib/types';

interface InteractiveHairStrandViewerProps {
  segments: HairCortisolSegment[];
  activeSegmentId: 1 | 2 | 3;
  onSelectSegment: (id: 1 | 2 | 3) => void;
  onUpdateSegment: (id: 1 | 2 | 3, value: number) => void;
  onLoadSurgeScenario: () => void;
}

export const InteractiveHairStrandViewer = React.memo<InteractiveHairStrandViewerProps>(({
  segments,
  activeSegmentId,
  onSelectSegment,
  onUpdateSegment,
  onLoadSurgeScenario,
}) => {
  // Controlled state: Only show slidable editor when user presses the edit button
  const [editingSegmentId, setEditingSegmentId] = useState<number | null>(null);
  // Trapping modal explainer state
  const [isTrappingModalOpen, setIsTrappingModalOpen] = useState(false);

  // July: Hair Tip (2.0–3.0 cm, 60–90 Days Ago) -> Maps to Weeks 1 to 4 (id: 1)
  const segJuly = segments.find(s => s.id === 1) || {
    id: 1,
    segmentKey: 'month1' as const,
    title: 'July',
    anatomicalRegion: 'Hair Tip (2.0–3.0 cm)',
    distanceCm: '2.0–3.0 cm',
    timeWindow: '60–90 Days Ago (July)',
    cortisolPgPerMg: 11.2,
    referenceBaseline: 11.0,
    status: 'baseline' as const,
    clinicalStatusLabel: 'Normal Baseline',
    clinicalNote: 'Standard 25h weekly meetings and regular calendar schedule kept stress in a healthy, balanced range.',
  };
  // August: Mid-Shaft (1.0–2.0 cm, 30–60 Days Ago) -> Maps to Weeks 5 to 8 (id: 2)
  const segAugust = segments.find(s => s.id === 2) || {
    id: 2,
    segmentKey: 'month2' as const,
    title: 'August',
    anatomicalRegion: 'Mid-Shaft (1.0–2.0 cm)',
    distanceCm: '1.0–2.0 cm',
    timeWindow: '30–60 Days Ago (August)',
    cortisolPgPerMg: 28.4,
    referenceBaseline: 11.0,
    status: 'acute_surge' as const,
    clinicalStatusLabel: 'Stress Spike (Peak)',
    clinicalNote: 'Peak workload crunch with 47.5h meeting weeks, 11 calls after 7 PM, and 4 flights disrupted evening recovery routines.',
  };
  // September: Scalp Root (0.0–1.0 cm, Last 30 Days) -> Maps to Weeks 9 to 12 (id: 3)
  const segSeptember = segments.find(s => s.id === 3) || {
    id: 3,
    segmentKey: 'month3' as const,
    title: 'September',
    anatomicalRegion: 'Scalp Root (0.0–1.0 cm)',
    distanceCm: '0.0–1.0 cm',
    timeWindow: 'Last 30 Days (September)',
    cortisolPgPerMg: 15.6,
    referenceBaseline: 11.0,
    status: 'incomplete_recovery' as const,
    clinicalStatusLabel: 'Delayed Recovery',
    clinicalNote: 'Daytime meetings dropped by 32%, but taking 4 late calls/week after 7 PM delayed your recovery.',
  };

  const getStatusBadge = (val: number) => {
    if (val > 20.0) {
      return {
        label: 'Stress Spike',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        dot: 'bg-rose-500',
        hex: '#F43F5E',
        glow: 'rgba(244, 63, 94, 0.45)',
        strandColor: 'from-rose-500 to-rose-600',
      };
    }
    if (val > 14.0) {
      return {
        label: 'Delayed Recovery',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        dot: 'bg-amber-500',
        hex: '#F59E0B',
        glow: 'rgba(245, 158, 11, 0.35)',
        strandColor: 'from-amber-400 to-amber-500',
      };
    }
    return {
      label: 'Normal Baseline',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      dot: 'bg-emerald-500',
      hex: '#10B981',
      glow: 'rgba(16, 185, 129, 0.25)',
      strandColor: 'from-emerald-400 to-emerald-500',
    };
  };

  const getSurgeText = (val: number, base: number = 11.0) => {
    const delta = Math.round(((val - base) / base) * 100);
    if (delta > 0) return `+${delta}% vs baseline`;
    if (delta < 0) return `${Math.abs(delta)}% below baseline`;
    return 'At optimal baseline';
  };

  const getJulyDescription = (val: number) => {
    if (val > 20) return 'Elevated historic stress baseline with heavy quarterly kickoff commitments and travel disruptions.';
    if (val > 14) return 'Mildly elevated baseline workload with early project sprints and minor schedule friction.';
    return 'Standard 25h weekly meetings and regular calendar schedule kept stress in a healthy, balanced range.';
  };

  const getAugustDescription = (val: number) => {
    if (val > 20) return 'Peak workload crunch with high meeting density and 11 late calls after 7 PM caused severe stress spikes.';
    if (val > 14) return 'Moderately elevated workload with sporadic evening calls caused schedule friction and intermediate cortisol climb.';
    return 'Standard balanced schedule with protected evening hours kept cortisol comfortably in the healthy baseline zone.';
  };

  const getSeptemberDescription = (val: number) => {
    if (val > 20) return 'Active stress spike continues. Heavy meeting load and late calls past 7 PM are sustaining elevated cortisol.';
    if (val > 14) return 'Daytime meetings dropped by 32%, but taking 4 late calls/week after 7 PM delayed full biological recovery.';
    return 'Workload returned to healthy baseline; minimal evening calls and restored calendar boundaries brought cortisol back to baseline.';
  };

  // Physical orientation:
  // Top: July (Hair Tip, 2.0–3.0 cm, 60–90 Days Ago) -> id: 1
  // Middle: August (Mid-Shaft, 1.0–2.0 cm, 30–60 Days Ago) -> id: 2
  // Bottom: September (Scalp Root Bulb, 0.0–1.0 cm, Last 30 Days) -> id: 3
  const segmentList = [
    {
      seg: segJuly,
      id: 1 as 1 | 2 | 3,
      num: 'Jul',
      nodeX: 58.5,
      nodeY: 55,
      monthTitle: 'July',
      surgePercent: getSurgeText(segJuly.cortisolPgPerMg, 11.0),
      description: getJulyDescription(segJuly.cortisolPgPerMg),
      accentColor: 'border-emerald-400',
      bgActive: 'bg-emerald-50/40 ring-1 ring-emerald-300',
    },
    {
      seg: segAugust,
      id: 2 as 1 | 2 | 3,
      num: 'Aug',
      nodeX: 47,
      nodeY: 155,
      monthTitle: 'August',
      surgePercent: getSurgeText(segAugust.cortisolPgPerMg, 11.0),
      description: getAugustDescription(segAugust.cortisolPgPerMg),
      accentColor: 'border-rose-400',
      bgActive: 'bg-rose-50/40 ring-1 ring-rose-300',
    },
    {
      seg: segSeptember,
      id: 3 as 1 | 2 | 3,
      num: 'Sep',
      nodeX: 44.5,
      nodeY: 255,
      monthTitle: 'September',
      surgePercent: getSurgeText(segSeptember.cortisolPgPerMg, 11.0),
      description: getSeptemberDescription(segSeptember.cortisolPgPerMg),
      accentColor: 'border-amber-400',
      bgActive: 'bg-amber-50/40 ring-1 ring-amber-300',
    },
  ];

  // ---- Strand illustration geometry (viewBox 720 x 200). Tip on the left, scalp on the right:
  // time reads left to right, July to September. Each centimetre of hair is 200 units.
  const X0 = 40;
  const X1 = 640;
  const CY = 100;
  const centerY = (x: number) => CY - 9 * Math.sin((Math.min(Math.max(x, X0), X1) - X0) / (X1 - X0) * Math.PI);
  const halfWidth = (x: number) => 2 + 9.5 * Math.pow((Math.min(Math.max(x, X0), X1) - X0) / (X1 - X0), 0.8);
  const strandPath = (() => {
    const top: string[] = [];
    const bottom: string[] = [];
    const steps = 64;
    for (let i = 0; i <= steps; i++) {
      const x = X0 + ((X1 + 30 - X0) * i) / steps;
      top.push(`${x.toFixed(1)},${(centerY(x) - halfWidth(x)).toFixed(1)}`);
      bottom.unshift(`${x.toFixed(1)},${(centerY(x) + halfWidth(x)).toFixed(1)}`);
    }
    return `M${top.join(' L')} L${bottom.join(' L')} Z`;
  })();
  const sheenPath = (() => {
    const pts: string[] = [];
    for (let i = 0; i <= 48; i++) {
      const x = X0 + 30 + ((X1 - X0 - 40) * i) / 48;
      pts.push(`${x.toFixed(1)},${(centerY(x) - halfWidth(x) * 0.45).toFixed(1)}`);
    }
    return `M${pts.join(' L')}`;
  })();
  // Cortisol dots: more dots for a higher reading, placed the same way on every render.
  const cortisolDots = (index: number, value: number) => {
    const count = Math.max(3, Math.min(20, Math.round(value / 1.9)));
    const xa = X0 + index * 200 + 26;
    let seed = (index + 1) * 9301 + 49297;
    const rand = () => {
      seed = (seed * 233280 + 12345) % 2147483647;
      return (seed % 10000) / 10000;
    };
    return Array.from({ length: count }, () => {
      const x = xa + rand() * 148;
      const above = rand() > 0.5;
      const offset = halfWidth(x) + 6 + rand() * 16;
      return { x, y: centerY(x) + (above ? -offset : offset), r: 2.6 + rand() * 1.8 };
    });
  };

  const peak = segmentList.reduce((a, b) => (b.seg.cortisolPgPerMg > a.seg.cortisolPgPerMg ? b : a));
  const peakIsHigh = peak.seg.cortisolPgPerMg > 14.0;
  const valueColor = (val: number) => (val > 20 ? 'text-rose-600' : val > 14 ? 'text-amber-600' : 'text-emerald-700');

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 transition-all font-sans space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">Your 90-day hair timeline</div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {peakIsHigh ? `Your stress peaked in ${peak.monthTitle}.` : 'Your three months look steady.'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {peakIsHigh
              ? `${peak.seg.cortisolPgPerMg} pg/mg in that centimetre of hair (${peak.surgePercent}). Healthy is below 14.0.`
              : 'Every centimetre is below 14.0 pg/mg, the upper end of the healthy range.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setIsTrappingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#BF6F4E]" />
            <span>How hair traps cortisol</span>
          </button>
          <button
            type="button"
            onClick={onLoadSurgeScenario}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-500 border border-slate-200 transition-colors cursor-pointer"
            title="Reset to the sample case values"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reset sample</span>
          </button>
        </div>
      </div>

      {/* Illustration: one strand, three centimetres, three months */}
      <div className="rounded-2xl border border-[#EFE6DA] bg-gradient-to-b from-[#FBF7F2] to-white px-2 sm:px-4 pt-4 pb-3" data-testid="hair-illustration">
        {/* Month labels, aligned with the three centimetres of the strand */}
        <div className="grid grid-cols-3" style={{ paddingLeft: '5.55%', paddingRight: '11.1%' }}>
          {segmentList.map(({ seg, id, monthTitle }) => {
            const isActive = activeSegmentId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectSegment(id)}
                aria-pressed={isActive}
                className={`text-center rounded-xl py-1.5 mx-0.5 transition-colors cursor-pointer ${isActive ? 'bg-white shadow-xs ring-1 ring-slate-200' : 'hover:bg-white/70'}`}
              >
                <div className="text-[11px] sm:text-xs font-bold text-slate-500">{monthTitle}</div>
                <div className={`text-base sm:text-xl font-black font-mono leading-tight ${valueColor(seg.cortisolPgPerMg)}`}>
                  {seg.cortisolPgPerMg}
                </div>
              </button>
            );
          })}
        </div>

        <svg viewBox="0 36 720 152" className="w-full h-auto block" role="img" aria-label="Hair strand divided into three one-centimetre segments, one per month, with more cortisol dots where the reading is higher">
          <defs>
            <linearGradient id="hairKeratin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5A4336" />
              <stop offset="100%" stopColor="#1F1613" />
            </linearGradient>
          </defs>

          {/* Scalp: epidermis band and dermis, with the follicle bulb inside */}
          <rect x="640" y="40" width="72" height="122" rx="16" fill="#E8B49C" />
          <rect x="651" y="40" width="61" height="122" rx="14" fill="#F6DDCB" />
          <ellipse cx="676" cy={centerY(X1)} rx="18" ry="14" fill="#3A2A22" />
          <ellipse cx="685" cy={centerY(X1)} rx="6" ry="5" fill="#C9634C" opacity="0.85" />

          {/* One capsule per centimetre, tinted by that month's reading */}
          {segmentList.map(({ seg, id }, index) => {
            const badge = getStatusBadge(seg.cortisolPgPerMg);
            const isActive = activeSegmentId === id;
            const xa = X0 + index * 200 + 5;
            return (
              <g key={id} onClick={() => onSelectSegment(id)} style={{ cursor: 'pointer' }}>
                <rect
                  x={xa}
                  y={CY - 52}
                  width={190}
                  height={96}
                  rx={48}
                  fill={badge.hex}
                  fillOpacity={isActive ? 0.2 : 0.1}
                  stroke={badge.hex}
                  strokeOpacity={isActive ? 0.95 : 0.45}
                  strokeWidth={isActive ? 3 : 1.5}
                  style={{ transition: 'all 200ms ease' }}
                />
              </g>
            );
          })}

          {/* The strand: thin at the tip, thicker toward the scalp */}
          <path d={strandPath} fill="url(#hairKeratin)" />
          <path d={sheenPath} fill="none" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="1.6" strokeLinecap="round" />

          {/* Cortisol dots: more of them where the reading is higher */}
          {segmentList.map(({ seg, id }, index) => (
            <g key={`dots-${id}`} pointerEvents="none">
              {cortisolDots(index, seg.cortisolPgPerMg).map((dot, i) => (
                <circle key={i} cx={dot.x} cy={dot.y} r={dot.r} fill="#F6B73C" stroke="#D98A1B" strokeWidth="0.8" />
              ))}
            </g>
          ))}

          {/* Centimetre ruler */}
          <g stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round">
            <line x1={X0} y1="172" x2={X1} y2="172" />
            {[0, 1, 2, 3].map(i => (
              <line key={i} x1={X0 + i * 200} y1="165" x2={X0 + i * 200} y2="179" />
            ))}
            {[0, 1, 2].map(i => (
              <line key={`h-${i}`} x1={X0 + i * 200 + 100} y1="168" x2={X0 + i * 200 + 100} y2="176" strokeWidth="1" />
            ))}
          </g>
        </svg>

        {/* Ruler labels */}
        <div className="flex justify-between text-[10px] sm:text-[11px] font-semibold text-slate-500 -mt-1" style={{ paddingLeft: '3%', paddingRight: '8.6%' }}>
          <span>3 cm · tip</span>
          <span>2 cm</span>
          <span>1 cm</span>
          <span>0 cm · scalp</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F6B73C] border border-[#D98A1B]" />
            Cortisol stored in the hair
          </span>
          <span>1 cm of hair is about 1 month</span>
          <span>The tip is 3 months ago, the scalp end is this month</span>
        </div>
      </div>

      {/* Month cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {segmentList.map(({ seg, id, monthTitle, surgePercent, description }) => {
          const isActive = activeSegmentId === id;
          const isEditing = editingSegmentId === id;
          const badge = getStatusBadge(seg.cortisolPgPerMg);

          return (
            <div
              key={id}
              onClick={() => onSelectSegment(id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isActive ? 'bg-white shadow-card' : 'bg-slate-50/60 border-slate-200/80 hover:bg-white'
              }`}
              style={isActive ? { borderColor: badge.hex } : undefined}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{monthTitle}</div>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className={`text-2xl font-black font-mono ${valueColor(seg.cortisolPgPerMg)}`}>{seg.cortisolPgPerMg}</span>
                    <span className="text-[10px] text-slate-400">pg/mg</span>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500">{surgePercent}</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{description}</p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSegment(id);
                  setEditingSegmentId(isEditing ? null : id);
                }}
                className={`mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  isEditing ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title={isEditing ? 'Done editing' : `Edit ${monthTitle} cortisol value`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{isEditing ? 'Done' : 'Edit value'}</span>
              </button>

              {isEditing && (
                <div onClick={(e) => e.stopPropagation()} className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 animate-fade-in space-y-1.5">
                  <input
                    type="range"
                    min="5.0"
                    max="38.0"
                    step="0.2"
                    value={seg.cortisolPgPerMg}
                    onChange={e => onUpdateSegment(id, parseFloat(e.target.value))}
                    aria-label={`${monthTitle} cortisol in pg/mg`}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#BF6F4E]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5.0</span>
                    <span>14.0 healthy limit</span>
                    <span>38.0</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ENGAGING CORTISOL TRAPPING EXPLAINER MODAL */}
      {isTrappingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsTrappingModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trapping-modal-title"
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-7 flex flex-col gap-5 text-slate-900 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsTrappingModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#0D4F59] text-[11px] font-mono font-bold uppercase tracking-wider mb-2 border border-blue-100">
                <Dna className="w-3.5 h-3.5" />
                Biological Chrono-Marker
              </div>
              <h2 id="trapping-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                How Cortisol Gets Trapped in Your Hair Every Single Day
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Why segmental hair testing is the gold standard for measuring chronic stress and burnout—acting as an unalterable biological tree ring.
              </p>
            </div>

            {/* Step-by-Step Trapping Mechanism Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                The 3-Step Daily Trapping Process
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Step 1 */}
                <div className="p-3.5 rounded-xl bg-gradient-to-b from-rose-50/70 to-white border border-rose-100 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black text-xs font-mono mb-2 shadow-xs">
                      01
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">Capillary Delivery</h4>
                    <p className="text-[11.5px] text-slate-600 mt-1.5 leading-relaxed">
                      Microcapillaries surrounding the dermal papilla continuously bathe the hair bulb with blood carrying free, active cortisol molecules circulating from your adrenal glands.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-rose-100/70 text-[10px] font-mono text-rose-600 font-bold">
                    Blood → Follicle Bulb
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-xl bg-gradient-to-b from-amber-50/70 to-white border border-amber-100 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs font-mono mb-2 shadow-xs">
                      02
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">Keratin Lock</h4>
                    <p className="text-[11.5px] text-slate-600 mt-1.5 leading-relaxed">
                      Rapidly dividing matrix cells absorb cortisol. As they push upward, they harden into solid keratin protein. The cortisol becomes permanently locked inside the hair shaft core.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-amber-100/70 text-[10px] font-mono text-amber-700 font-bold">
                    Permanently Sealed
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-xl bg-gradient-to-b from-blue-50/70 to-white border border-blue-100 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-[#0D4F59] text-white flex items-center justify-center font-black text-xs font-mono mb-2 shadow-xs">
                      03
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">1 cm = 30 Days</h4>
                    <p className="text-[11.5px] text-slate-600 mt-1.5 leading-relaxed">
                      Human scalp hair grows at a steady ~1.0 cm per month (~0.33 mm/day). Each segment preserves an inviolable historical record of your stress levels across that exact month.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-blue-100/70 text-[10px] font-mono text-blue-600 font-bold">
                    Biological Tree Rings
                  </div>
                </div>
              </div>
            </div>

            {/* Head-to-Head Comparison: Hair vs Blood vs Saliva */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0D4F59]" />
                Why Hair Outperforms Blood & Saliva Tests
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Traditional Blood/Saliva */}
                <div className="p-3 rounded-lg bg-white border border-slate-200">
                  <div className="font-extrabold text-slate-800 flex items-center gap-1.5 mb-1 text-[13px]">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Blood & Saliva (Acute Snapshot)
                  </div>
                  <ul className="space-y-1.5 text-slate-600 text-[11.5px] mt-2">
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold"></span>
                      <span>Only captures a 15-minute point in time.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold"></span>
                      <span>Distorted by coffee, exercise, commute, or needle anxiety.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold"></span>
                      <span>Cannot distinguish temporary stress from 3-month burnout.</span>
                    </li>
                  </ul>
                </div>

                {/* Hair Cortisol */}
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                  <div className="font-extrabold text-[#0D4F59] flex items-center gap-1.5 mb-1 text-[13px]">
                    <span className="w-2 h-2 rounded-full bg-[#0D4F59]" />
                    Hair Cortisol (Chronic Retrospective)
                  </div>
                  <ul className="space-y-1.5 text-slate-700 text-[11.5px] mt-2">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Cumulative 24/7 record of true allostatic load.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Zero noise from hourly circadian spikes or acute events.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Segmental slicing reveals month-by-month burnout trends.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Summary & Action */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
              <p className="text-xs text-slate-500 font-medium">
                By segmenting your 3 cm hair sample, BAALANCE reconstructed your July, August, and September stress timeline.
              </p>
              <button
                type="button"
                onClick={() => setIsTrappingModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                Back to Hair Strand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
