'use client';

import React, { useState } from 'react';
import { BarChart3, ArrowUpDown, ChevronDown, Flame, Check, Info } from 'lucide-react';
import { CohortGroup } from '@/lib/enterpriseTypes';
import { AnimatedDepartmentIcon } from './DepartmentIcons';

interface DepartmentBurnoutGraphProps {
  cohorts: CohortGroup[];
  selectedCohortId: string | null;
  onSelectCohort: (cohortId: string) => void;
}

export const DepartmentBurnoutGraph: React.FC<DepartmentBurnoutGraphProps> = ({
  cohorts,
  selectedCohortId,
  onSelectCohort,
}) => {
  const [sortBy, setSortBy] = useState<'score' | 'default'>('score');
  const [hoveredCohortId, setHoveredCohortId] = useState<string | null>(null);

  const sortedCohorts = [...cohorts].sort((a, b) => {
    if (sortBy === 'score') {
      return (b.averageBurnoutScore || b.averageBsi || 0) - (a.averageBurnoutScore || a.averageBsi || 0);
    }
    return 0; // default order
  });

  const getBarColor = (score: number) => {
    if (score > 80) return 'bg-gradient-to-t from-red-600 via-rose-500 to-rose-400 shadow-rose-500/30';
    if (score > 60) return 'bg-gradient-to-t from-orange-600 via-amber-500 to-orange-400 shadow-orange-500/30';
    if (score > 35) return 'bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 shadow-blue-500/30';
    return 'bg-gradient-to-t from-emerald-600 via-green-500 to-emerald-400 shadow-emerald-500/30';
  };

  const getPillColor = (score: number) => {
    if (score > 80) return 'bg-rose-600 text-white';
    if (score > 60) return 'bg-orange-600 text-white';
    if (score > 35) return 'bg-blue-600 text-white';
    return 'bg-emerald-600 text-white';
  };

  const orgAverage = Math.round(
    cohorts.reduce((sum, c) => sum + (c.averageBurnoutScore || c.averageBsi || 0), 0) / (cohorts.length || 1)
  );

  const highestDept = [...cohorts].sort((a, b) => (b.averageBurnoutScore || 0) - (a.averageBurnoutScore || 0))[0];

  const activeHover = cohorts.find(c => c.id === (hoveredCohortId || selectedCohortId)) || highestDept;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[#3186FF]" />
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Department Comparison Chart
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Burnout Score by Department
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive column graph. Click any department bar to jump straight into its monitored teams.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {highestDept && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Peak Stress: {highestDept.name} ({highestDept.averageBurnoutScore || highestDept.averageBsi})</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'score' ? 'default' : 'score')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortBy === 'score' ? 'Sorted by Highest' : 'Default Order'}</span>
          </button>
        </div>
      </div>

      {/* Hovered / Active Department Quick Info Card */}
      {activeHover && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-100">
          <div className="flex items-center gap-3">
            <AnimatedDepartmentIcon iconKey={activeHover.iconKey || activeHover.code} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  {activeHover.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeHover.subUnits.length} monitored teams · Continuous 90-day tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Burnout Score</span>
              <span className="text-lg font-black text-slate-900">
                {activeHover.averageBurnoutScore || activeHover.averageBsi} / 100
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectCohort(activeHover.id)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              View Units ↓
            </button>
          </div>
        </div>
      )}

      {/* REAL INTERACTIVE VERTICAL COLUMN CHART */}
      <div className="relative pt-6 pb-2">
        {/* Y-Axis Grid Lines & Background Reference */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-bold text-slate-300">
          <div className="border-b border-slate-100 w-full flex justify-between pr-2">
            <span>100 (Critical)</span>
          </div>
          <div className="border-b border-slate-100 w-full flex justify-between pr-2">
            <span>75 (High)</span>
          </div>
          <div className="border-b border-slate-100 w-full flex justify-between pr-2">
            <span>50 (Moderate)</span>
          </div>
          <div className="border-b border-slate-100 w-full flex justify-between pr-2">
            <span>25 (Low)</span>
          </div>
          <div className="border-b border-slate-200 w-full flex justify-between pr-2">
            <span>0</span>
          </div>
        </div>

        {/* Dashed Average Line across the chart */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-slate-400 z-10 pointer-events-none transition-all duration-300"
          style={{ bottom: `${orgAverage}%` }}
        >
          <span className="absolute -top-3 right-2 bg-slate-800 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
            Avg: {orgAverage}
          </span>
        </div>

        {/* Scrollable Column Graph Container on smaller screens */}
        <div className="overflow-x-auto pb-4 pt-8">
          <div className="min-w-[650px] sm:min-w-0 h-64 flex items-end justify-between gap-3 sm:gap-4 px-4 sm:px-8 relative z-20">
            {sortedCohorts.map((cohort) => {
              const score = cohort.averageBurnoutScore || cohort.averageBsi || 0;
              const isSelected = selectedCohortId === cohort.id;
              const isHovered = hoveredCohortId === cohort.id;

              return (
                <div
                  key={cohort.id}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredCohortId(cohort.id)}
                  onMouseLeave={() => setHoveredCohortId(null)}
                  onClick={() => onSelectCohort(cohort.id)}
                >
                  {/* Floating Score Pill above the bar */}
                  <div
                    className={`mb-2 px-2 py-0.5 rounded-md text-[11px] font-black shadow-xs transition-all duration-200 whitespace-nowrap ${getPillColor(score)} ${
                      isSelected || isHovered ? 'scale-115 shadow-md -translate-y-1' : 'opacity-90'
                    }`}
                  >
                    {score}
                  </div>

                  {/* Vertical Column Bar */}
                  <div className="w-full max-w-[54px] bg-slate-100 rounded-t-2xl p-1 relative flex items-end justify-center transition-all h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-700 ease-out shadow-md ${getBarColor(score)} ${
                        isSelected || isHovered
                          ? 'ring-3 ring-blue-500/80 brightness-110'
                          : 'opacity-95 group-hover:brightness-105'
                      }`}
                      style={{ height: `${Math.min(Math.max(score, 6), 100)}%` }}
                    />
                  </div>

                  {/* X-Axis Department Label & Emoji below the bar */}
                  <div className="mt-3 flex flex-col items-center text-center">
                    <AnimatedDepartmentIcon iconKey={cohort.iconKey || cohort.code} size="sm" />
                    <span className={`text-[10px] font-extrabold max-w-[85px] leading-tight line-clamp-2 mt-1.5 ${
                      isSelected ? 'text-blue-600 font-black' : 'text-slate-700'
                    }`}>
                      {cohort.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
