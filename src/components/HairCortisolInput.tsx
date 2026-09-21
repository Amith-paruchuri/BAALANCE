'use client';

import React from 'react';
import { FlaskConical, Sparkles } from 'lucide-react';
import { HairCortisolSegment } from '@/lib/types';

interface HairCortisolInputProps {
  segments: HairCortisolSegment[];
  onUpdateSegment: (id: 1 | 2 | 3, value: number) => void;
  onLoadSurgeScenario: () => void;
  activeSegmentId: 1 | 2 | 3;
  onSelectSegment: (id: 1 | 2 | 3) => void;
}

export const HairCortisolInput: React.FC<HairCortisolInputProps> = ({
  segments,
  onUpdateSegment,
  onLoadSurgeScenario,
  activeSegmentId,
  onSelectSegment,
}) => {
  const getStatusBadge = (value: number) => {
    if (value > 20.0) {
      return {
        label: 'Acute Surge',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    }
    if (value > 14.0) {
      return {
        label: 'Elevated Load',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    }
    return {
      label: 'Homeostasis',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    };
  };

  // Sort: Month 3 (Tip) -> Month 2 (Mid-Shaft) -> Month 1 (Root)
  const orderedSegments = [...segments].sort((a, b) => b.id - a.id);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-[#3186FF]" />
          <h3 className="text-sm font-bold text-black">Hair Cortisol Telemetry (ELISA)</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-600">
            pg/mg dry hair
          </span>
        </div>

        <button
          onClick={onLoadSurgeScenario}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F4FA] hover:bg-blue-50 text-xs font-semibold text-[#3186FF] border border-[#E2E8F0] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#3186FF]" />
          <span>Surge Scenario</span>
        </button>
      </div>

      {/* 3 Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {orderedSegments.map((segment) => {
          const badge = getStatusBadge(segment.cortisolPgPerMg);
          const isSelected = activeSegmentId === segment.id;

          return (
            <div
              key={segment.id}
              onClick={() => onSelectSegment(segment.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#3186FF] bg-blue-50/40 ring-1 ring-[#3186FF]/30 shadow-xs'
                  : 'border-[#E2E8F0] bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-black">{segment.title}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {badge.label}
                </span>
              </div>

              <div className="text-[11px] text-[#5F6368] mb-2.5 flex items-center justify-between">
                <span>{segment.anatomicalRegion}</span>
                <span className="font-mono text-slate-700">{segment.distanceCm}</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="50.0"
                  value={segment.cortisolPgPerMg}
                  onChange={(e) => onUpdateSegment(segment.id, parseFloat(e.target.value) || 0)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 px-2 py-1 text-sm font-bold text-black rounded-lg border border-[#E2E8F0] bg-white font-mono"
                />
                <span className="text-xs font-semibold text-[#5F6368]">pg/mg</span>
                <span className="text-[10px] text-slate-500 ml-auto font-mono">
                  {segment.cortisolPgPerMg > 14
                    ? `+${Math.round(((segment.cortisolPgPerMg - 11) / 11) * 100)}%`
                    : 'Normal'}
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="40"
                step="0.2"
                value={segment.cortisolPgPerMg}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdateSegment(segment.id, parseFloat(e.target.value));
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3186FF]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
