'use client';

import React, { useState } from 'react';
import { MOCK_ORGANIZATIONS } from '@/lib/enterpriseMockData';
import { Organization, SubUnit, CohortGroup } from '@/lib/enterpriseTypes';
import { EnterpriseWorkspaceSwitcher } from './EnterpriseWorkspaceSwitcher';
import { BurnoutGradientBar } from './BurnoutGradientBar';
import { DepartmentBurnoutGraph } from './DepartmentBurnoutGraph';
import { EnterpriseHeatmap } from './EnterpriseHeatmap';
import { EnterpriseInterventionsPanel } from './EnterpriseInterventionsPanel';
import { Building2, GraduationCap, Stethoscope, Flame, ShieldCheck, Activity } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#3186FF] selection:text-white pb-16">
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
        {/* Sector Quick Switcher Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Explore Institutional Sector:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedOrgId('apollo-health');
                setSelectedUnit(null);
                setSelectedCohort(null);
                setFocusedCohortId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedOrgId === 'apollo-health'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Sunrise Hospital (9 Depts)</span>
            </button>

            <button
              onClick={() => {
                setSelectedOrgId('st-jude-academy');
                setSelectedUnit(null);
                setSelectedCohort(null);
                setFocusedCohortId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedOrgId === 'st-jude-academy'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Greenfield School (8 Grades)</span>
            </button>

            <button
              onClick={() => {
                setSelectedOrgId('nexus-tech');
                setSelectedUnit(null);
                setSelectedCohort(null);
                setFocusedCohortId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedOrgId === 'nexus-tech'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Nimbus Tech (8 Divisions)</span>
            </button>
          </div>
        </div>

        {/* 3 BIG KPI TILES IN ONE ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tile 1: Organisation Stress Score */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Organisation stress score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">{meanBurnoutScore}</span>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">90-day biological cortisol baseline</p>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
              meanBurnoutScore > 80 ? 'bg-rose-50 text-rose-700 border-rose-200' :
              meanBurnoutScore > 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
              meanBurnoutScore > 35 ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {meanBurnoutScore > 80 ? '🔴 Burnout risk' :
               meanBurnoutScore > 60 ? '🟠 High stress' :
               meanBurnoutScore > 35 ? '🔵 Manageable' : '🟢 Healthy'}
            </div>
          </div>

          {/* Tile 2: Teams in Burnout Zone */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Teams in burnout zone
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-rose-600">{criticalUnitsCount}</span>
                <span className="text-sm font-bold text-slate-400">of {totalSubUnits} teams</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Requiring immediate schedule relief</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          {/* Tile 3: Top Recommended Action */}
          <div 
            onClick={() => {
              const el = document.getElementById('interventions-panel');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all group"
          >
            <div className="pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  1 Action could lower it most
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800">
                  -{currentOrg.interventions[0]?.projectedReductionPercent || 24}%
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mt-1">
                {currentOrg.interventions[0]?.title || 'Evening Digital Curfew'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Click to view 8-week impact plan ↓</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 1. TOP GRADIENT BAR WITH 4-COLOR GRADATION & CLINICAL INFERENCES */}
        <BurnoutGradientBar
          meanScore={meanBurnoutScore}
          organizationName={currentOrg.name}
        />

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
