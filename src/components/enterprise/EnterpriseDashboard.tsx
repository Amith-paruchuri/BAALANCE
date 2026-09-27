'use client';

import React, { useState } from 'react';
import { MOCK_ORGANIZATIONS } from '@/lib/enterpriseMockData';
import { Organization, SubUnit, CohortGroup } from '@/lib/enterpriseTypes';
import { EnterpriseWorkspaceSwitcher } from './EnterpriseWorkspaceSwitcher';
import { EnterpriseHeatmap } from './EnterpriseHeatmap';
import { ConfounderNormalizationCard } from './ConfounderNormalizationCard';
import { EnterpriseInterventionsPanel } from './EnterpriseInterventionsPanel';
import { Building2, GraduationCap, Stethoscope, AlertTriangle, Users, Activity, Sparkles } from 'lucide-react';

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
  const [showRawAssay, setShowRawAssay] = useState<boolean>(false);

  // Dynamic simulation of intervention biological recovery
  const [activeSimulations, setActiveSimulations] = useState<Record<string, boolean>>({});
  const [simulatedReductions, setSimulatedReductions] = useState<Record<string, number>>({});

  const handleSelectUnit = (unit: SubUnit, cohort: CohortGroup) => {
    setSelectedUnit(unit);
    setSelectedCohort(cohort);
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
  const averageBsi = Math.round(
    currentOrg.cohorts.reduce((acc, c) => acc + c.averageBsi, 0) / currentOrg.cohorts.length
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
          setSimulatedReductions({});
          setActiveSimulations({});
        }}
        onBackToIndividual={onBackToIndividual}
        onOpenJoinModal={onOpenJoinModal}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
        {/* Sector Quick Switcher Tabs (Ultra-convenient for evaluating the 3 sectors) */}
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
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedOrgId === 'apollo-health'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Hospitals & Healthcare (Apollo / AIIMS)</span>
            </button>

            <button
              onClick={() => {
                setSelectedOrgId('st-jude-academy');
                setSelectedUnit(null);
                setSelectedCohort(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedOrgId === 'st-jude-academy'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Schools & Universities (St. Jude Academy)</span>
            </button>

            <button
              onClick={() => {
                setSelectedOrgId('nexus-tech');
                setSelectedUnit(null);
                setSelectedCohort(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedOrgId === 'nexus-tech'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Corporate & Tech (Nexus / Stripe)</span>
            </button>
          </div>
        </div>

        {/* 4 High-Impact Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Monitored Units
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalSubUnits}</span>
              <span className="text-xs text-slate-500 font-bold">across {currentOrg.cohorts.length} cohorts</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Mean Biological Stress
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">BSI {averageBsi}</span>
              <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Compensated
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Burnout Hotspots
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-rose-600">{criticalUnitsCount}</span>
              <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Action Mandated
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cohort Compliance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                {currentOrg.currentCycle.complianceRatePercent}%
              </span>
              <span className="text-xs text-slate-500 font-bold">
                {currentOrg.totalSampled} sequenced
              </span>
            </div>
          </div>
        </div>

        {/* The Core Heatmap Matrix */}
        <EnterpriseHeatmap
          cohorts={currentOrg.cohorts}
          selectedUnitId={selectedUnit?.id || null}
          onSelectUnit={handleSelectUnit}
          showRawAssay={showRawAssay}
          onToggleRawAssay={setShowRawAssay}
          simulatedReductions={simulatedReductions}
        />

        {/* 2-Column Responsive Layout: Confounder Normalizer + Tailored Interventions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConfounderNormalizationCard
            confounders={currentOrg.confounderProfiles}
            activeUnitName={selectedUnit?.name}
            detectedConfounders={selectedUnit?.confoundersDetected || []}
          />

          <EnterpriseInterventionsPanel
            interventions={currentOrg.interventions}
            selectedUnit={selectedUnit}
            selectedCohort={selectedCohort}
            onSimulateIntervention={handleSimulateIntervention}
            activeSimulations={activeSimulations}
          />
        </div>
      </div>
    </div>
  );
};
