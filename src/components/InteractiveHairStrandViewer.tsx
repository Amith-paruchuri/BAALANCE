'use client';

import React, { useState } from 'react';
import { Sparkles, Scissors, SlidersHorizontal, BookOpen, ArrowRight, X, ShieldCheck, CheckCircle2, Droplets, Lock, Activity, Dna, Info, Calendar } from 'lucide-react';
import { HairCortisolSegment } from '@/lib/types';

interface InteractiveHairStrandViewerProps {
  segments: HairCortisolSegment[];
  activeSegmentId: 1 | 2 | 3;
  onSelectSegment: (id: 1 | 2 | 3) => void;
  onUpdateSegment: (id: 1 | 2 | 3, value: number) => void;
  onLoadSurgeScenario: () => void;
}

export const InteractiveHairStrandViewer: React.FC<InteractiveHairStrandViewerProps> = ({
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

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 sm:p-6 transition-all font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3186FF] animate-pulse" />
            <h3 className="text-sm sm:text-base font-bold text-black tracking-tight">
              Interactive 3cm Hair Strand Timeline
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              1 cm = 30 Days
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              Baseline: 11.0 pg/mg
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Biological hair follicle timeline • Tap any node or card to inspect, and click Edit to test values
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsTrappingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Read more on Cortisol trapping"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#3186FF]" />
            <span>Cortisol Trapping</span>
          </button>
          <button
            onClick={onLoadSurgeScenario}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-bold text-[#3186FF] border border-blue-200 transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Reset to 90-day workload surge benchmark"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3186FF]" />
            <span>Reset Demo Case</span>
          </button>
        </div>
      </div>

      {/* Phone-Optimized Layout: Authentic Logo-Style Hair Follicle on Left + Segment Cards on Right */}
      <div className="mt-4 grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-3 sm:gap-5 items-stretch">
        
        {/* LEFT COLUMN: AUTHENTIC LOGO-STYLE HAIR FOLLICLE (Reduced height & increased breadth) */}
        <div className="relative flex flex-col items-center justify-between select-none py-1 h-full min-h-[320px] sm:min-h-[350px]">
          <svg
            viewBox="0 0 100 350"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Biological Cortisol Halo Glow Filter */}
              <filter id="strandNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Obsidian Keratin Gradient matching Baalance Logo */}
              <linearGradient id="follicleShaftGrad" x1="0%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#0B1320" />
                <stop offset="35%" stopColor="#1E293B" />
                <stop offset="70%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>

              {/* Main Dermis Warm Skin Tone Gradient */}
              <linearGradient id="skinDermisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDBFA0" />
                <stop offset="45%" stopColor="#F8AD8C" />
                <stop offset="100%" stopColor="#F49A76" />
              </linearGradient>

              {/* Top Epidermis Rosy Pink Layer Gradient */}
              <linearGradient id="skinEpidermisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FCA5A5" />
                <stop offset="60%" stopColor="#F87171" />
                <stop offset="100%" stopColor="#FB7185" />
              </linearGradient>

              {/* Clip path for rounded skin block at base */}
              <clipPath id="skinBlockClip">
                <rect x="7" y="290" width="86" height="56" rx="8" ry="8" />
              </clipPath>

              {/* Blood Vessel Capillary Glow Filter */}
              <filter id="vesselGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Cortisol Steroid Hormone Molecule Glow */}
              <filter id="cortisolGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. SKIN BLOCK (EPIDERMIS & DERMIS) SUBMERGING ONLY THE HAIR BULB & BASE */}
            <g className="skin-block-container pointer-events-none">
              {/* Subtle outer border for skin block */}
              <rect
                x="7"
                y="290"
                width="86"
                height="56"
                rx="8"
                ry="8"
                fill="none"
                stroke="#F472B6"
                strokeWidth="1.2"
                opacity="0.35"
              />

              <g clipPath="url(#skinBlockClip)">
                {/* Main Dermis Tissue */}
                <rect
                  x="7"
                  y="290"
                  width="86"
                  height="56"
                  fill="url(#skinDermisGrad)"
                />

                {/* Subtle Dermal Tissue Spots */}
                <g fill="#EA8E6F" opacity="0.22">
                  <circle cx="20" cy="320" r="2.5" />
                  <circle cx="78" cy="322" r="3" />
                  <circle cx="25" cy="340" r="3" />
                  <circle cx="72" cy="342" r="2.5" />
                </g>

                {/* Top Epidermis Pink Layer */}
                <path
                  d="M 5 290 L 95 290 L 95 304 Q 87 301, 80 304 Q 72 307, 65 304 Q 57 301, 50 304 Q 42 307, 35 304 Q 27 301, 20 304 Q 12 307, 5 304 Z"
                  fill="url(#skinEpidermisGrad)"
                />

                {/* Epidermal Stratum Corneum Highlight Line at Top Surface */}
                <path
                  d="M 7 290 Q 50 288, 93 290"
                  stroke="#FFF0EB"
                  strokeWidth="1.8"
                  fill="none"
                />

                {/* Wavy Interpapillary Rete Ridges (Boundary between Epidermis and Dermis) */}
                <path
                  d="M 5 304 Q 12 307, 20 304 Q 27 301, 35 304 Q 42 307, 50 304 Q 57 301, 65 304 Q 72 307, 80 304 Q 87 301, 95 304"
                  fill="none"
                  stroke="#F472B6"
                  strokeWidth="1.2"
                  opacity="0.45"
                />
              </g>
            </g>

            {/* 2. THE TAPERED HAIR SHAFT (Increased breadth, natural taper to tip) */}
            <g
              className="hair-shaft-group cursor-pointer transition-transform duration-200 hover:scale-102"
              onClick={() => onSelectSegment(1)}
            >
              <title>Hair Strand (Tapered Distal Tip • July)</title>
              {/* Soft ambient grounding shadow */}
              <path
                d="M 38 318 C 36 220, 48 115, 64 16 Q 66 14, 68 16 C 56 115, 50 220, 54 318 Z"
                fill="#0F172A"
                opacity="0.16"
                transform="translate(1.2, 1.2)"
              />

              {/* Main Tapered Obsidian Keratin Body (Broader breadth for clear visibility) */}
              <path
                d="M 38 318 C 36 220, 48 115, 64 16 Q 66 14, 68 16 C 56 115, 50 220, 54 318 Z"
                fill="url(#follicleShaftGrad)"
              />

              {/* Natural Sheen Reflection Highlight along the Curve */}
              <path
                d="M 43 285 C 41 210, 52 105, 65 22"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Organic Cuticle Texture Notches (Keratin scales along the shaft) */}
              <g stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round">
                <line x1="39" y1="280" x2="47" y2="278" />
                <line x1="38" y1="240" x2="47" y2="238" />
                <line x1="41" y1="195" x2="50" y2="193" />
                <line x1="45" y1="150" x2="54" y2="148" />
                <line x1="50" y1="105" x2="58" y2="103" />
                <line x1="56" y1="65" x2="63" y2="63" />
                <line x1="61" y1="35" x2="66" y2="33" />
              </g>

              {/* Exact Equal 1.0 cm (30-Day) Segment Boundary Dividers on Hair Shaft */}
              <g stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" opacity="0.85">
                {/* 2.0 cm divider between July and August */}
                <line x1="46" y1="107" x2="59" y2="107" />
                {/* 1.0 cm divider between August and September */}
                <line x1="38" y1="198" x2="52" y2="198" />
              </g>
            </g>

            {/* Physical 1.0 cm / 30-Day Growth Scale on Left Margin */}
            <g className="hair-scale-ticks pointer-events-none select-none">
              {/* Vertical guideline */}
              <line
                x1="16"
                y1="16"
                x2="16"
                y2="290"
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.45"
              />

              {/* 3 cm (Tip / 90 Days) */}
              <line x1="12" y1="16" x2="64" y2="16" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
              <text x="10" y="18.5" textAnchor="end" fontSize="6.5" fontWeight="700" fill="#64748B" fontFamily="monospace">3cm</text>

              {/* 2 cm (July/Aug Boundary / 60 Days) */}
              <line x1="12" y1="107" x2="46" y2="107" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <text x="10" y="109.5" textAnchor="end" fontSize="6.5" fontWeight="700" fill="#0284C7" fontFamily="monospace">2cm</text>

              {/* 1 cm (Aug/Sep Boundary / 30 Days) */}
              <line x1="12" y1="198" x2="38" y2="198" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <text x="10" y="200.5" textAnchor="end" fontSize="6.5" fontWeight="700" fill="#0284C7" fontFamily="monospace">1cm</text>

              {/* 0 cm (Scalp Root Entry) */}
              <line x1="12" y1="290" x2="37" y2="290" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
              <text x="10" y="292.5" textAnchor="end" fontSize="6.5" fontWeight="700" fill="#64748B" fontFamily="monospace">0cm</text>
            </g>

            {/* Active connecting beam / directional arrow toward right card (precision aligned) */}
            {(() => {
              const activeItem = segmentList.find(s => s.id === activeSegmentId);
              if (!activeItem) return null;
              const targetY = activeItem.id === 1 ? 52 : activeItem.id === 2 ? 165 : 278;
              return (
                <g className="animate-fade-in pointer-events-none">
                  <path
                    d={`M ${activeItem.nodeX + 13} ${activeItem.nodeY} C ${activeItem.nodeX + 28} ${activeItem.nodeY}, 80 ${targetY}, 97 ${targetY}`}
                    fill="none"
                    stroke="#3186FF"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                    opacity="0.9"
                  />
                  <polygon
                    points={`97,${targetY - 3.5} 97,${targetY + 3.5} 100,${targetY}`}
                    fill="#3186FF"
                  />
                </g>
              );
            })()}

            {/* 3. SUBMERGED ANATOMICAL FOLLICLE BULB AT BASE (Embedded inside dermis • September) */}
            <g
              className="follicle-bulb cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() => onSelectSegment(3)}
            >
              <title>Submerged Follicle Bulb (Scalp Root • 0.0 cm • September)</title>
              {/* Outer follicle bulb envelope directly embedded in dermis */}
              <ellipse
                cx="46"
                cy="320"
                rx="13"
                ry="16"
                fill="#0F172A"
                stroke="#FFFFFF"
                strokeWidth="1.8"
              />
              {/* Inner dermal papilla biological core */}
              <ellipse
                cx="46"
                cy="321"
                rx="7"
                ry="9"
                fill="#1E293B"
              />
              {/* Bio-nucleus / capillary loop with cyan pulse */}
              <circle
                cx="46"
                cy="318"
                r="3"
                fill="#38BDF8"
                opacity="0.9"
              />
              <circle
                cx="46"
                cy="318"
                r="5.5"
                fill="#38BDF8"
                opacity="0.3"
                className="animate-pulse"
              />
            </g>

            {/* 4. MICRO-VASCULAR CAPILLARY BLOOD VESSELS (Cupping & entering the submerged bulb) */}
            <g
              className="capillary-blood-vessels pointer-events-none"
              filter="url(#vesselGlow)"
            >
              {/* Left feeder arteriole */}
              <path
                d="M 18 344 C 23 336, 30 330, 46 320"
                fill="none"
                stroke="#E11D48"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.85"
              />
              {/* Left branching loop */}
              <path
                d="M 25 338 C 29 333, 34 329, 40 327"
                fill="none"
                stroke="#FB7185"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.75"
              />
              {/* Right draining venule / capillary */}
              <path
                d="M 74 344 C 69 336, 62 330, 46 320"
                fill="none"
                stroke="#E11D48"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.85"
              />
              {/* Right branching loop */}
              <path
                d="M 67 338 C 63 333, 58 329, 52 327"
                fill="none"
                stroke="#FB7185"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.75"
              />
              {/* Central dermal papilla ascending loop entering bulb core */}
              <path
                d="M 46 346 C 46 338, 46 328, 46 320"
                fill="none"
                stroke="#BE123C"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>

            {/* 5. RECURRING STREAM: SMALL CIRCULAR CORTISOL MOLECULES CONTINUOUSLY ENTERING BULB */}
            <g className="cortisol-molecules-stream pointer-events-none">
              {/* Molecule 1: Left arteriole stream */}
              <g filter="url(#cortisolGlow)">
                <circle r="2.2" fill="#F59E0B">
                  <animateMotion
                    path="M 18 344 C 23 336, 30 330, 46 320"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin="0s"
                  />
                  <animate
                    attributeName="opacity"
                    values="0; 1; 1; 0.9; 0"
                    keyTimes="0; 0.15; 0.75; 0.9; 1"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin="0s"
                  />
                </circle>
                <circle r="1" fill="#FFFFFF">
                  <animateMotion
                    path="M 18 344 C 23 336, 30 330, 46 320"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin="0s"
                  />
                  <animate
                    attributeName="opacity"
                    values="0; 1; 1; 0"
                    keyTimes="0; 0.2; 0.85; 1"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin="0s"
                  />
                </circle>
              </g>

              {/* Molecule 2: Right capillary stream */}
              <g filter="url(#cortisolGlow)">
                <circle r="2.2" fill="#F59E0B">
                  <animateMotion
                    path="M 74 344 C 69 336, 62 330, 46 320"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin="0.8s"
                  />
                  <animate
                    attributeName="opacity"
                    values="0; 1; 1; 0.9; 0"
                    keyTimes="0; 0.15; 0.75; 0.9; 1"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin="0.8s"
                  />
                </circle>
                <circle r="1" fill="#FFFFFF">
                  <animateMotion
                    path="M 74 344 C 69 336, 62 330, 46 320"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin="0.8s"
                  />
                  <animate
                    attributeName="opacity"
                    values="0; 1; 1; 0"
                    keyTimes="0; 0.2; 0.85; 1"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin="0.8s"
                  />
                </circle>
              </g>

              {/* Molecule 3: Central loop vertical stream */}
              <g filter="url(#cortisolGlow)">
                <circle r="2.2" fill="#38BDF8">
                  <animateMotion
                    path="M 46 346 C 46 338, 46 328, 46 320"
                    dur="2.0s"
                    repeatCount="indefinite"
                    begin="0.3s"
                  />
                  <animate
                    attributeName="opacity"
                    values="0; 1; 1; 0"
                    keyTimes="0; 0.2; 0.85; 1"
                    dur="2.0s"
                    repeatCount="indefinite"
                    begin="0.3s"
                  />
                </circle>
                <circle r="1" fill="#FFFFFF">
                  <animateMotion
                    path="M 46 346 C 46 338, 46 328, 46 320"
                    dur="2.0s"
                    repeatCount="indefinite"
                    begin="0.3s"
                  />
                  <animate
                    attributeName="opacity"
                    values="0; 1; 1; 0"
                    keyTimes="0; 0.2; 0.85; 1"
                    dur="2.0s"
                    repeatCount="indefinite"
                    begin="0.3s"
                  />
                </circle>
              </g>
            </g>

            {/* 6. BIO-FLUORESCENT HOTSPOT NODES (Jul, Aug, Sep) ALONG CURVED STRAND */}
            {segmentList.map(({ seg, id, num, nodeX, nodeY }) => {
              const isActive = activeSegmentId === id;
              const badge = getStatusBadge(seg.cortisolPgPerMg);

              return (
                <g
                  key={id}
                  transform={`translate(${nodeX}, ${nodeY})`}
                  onClick={() => onSelectSegment(id)}
                  className="cursor-pointer group"
                >
                  <title>{`Select ${seg.title} (${seg.cortisolPgPerMg} pg/mg)`}</title>

                  {/* Active halo ping ring */}
                  {isActive && (
                    <>
                      <circle
                        cx="0"
                        cy="0"
                        r="22"
                        fill="#3186FF"
                        opacity="0.18"
                        className="animate-ping"
                        style={{ animationDuration: '2.5s' }}
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="17"
                        fill="none"
                        stroke="#3186FF"
                        strokeWidth="3.2"
                        opacity="0.85"
                        className="animate-pulse"
                      />
                    </>
                  )}

                  {/* Bio-fluorescent glow aura */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isActive ? 15 : 12}
                    fill={badge.hex}
                    opacity={isActive ? 0.45 : 0.25}
                    filter="url(#strandNodeGlow)"
                  />

                  {/* Main Node Disc */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isActive ? 13.5 : 11.5}
                    fill={badge.hex}
                    stroke="#FFFFFF"
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-all duration-200 group-hover:scale-110"
                    style={{
                      filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))',
                    }}
                  />

                  {/* Node Label Text: Jul, Aug, Sep */}
                  <text
                    x="0"
                    y="0.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    fontWeight="900"
                    fontSize={isActive ? '9.5' : '8.5'}
                    fontFamily="system-ui, sans-serif"
                    className="pointer-events-none select-none tracking-tight uppercase"
                  >
                    {num}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* RIGHT COLUMN: 3 ATTRIBUTED SEGMENT CARDS (JULY, AUGUST, SEPTEMBER) */}
        <div className="flex flex-col justify-between gap-3 sm:gap-3.5 h-full">
          {segmentList.map(({ seg, id, monthTitle, surgePercent, description, accentColor, bgActive }) => {
            const isActive = activeSegmentId === id;
            const isEditing = editingSegmentId === id;
            const badge = getStatusBadge(seg.cortisolPgPerMg);

            return (
              <div
                key={id}
                onClick={() => onSelectSegment(id)}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isActive
                    ? `${bgActive} ${accentColor} shadow-xs`
                    : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                }`}
              >
                {/* Header: Month Title, Status Badge, Edit Button on Left & Cortisol Level on Right */}
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-base font-extrabold text-black tracking-tight">
                        {monthTitle}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>

                      {/* Edit Button moved up to header row */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSegment(id);
                          setEditingSegmentId(isEditing ? null : id);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ml-0.5 ${
                          isEditing
                            ? 'bg-[#3186FF] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                        }`}
                        title={isEditing ? 'Done editing' : `Edit ${monthTitle} cortisol value`}
                      >
                        <SlidersHorizontal className="w-2.5 h-2.5" />
                        <span>{isEditing ? 'Done' : 'Edit'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Explicit Cortisol Level Display */}
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 font-mono">
                      Cortisol Level
                    </span>
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className={`text-lg sm:text-xl font-black font-mono ${
                        seg.cortisolPgPerMg > 20 ? 'text-rose-600' : seg.cortisolPgPerMg > 14 ? 'text-amber-600' : 'text-emerald-700'
                      }`}>
                        {seg.cortisolPgPerMg}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">pg/mg</span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500 block">
                      {surgePercent}
                    </span>
                  </div>
                </div>

                {/* Friendly Brief Description Associating Findings with Calendar */}
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  {description}
                </p>

                {/* Slidable Value Editor (Only revealed when pressing the edit button) */}
                {isEditing && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 p-2.5 rounded-xl bg-slate-50/90 border border-blue-200 animate-fade-in space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-semibold">
                        Adjust {monthTitle} Cortisol Level:
                      </span>
                      <span className="font-mono font-bold text-black text-xs bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                        {seg.cortisolPgPerMg} pg/mg
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5.0"
                      max="38.0"
                      step="0.2"
                      value={seg.cortisolPgPerMg}
                      onChange={e => onUpdateSegment(id, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3186FF]"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-slate-400">
                      <span>5.0 (Low)</span>
                      <span>11.0 (Baseline)</span>
                      <span>38.0 (Acute Peak)</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SLEEK BIOLOGICAL TRAPPING ACTION BANNER */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-[#3186FF] animate-pulse shrink-0" />
          <span className="font-semibold text-slate-700">Daily Trapping Science:</span>
          <span className="text-[11px] sm:text-xs">Cortisol is continuously sealed into hair keratin 24/7 as the shaft grows ~1cm/month.</span>
        </div>
        <button
          type="button"
          onClick={() => setIsTrappingModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#3186FF] text-xs font-bold border border-blue-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Read more on Cortisol trapping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
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
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#3186FF] text-[11px] font-mono font-bold uppercase tracking-wider mb-2 border border-blue-100">
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
                    <div className="w-7 h-7 rounded-lg bg-[#3186FF] text-white flex items-center justify-center font-black text-xs font-mono mb-2 shadow-xs">
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
                <ShieldCheck className="w-4 h-4 text-[#3186FF]" />
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
                      <span className="text-rose-500 font-bold">✕</span>
                      <span>Only captures a 15-minute point in time.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">✕</span>
                      <span>Distorted by coffee, exercise, commute, or needle anxiety.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">✕</span>
                      <span>Cannot distinguish temporary stress from 3-month burnout.</span>
                    </li>
                  </ul>
                </div>

                {/* Hair Cortisol */}
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                  <div className="font-extrabold text-[#3186FF] flex items-center gap-1.5 mb-1 text-[13px]">
                    <span className="w-2 h-2 rounded-full bg-[#3186FF]" />
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
};
