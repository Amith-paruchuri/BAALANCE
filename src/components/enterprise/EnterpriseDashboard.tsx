'use client';

import React, { useState } from 'react';
import { MOCK_ORGANIZATIONS } from '@/lib/enterpriseMockData';
import { Organization, SubUnit, CohortGroup } from '@/lib/enterpriseTypes';
import { EnterpriseWorkspaceSwitcher } from './EnterpriseWorkspaceSwitcher';
import { DepartmentBurnoutGraph } from './DepartmentBurnoutGraph';
import { EnterpriseHeatmap } from './EnterpriseHeatmap';
import { EnterpriseInterventionsPanel } from './EnterpriseInterventionsPanel';
import { Building2, GraduationCap, Stethoscope } from 'lucide-react';

// The four zones of the team stress map, lowest to highest.
const STRESS_ZONES = [
  { above: -1, label: 'Balanced', tile: 'bg-emerald-600 text-white', swatch: 'bg-emerald-600' },
  { above: 35, label: 'Busy', tile: 'bg-amber-300 text-amber-950', swatch: 'bg-amber-300' },
  { above: 60, label: 'Stretched', tile: 'bg-orange-500 text-white', swatch: 'bg-orange-500' },
  { above: 80, label: 'Burning out', tile: 'bg-rose-600 text-white', swatch: 'bg-rose-600' },
];
const stressZone = (score: number) => [...STRESS_ZONES].reverse().find(z => score > z.above) || STRESS_ZONES[0];

interface EnterpriseDashboardProps {
  initialOrgId?: string;
  onBackToIndividual: () => void;
  onOpenJoinModal?: () => void;
}

export const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({
  initialOrgId = 'apollo-health',
  onBackToIndividual,
  onOpenJoinModal,
}) => {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(initialOrgId);
  const currentOrg: Organization = MOCK_ORGANIZATIONS[selectedOrgId] || MOCK_ORGANIZATIONS['apollo-health'];

  const [selectedUnit, setSelectedUnit] = useState<SubUnit | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<CohortGroup | null>(null);
  const [focusedCohortId, setFocusedCohortId] = useState<string | null>(null);
  const [showRawAssay, setShowRawAssay] = useState<boolean>(false);

  // Dynamic simulation of intervention biological recovery
  const [activeSimulations, setActiveSimulations] = useState<Record<string, boolean>>({});
  const [simulatedReductions, setSimulatedReductions] = useState<Record<string, number>>({});

  const handleSelectUnit = (unit: SubUnit, cohort: CohortGroup) => {
    setSelectedUnit(unit);
    setSelectedCohort(cohort);
    setFocusedCohortId(cohort.id);
  };

  const handleSelectCohortFromGraph = (cohortId: string) => {
    setFocusedCohortId(cohortId);
    const cohort = currentOrg.cohorts.find(c => c.id === cohortId);
    if (cohort) {
      setSelectedCohort(cohort);
      if (cohort.subUnits.length > 0) {
        setSelectedUnit(cohort.subUnits[0]);
      }
    }

    // Smooth scroll to the corresponding heatmap row
    const el = document.getElementById(`dept-${cohortId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSimulateIntervention = (interventionId: string, unitId: string, percentReduction: number) => {
    const isCurrentlyActive = !!activeSimulations[interventionId];
    setActiveSimulations(prev => ({ ...prev, [interventionId]: !isCurrentlyActive }));

    if (unitId) {
      setSimulatedReductions(prev => ({
        ...prev,
        [unitId]: !isCurrentlyActive ? percentReduction : 0,
      }));
    }
  };

  // Calculate aggregated stats
  const totalSubUnits = currentOrg.cohorts.reduce((acc, c) => acc + c.subUnits.length, 0);
  const criticalUnitsCount = currentOrg.cohorts.reduce(
    (acc, c) => acc + c.subUnits.filter(u => u.riskLevel === 'critical').length,
    0
  );
  const meanBurnoutScore = Math.round(
    currentOrg.cohorts.reduce((acc, c) => acc + (c.averageBurnoutScore || c.averageBsi || 0), 0) / currentOrg.cohorts.length
  );

  return (
    <div className="min-h-screen bg-[#F6F2EC] text-slate-900 flex flex-col font-sans selection:bg-[#0D4F59] selection:text-white pb-16">
      {/* Top Slack-style Workspace Header */}
      <EnterpriseWorkspaceSwitcher
        currentOrg={currentOrg}
        onSelectOrg={(orgId) => {
          setSelectedOrgId(orgId);
          setSelectedUnit(null);
          setSelectedCohort(null);
          setFocusedCohortId(null);
          setSimulatedReductions({});
          setActiveSimulations({});
        }}
        onBackToIndividual={onBackToIndividual}
        onOpenJoinModal={onOpenJoinModal}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
        {/* Sample organisations */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs font-semibold text-slate-500">Sample organisations</span>
          <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Sample organisation">
            {[
              { id: 'apollo-health', label: 'Hospital', icon: Stethoscope },
              { id: 'st-jude-academy', label: 'School', icon: GraduationCap },
              { id: 'nexus-tech', label: 'Company', icon: Building2 },
            ].map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedOrgId(option.id);
                  setSelectedUnit(null);
                  setSelectedCohort(null);
                  setFocusedCohortId(null);
                }}
                aria-pressed={selectedOrgId === option.id}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  selectedOrgId === option.id
                    ? 'bg-[#0D4F59] border-[#0D4F59] text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <option.icon className="w-3.5 h-3.5" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Team stress map: one tile per department, coloured by zone */}
        <section className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-5" aria-label="Team stress map" data-testid="team-stress-map">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">Anonymous · team level only</div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">Team stress map</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                {currentOrg.name}. Each tile is a department&apos;s average over the last 90 days. No individual result is ever shown.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 shrink-0">
              <div className="px-4 py-3 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500">Organisation score</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono text-slate-900">{meanBurnoutScore}</span>
                  <span className="text-[11px] font-semibold text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500">Teams burning out</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono text-rose-600">{criticalUnitsCount}</span>
                  <span className="text-[11px] font-semibold text-slate-400">of {totalSubUnits}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('interventions-panel')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-emerald-800">Best next step</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono text-emerald-700">
                    -{currentOrg.interventions[0]?.projectedReductionPercent || 0}%
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">see plan</span>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...currentOrg.cohorts]
              .sort((x, y) => (y.averageBurnoutScore || 0) - (x.averageBurnoutScore || 0))
              .map(cohort => {
                const score = Math.round(cohort.averageBurnoutScore || cohort.averageBsi || 0);
                const zone = stressZone(score);
                return (
                  <button
                    key={cohort.id}
                    type="button"
                    onClick={() => handleSelectCohortFromGraph(cohort.id)}
                    className={`p-4 rounded-2xl text-left transition-transform hover:-translate-y-0.5 cursor-pointer ${zone.tile}`}
                    title={`${cohort.name}: ${score} of 100, ${zone.label.toLowerCase()}`}
                  >
                    <div className="text-sm font-extrabold leading-tight">{cohort.name}</div>
                    <div className="flex items-baseline justify-between gap-2 mt-3">
                      <span className="text-xs font-semibold opacity-90">{zone.label}</span>
                      <span className="text-lg font-black font-mono">{score}</span>
                    </div>
                  </button>
                );
              })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-600">
              {STRESS_ZONES.map(zone => (
                <span key={zone.label} className="inline-flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded ${zone.swatch}`} />
                  {zone.label}
                </span>
              ))}
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900">
              Burnout stops being a surprise. <span className="text-[#BF6F4E]">It becomes a warning.</span>
            </p>
          </div>
        </section>

        {/* 2. INTERACTIVE DEPARTMENT COMPARISON BAR GRAPH */}
        <DepartmentBurnoutGraph
          cohorts={currentOrg.cohorts}
          selectedCohortId={focusedCohortId}
          onSelectCohort={handleSelectCohortFromGraph}
        />

        {/* 3. THE CORE SURVEILLANCE HEATMAP MATRIX */}
        <EnterpriseHeatmap
          cohorts={currentOrg.cohorts}
          selectedUnitId={selectedUnit?.id || null}
          onSelectUnit={handleSelectUnit}
          showRawAssay={showRawAssay}
          onToggleRawAssay={setShowRawAssay}
          simulatedReductions={simulatedReductions}
          focusedCohortId={focusedCohortId}
        />

        {/* 4. TAILORED SYSTEMIC INTERVENTIONS PANEL */}
        <EnterpriseInterventionsPanel
          interventions={currentOrg.interventions}
          selectedUnit={selectedUnit}
          selectedCohort={selectedCohort}
          onSimulateIntervention={handleSimulateIntervention}
          activeSimulations={activeSimulations}
        />
      </div>
    </div>
  );
};
