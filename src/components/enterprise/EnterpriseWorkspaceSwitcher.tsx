'use client';

import React, { useState } from 'react';
import { Building2, GraduationCap, Stethoscope, ChevronDown, Check, ShieldCheck, ArrowLeft, Plus } from 'lucide-react';
import { Organization } from '@/lib/enterpriseTypes';
import { MOCK_ORGANIZATIONS } from '@/lib/enterpriseMockData';

interface EnterpriseWorkspaceSwitcherProps {
  currentOrg: Organization;
  onSelectOrg: (orgId: string) => void;
  onBackToIndividual: () => void;
  onOpenJoinModal?: () => void;
}

export const EnterpriseWorkspaceSwitcher: React.FC<EnterpriseWorkspaceSwitcherProps> = ({
  currentOrg,
  onSelectOrg,
  onBackToIndividual,
  onOpenJoinModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSectorIcon = (sector: string, className = 'w-4 h-4') => {
    switch (sector) {
      case 'healthcare':
        return <Stethoscope className={`${className} text-rose-500`} />;
      case 'education':
        return <GraduationCap className={`${className} text-amber-500`} />;
      case 'corporate':
      default:
        return <Building2 className={`${className} text-blue-500`} />;
    }
  };

  const getSectorBadge = (sector: string) => {
    switch (sector) {
      case 'healthcare':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Hospital & Healthcare</span>;
      case 'education':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">K-12 & University</span>;
      case 'corporate':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Corporate & Tech</span>;
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Organization dropdown + Back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToIndividual}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title="Switch back to Individual Biomarkers & Calendar Curfew"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Individual Portal</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Slack-style workspace selector */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition-all text-left cursor-pointer active:scale-98"
            >
              <span className="text-xl shrink-0">{currentOrg.logoEmoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
                    {currentOrg.name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <span>{currentOrg.location}</span>
                  <span>•</span>
                  <span>{currentOrg.totalSampled} / {currentOrg.totalMembers} active participants</span>
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Institutional Workspaces (Slack Style)
                  </p>
                </div>

                <div className="p-1 space-y-1">
                  {Object.values(MOCK_ORGANIZATIONS).map((org) => {
                    const isSelected = org.id === currentOrg.id;
                    return (
                      <button
                        key={org.id}
                        onClick={() => {
                          onSelectOrg(org.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected ? 'bg-blue-50/70 border border-blue-200' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{org.logoEmoji}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">{org.name}</span>
                              {getSectorBadge(org.sector)}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {org.cohorts.length} Units • {org.totalSampled} samples analyzed
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#3186FF] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {onOpenJoinModal && (
                  <div className="p-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onOpenJoinModal();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Join with Institutional Email</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Sampling Round & Privacy Shield Badge */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Demo data
          </span>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{currentOrg.currentCycle.name.split(' ')[0]} Cycle ({currentOrg.currentCycle.complianceRatePercent}% collected)</span>
          </div>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xs"
            title="Privacy Guard: All cells require ≥ 5 members. Individual test scores are never shared with leadership."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Anonymous: groups of 5+ only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
