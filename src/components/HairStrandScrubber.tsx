'use client';

import React from 'react';
import { HairCortisolSegment } from '@/lib/types';
import { Scissors } from 'lucide-react';

interface HairStrandScrubberProps {
  segments: HairCortisolSegment[];
  activeSegmentId: 1 | 2 | 3;
  onSelectSegment: (id: 1 | 2 | 3) => void;
}

export const HairStrandScrubber: React.FC<HairStrandScrubberProps> = ({
  segments,
  activeSegmentId,
  onSelectSegment,
}) => {
  const getBorderColor = (id: number) => {
    if (activeSegmentId === id) return 'border-[#3186FF] ring-2 ring-[#3186FF]/40';
    return 'border-[#E2E8F0] hover:border-slate-300';
  };

  const seg1 = segments.find(s => s.id === 1);
  const seg2 = segments.find(s => s.id === 2);
  const seg3 = segments.find(s => s.id === 3);
  const activeSegment = segments.find(s => s.id === activeSegmentId) || seg1;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5">
      {/* Minimal Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3186FF] animate-pulse" />
          <h3 className="text-sm font-bold text-black">3cm Hair Strand Scrubber</h3>
        </div>

        {activeSegment && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#F0F4FA] border border-[#E2E8F0] text-xs">
            <span className="font-semibold text-black">{activeSegment.title}</span>
            <span className="font-mono font-bold text-[#3186FF] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
              {activeSegment.cortisolPgPerMg} pg/mg
            </span>
          </div>
        )}
      </div>

      {/* Anatomy Visual Scrubber */}
      <div className="mt-5 mb-2">
        {/* Scale labels */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#5F6368] mb-1.5 px-1">
          <div className="flex items-center gap-1.5 text-black font-semibold">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <span>0.0 cm (Scalp)</span>
          </div>
          <div>1.0 cm</div>
          <div>2.0 cm</div>
          <div className="flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5 text-slate-400" />
            <span>3.0 cm (Tip)</span>
          </div>
        </div>

        {/* Hair Strand Graphic */}
        <div className="relative p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
          {/* Hair bulb at scalp root */}
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-8 bg-slate-900 rounded-l-full shadow-xs z-10 flex items-center justify-center">
            <span className="w-1.5 h-3 bg-rose-400/80 rounded-full" />
          </div>

          <div className="grid grid-cols-3 gap-2 relative z-0">
            {/* Segment 3: Root (0-1cm, Scalp, September) */}
            <div
              onClick={() => onSelectSegment(3)}
              className={`group cursor-pointer rounded-xl p-3 border transition-all ${getBorderColor(3)} ${
                activeSegmentId === 3 ? 'bg-blue-50/60 shadow-xs' : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-black">Root (0–1 cm)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                  0–30d (Sep)
                </span>
              </div>

              {/* Biological strand bar */}
              <div className="h-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 shadow-inner flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-900 font-mono">
                  {seg3?.cortisolPgPerMg} pg/mg
                </span>
              </div>

              <div className="mt-2 text-[10px] font-semibold text-amber-700 flex items-center justify-between">
                <span>Lagging Strain</span>
                <span>+42%</span>
              </div>
            </div>

            {/* Segment 2: Mid-Shaft (1-2cm, August) */}
            <div
              onClick={() => onSelectSegment(2)}
              className={`group cursor-pointer rounded-xl p-3 border transition-all ${getBorderColor(2)} ${
                activeSegmentId === 2 ? 'bg-blue-50/60 shadow-xs' : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-black">Mid-Shaft (1–2 cm)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-semibold">
                  30–60d (Aug)
                </span>
              </div>

              {/* Biological strand bar (Surge) */}
              <div className="h-4 rounded-full bg-gradient-to-r from-rose-500 via-rose-400 to-amber-500 shadow-inner flex items-center justify-center">
                <span className="text-[10px] font-bold text-white font-mono">
                  {seg2?.cortisolPgPerMg} pg/mg
                </span>
              </div>

              <div className="mt-2 text-[10px] font-semibold text-rose-700 flex items-center justify-between">
                <span>Acute Surge</span>
                <span>2.6x</span>
              </div>
            </div>

            {/* Segment 1: Tip (2-3cm, July) */}
            <div
              onClick={() => onSelectSegment(1)}
              className={`group cursor-pointer rounded-xl p-3 border transition-all ${getBorderColor(1)} ${
                activeSegmentId === 1 ? 'bg-blue-50/60 shadow-xs' : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-black">Tip (2–3 cm)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                  60–90d (Jul)
                </span>
              </div>

              {/* Biological strand bar */}
              <div className="h-4 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 shadow-inner flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-900 font-mono">
                  {seg1?.cortisolPgPerMg} pg/mg
                </span>
              </div>

              <div className="mt-2 text-[10px] font-semibold text-emerald-700 flex items-center justify-between">
                <span>Baseline</span>
                <span>Normal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
