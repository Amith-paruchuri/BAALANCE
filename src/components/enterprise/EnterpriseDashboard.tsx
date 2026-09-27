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
              <span>Hospitals & Healthcare (Apollo / AIIMS — 9 Departments)</span>
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
              <span>Schools & Universities (St. Jude Academy — 8 Grades & Labs)</span>
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
              <span>Corporate & Tech (Nexus / Stripe — 8 Divisions)</span>
            </button>
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
