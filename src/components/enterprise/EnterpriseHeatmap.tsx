'use client';

import React, { useState } from 'react';
import { Flame, TrendingUp, TrendingDown, Users, AlertTriangle, ShieldCheck, CheckCircle2, Sliders, ChevronRight } from 'lucide-react';
import { CohortGroup, SubUnit, StressRiskLevel } from '@/lib/enterpriseTypes';
import { AnimatedDepartmentIcon, AnimatedSubgroupIcon } from './DepartmentIcons';

interface EnterpriseHeatmapProps {
  cohorts: CohortGroup[];
  selectedUnitId: string | null;
  onSelectUnit: (unit: SubUnit, cohort: CohortGroup) => void;
  showRawAssay: boolean;
  onToggleRawAssay: (val: boolean) => void;
  simulatedReductions?: Record<string, number>;
  focusedCohortId?: string | null;
}

export const EnterpriseHeatmap: React.FC<EnterpriseHeatmapProps> = ({
  cohorts,
  selectedUnitId,
  onSelectUnit,
  showRawAssay,
  onToggleRawAssay,
  simulatedReductions = {},
  focusedCohortId = null,
}) => {
  const [filterRisk, setFilterRisk] = useState<'all' | 'critical' | 'elevated'>('all');

  const getRiskColorClasses = (risk: StressRiskLevel, isSelected: boolean) => {
    switch (risk) {
      case 'critical':
        return isSelected
          ? 'bg-rose-500/15 border-rose-500 text-rose-950 ring-2 ring-rose-500 shadow-md shadow-rose-500/10'
          : 'bg-rose-50/80 border-rose-200/90 text-rose-900 hover:border-rose-400 hover:bg-rose-100/60 shadow-2xs';
      case 'elevated':
        return isSelected
          ? 'bg-amber-500/15 border-amber-500 text-amber-950 ring-2 ring-amber-500 shadow-md shadow-amber-500/10'
          : 'bg-amber-50/80 border-amber-200/90 text-amber-900 hover:border-amber-400 hover:bg-amber-100/60 shadow-2xs';
      case 'moderate':
        return isSelected
          ? 'bg-blue-500/15 border-blue-500 text-blue-950 ring-2 ring-blue-500 shadow-md shadow-blue-500/10'
          : 'bg-blue-50/60 border-blue-200/80 text-blue-900 hover:border-blue-300 hover:bg-blue-100/50 shadow-2xs';
      case 'nominal':
      default:
        return isSelected
          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500 shadow-md shadow-emerald-500/10'
          : 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-100/50 shadow-2xs';
    }
  };

  const getScoreBadgeClasses = (risk: StressRiskLevel) => {
    switch (risk) {
      case 'critical':
        return 'bg-rose-600 text-white';
      case 'elevated':
        return 'bg-amber-600 text-white';
      case 'moderate':
        return 'bg-blue-600 text-white';
      case 'nominal':
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Cohort Surveillance Matrix
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Stress & Burnout Heatmap
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any unit or subgroup to view biological risk drivers and deploy tailored interventions.
          </p>
        </div>

        {/* Controls: Filter & Assay Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Risk Level Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-xs font-bold">
            <button
              onClick={() => setFilterRisk('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterRisk === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Units
            </button>
            <button
              onClick={() => setFilterRisk('critical')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                filterRisk === 'critical' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Critical</span>
            </button>
            <button
              onClick={() => setFilterRisk('elevated')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterRisk === 'elevated' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Elevated
            </button>
          </div>

          {/* Toggle: Raw Cortisol vs Burnout Score */}
          <button
            onClick={() => onToggleRawAssay(!showRawAssay)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs ${
              showRawAssay
                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
            title="Toggle between unadjusted laboratory assay (pg/mg) and normalized Burnout Score (0-100)"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showRawAssay ? 'Raw Cortisol (pg/mg)' : 'Burnout Score (0–100)'}</span>
          </button>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-[11px] font-bold border-y border-slate-100 py-2.5">
        <span className="text-slate-400 font-medium">Stress Zones:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-700">Healthy (0–35)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-700">Manageable (36–60)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-slate-700">High Stress (61–80)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-700">Critical Burnout (81–100)</span>
        </div>
      </div>

      {/* Grid of Cohorts (Rows) and SubUnits (Interactive Animated Tiles) */}
      <div className="space-y-4">
        {cohorts.map((cohort) => {
          const matchingUnits = cohort.subUnits.filter((u) => {
            if (filterRisk === 'all') return true;
            if (filterRisk === 'critical') return u.riskLevel === 'critical';
            if (filterRisk === 'elevated') return u.riskLevel === 'elevated';
            return true;
          });

          if (matchingUnits.length === 0) return null;

          const isCohortFocused = focusedCohortId === cohort.id;
          const cohortScore = cohort.averageBurnoutScore || cohort.averageBsi || 0;

          return (
            <div
              key={cohort.id}
              id={`dept-${cohort.id}`}
              className={`rounded-2xl p-4 sm:p-5 transition-all ${
                isCohortFocused
                  ? 'bg-blue-50/70 border-2 border-blue-400 shadow-sm'
                  : 'bg-slate-50/70 border border-slate-200/70'
              }`}
            >
              {/* Cohort Header with Animated Icon */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-2.5">
                  <AnimatedDepartmentIcon iconKey={cohort.iconKey || cohort.code} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900">{cohort.name}</h3>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      {cohort.subUnits.length} monitored teams · 90-day biological cycle
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] text-slate-400 font-semibold">Cohort Mean:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-2xs ${
                      cohort.overallRisk === 'critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : cohort.overallRisk === 'elevated'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    Burnout Score {cohortScore} / 100
                  </span>
                </div>
              </div>

              {/* SubUnits Grid (Interactive Heat Tiles with Subgroup Animated Icons) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {matchingUnits.map((unit) => {
                  const isSelected = selectedUnitId === unit.id;
                  const reductionPercent = simulatedReductions[unit.id] || 0;
                  const rawScore = unit.burnoutScore || unit.normalizedBsi || 0;
                  const displayScore = reductionPercent > 0
                    ? Math.round(rawScore * (1 - reductionPercent / 100))
                    : rawScore;
                  const prevScore = unit.previousQuarterScore || unit.previousQuarterBsi || 0;
                  const trendDiff = rawScore - prevScore;

                  return (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => onSelectUnit(unit, cohort)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group active:scale-98 ${getRiskColorClasses(
                        reductionPercent > 0 && displayScore <= 60 ? 'moderate' : unit.riskLevel,
                        isSelected
                      )}`}
                    >
                      {/* Top Bar inside Card */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-2">
                          <AnimatedSubgroupIcon iconKey={unit.iconKey || unit.code} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                                {unit.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] opacity-70 mt-0.5">
                              <Users className="w-3 h-3 shrink-0" />
                              <span>{unit.sampledCount} of {unit.memberCount} sampled</span>
                            </div>
                          </div>
                        </div>

                        {/* Metric Badge: Burnout Score or Raw Cortisol */}
                        <div className="flex flex-col items-end shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-black shadow-xs tracking-tight ${getScoreBadgeClasses(
                              reductionPercent > 0 && displayScore <= 60 ? 'moderate' : unit.riskLevel
                            )}`}
                          >
                            {showRawAssay ? `${unit.rawCortisolPgMg} pg/mg` : `Score ${displayScore}`}
                          </span>
                          {reductionPercent > 0 && (
                            <span className="text-[10px] font-bold text-emerald-700 animate-pulse mt-0.5">
                              -{reductionPercent}% Projected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Primary Driver */}
                      <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                        <span className="truncate max-w-[185px] font-medium opacity-80" title={unit.primaryStressDriver}>
                          {unit.primaryStressDriver}
                        </span>

                        {/* Trend Arrow */}
                        <div className="flex items-center gap-0.5 font-bold shrink-0">
                          {trendDiff > 0 ? (
                            <span className="flex items-center text-rose-700 text-[10px]">
                              <TrendingUp className="w-3 h-3" />
                              +{trendDiff}
                            </span>
                          ) : (
                            <span className="flex items-center text-emerald-700 text-[10px]">
                              <TrendingDown className="w-3 h-3" />
                              {trendDiff}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Active indicator arrow */}
                      {isSelected && (
                        <div className="absolute right-2 bottom-2 text-slate-900 opacity-60">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
