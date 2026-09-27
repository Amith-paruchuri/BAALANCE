'use client';

import React, { useState } from 'react';
import { Sparkles, Moon, Clock, Calendar, Check, Play, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TailoredIntervention, SubUnit, CohortGroup } from '@/lib/enterpriseTypes';

interface EnterpriseInterventionsPanelProps {
  interventions: TailoredIntervention[];
  selectedUnit: SubUnit | null;
  selectedCohort: CohortGroup | null;
  onSimulateIntervention: (interventionId: string, unitId: string, percentReduction: number) => void;
  activeSimulations: Record<string, boolean>; // interventionId -> boolean
}

export const EnterpriseInterventionsPanel: React.FC<EnterpriseInterventionsPanelProps> = ({
  interventions,
  selectedUnit,
  selectedCohort,
  onSimulateIntervention,
  activeSimulations,
}) => {
  const [deployedPolicies, setDeployedPolicies] = useState<Record<string, boolean>>({});

  // Filter interventions relevant to current selection, or show all top recommendations
  const displayedInterventions = selectedCohort
    ? interventions.filter(i => i.targetCohortId === selectedCohort.id || (selectedUnit && i.targetUnitId === selectedUnit.id))
    : interventions;

  // Fallback if no specific intervention matched the exact unit: show all
  const listToRender = displayedInterventions.length > 0 ? displayedInterventions : interventions;

  const handleDeploy = (id: string) => {
    setDeployedPolicies(prev => ({ ...prev, [id]: true }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'circadian_curfew':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'roster_pacing':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'workload_cap':
        return <Clock className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'circadian_curfew':
        return 'Circadian Curfew Protocol';
      case 'roster_pacing':
        return 'Roster & Duty Pacing';
      case 'workload_cap':
        return 'Workload / Portal Lockdown';
      default:
        return 'Environmental Reset';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Clinical & Institutional Interventions
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Tailored Cohort Action Plans
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted systemic policies engineered to lower chronic follicular cortisol in high-strain units.
          </p>
        </div>

        {selectedUnit && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <span>Targeting:</span>
            <span className="text-[#3186FF]">{selectedUnit.name}</span>
          </div>
        )}
      </div>

      {/* Intervention Cards List */}
      <div className="space-y-3.5">
        {listToRender.map((item) => {
          const isSimulated = !!activeSimulations[item.id];
          const isDeployed = !!deployedPolicies[item.id];

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isDeployed
                  ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300'
                  : isSimulated
                  ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-300 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-2.5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-100 shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-bold">
                        {item.targetUnitName}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {item.title}
                    </h4>
                  </div>
                </div>

                {/* Impact Metric & Timeframe */}
                <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-2xs">
                    -{item.projectedBsiReductionPercent}% Projected BSI
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    in ~{item.timeToImpactDays} days
                  </span>
                </div>
              </div>

              {/* Rationale & Action Protocol */}
              <div className="space-y-1.5 text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-slate-100">
                <p>
                  <strong className="text-slate-900">Clinical Rationale:</strong> {item.rationale}
                </p>
                <p>
                  <strong className="text-slate-900">Protocol:</strong> {item.actionProtocol}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => onSimulateIntervention(item.id, item.targetUnitId || '', item.projectedBsiReductionPercent)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                    isSimulated
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  <Play className={`w-3 h-3 ${isSimulated ? 'fill-white' : ''}`} />
                  <span>{isSimulated ? 'Simulating Dynamic Nadir...' : 'Simulate Biological Impact'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeploy(item.id)}
                  disabled={isDeployed}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                    isDeployed
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-slate-900 hover:bg-black text-white shadow-2xs'
                  }`}
                >
                  {isDeployed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Policy Active & Enforced</span>
                    </>
                  ) : (
                    <>
                      <span>Deploy Institutional Policy</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
