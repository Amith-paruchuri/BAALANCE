'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, ArrowUpDown, ChevronRight, Flame } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');

  const sortedCohorts = [...cohorts].sort((a, b) => {
    if (sortBy === 'score') {
      return (b.averageBurnoutScore || b.averageBsi || 0) - (a.averageBurnoutScore || a.averageBsi || 0);
    }
    return a.name.localeCompare(b.name);
  });

  const getBarColor = (score: number) => {
    if (score > 80) return 'from-rose-500 to-red-600';
    if (score > 60) return 'from-amber-500 to-orange-500';
    if (score > 35) return 'from-blue-500 to-cyan-500';
    return 'from-emerald-400 to-emerald-600';
  };

  const getBadgeStyle = (score: number) => {
    if (score > 80) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (score > 60) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (score > 35) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  const highestDept = [...cohorts].sort((a, b) => (b.averageBurnoutScore || 0) - (a.averageBurnoutScore || 0))[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header & Sort Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[#3186FF]" />
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Departmental Stress Ranking
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Burnout Score Distribution Across Departments
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any department bar to inspect its units and trigger targeted clinical protocols.
          </p>
        </div>

        {/* Sort Button & Peak Stress Indicator */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {highestDept && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Highest: {highestDept.name} ({highestDept.averageBurnoutScore || highestDept.averageBsi})</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'score' ? 'name' : 'score')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort: {sortBy === 'score' ? 'Highest Score' : 'Alphabetical'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Horizontal Bar Graph */}
      <div className="space-y-2.5 pt-1">
        {sortedCohorts.map((cohort) => {
          const score = cohort.averageBurnoutScore || cohort.averageBsi || 0;
          const isSelected = selectedCohortId === cohort.id;

          return (
            <button
              key={cohort.id}
              type="button"
              onClick={() => onSelectCohort(cohort.id)}
              className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer group relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/50'
                  : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200/80 text-slate-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                {/* Department Info with Animated Icon */}
                <div className="flex items-center gap-2.5 min-w-[200px]">
                  <AnimatedDepartmentIcon iconKey={cohort.iconKey || cohort.code} size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-black ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        [{cohort.code}]
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                        {cohort.name}
                      </span>
                    </div>
                    <span className={`text-[10px] font-medium block ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      {cohort.subUnits.length} Monitored Units • {cohort.headOfficial}
                    </span>
                  </div>
                </div>

                {/* Score Pill Badge */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-black border shadow-2xs ${
                      isSelected ? 'bg-white text-slate-900 border-white' : getBadgeStyle(score)
                    }`}
                  >
                    Score {score} / 100
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className={`h-2.5 w-full rounded-full overflow-hidden ${isSelected ? 'bg-slate-800' : 'bg-slate-200/80'}`}>
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getBarColor(score)} transition-all duration-700 ease-out shadow-xs`}
                  style={{ width: `${Math.min(Math.max(score, 5), 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
