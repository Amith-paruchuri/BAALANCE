'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Calendar,
  Scissors,
  CheckCircle2,
  ExternalLink,
  Flame,
  ArrowRight,
  ShieldCheck,
  Clock,
  Check,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { GeminiSynthesisResult } from '@/lib/types';

interface GeminiProtocolCardsProps {
  synthesis: GeminiSynthesisResult;
  isSynthesizing?: boolean;
  onRefreshSynthesis?: () => void;
  onOpenCalendarModal?: () => void;
  onApplyCalendarRules?: () => void;
  calendarRulesApplied?: boolean;
}

export const GeminiProtocolCards: React.FC<GeminiProtocolCardsProps> = ({
  synthesis,
  isSynthesizing = false,
  onRefreshSynthesis,
  onOpenCalendarModal,
  onApplyCalendarRules,
  calendarRulesApplied = false,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [circadianReminderSet, setCircadianReminderSet] = useState(false);

  const toggleStep = (stepKey: string) => {
    setCompletedSteps(prev => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  const getPillarTheme = (category: string) => {
    switch (category) {
      case 'circadian':
        return {
          icon: Sun,
          accentColor: 'text-amber-600',
          iconBg: 'bg-amber-500/10 border-amber-200/80',
          badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/80',
          borderGlow: 'hover:border-amber-300',
          topLine: 'bg-gradient-to-r from-amber-400 to-orange-400',
          stepCheck: 'text-amber-600 bg-amber-50 border-amber-200',
        };
      case 'calendar':
        return {
          icon: Calendar,
          accentColor: 'text-[#3186FF]',
          iconBg: 'bg-blue-500/10 border-blue-200/80',
          badgeBg: 'bg-blue-50 text-blue-900 border-blue-200/80',
          borderGlow: 'hover:border-blue-300',
          topLine: 'bg-gradient-to-r from-[#3186FF] to-indigo-500',
          stepCheck: 'text-[#3186FF] bg-blue-50 border-blue-200',
        };
      case 'audit':
      default:
        return {
          icon: Scissors,
          accentColor: 'text-purple-600',
          iconBg: 'bg-purple-500/10 border-purple-200/80',
          badgeBg: 'bg-purple-50 text-purple-900 border-purple-200/80',
          borderGlow: 'hover:border-purple-300',
          topLine: 'bg-gradient-to-r from-purple-500 to-rose-400',
          stepCheck: 'text-purple-600 bg-purple-50 border-purple-200',
        };
    }
  };

  return (
    <div className="space-y-3.5 font-sans">
      {/* Header: Executive Recovery Architecture */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3186FF]" />
              <span>3-Pillar Clinical Recovery Protocols</span>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-black tracking-tight mt-0.5">
            Personalized Recovery Architecture
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted chronobiological interventions to protect evening boundaries and bring cortisol back to baseline
          </p>
        </div>

        <button
          type="button"
          onClick={onRefreshSynthesis}
          disabled={isSynthesizing}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-[#3186FF] border border-[#E2E8F0] shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
          <span>{isSynthesizing ? 'Gemini AI Optimizing...' : 'Refresh Protocols'}</span>
        </button>
      </div>

      {/* Three Actionable Protocol Cards with Balanced Vertical Alignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {synthesis.protocols.map((protocol, pIdx) => {
          const theme = getPillarTheme(protocol.category);
          const PillarIcon = theme.icon;

          return (
            <div
              key={protocol.id}
              className={`bg-white rounded-3xl border border-[#E2E8F0] shadow-card hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative group ${theme.borderGlow}`}
            >
              {/* Top Accent Gradient Ribbon */}
              <div className={`h-1.5 w-full ${theme.topLine}`} />

              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                {/* Protocol Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center shadow-2xs ${theme.iconBg}`}>
                      <PillarIcon className={`w-4 h-4 ${theme.accentColor}`} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        {protocol.categoryLabel}
                      </span>
                      <h4 className="text-xs sm:text-[13px] font-bold text-black leading-tight mt-0.5">
                        {protocol.title}
                      </h4>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border shadow-2xs shrink-0 ${theme.badgeBg}`}>
                    {protocol.badge}
                  </span>
                </div>

                {/* Subtitle / Objective Description */}
                <p className="text-xs text-slate-600 mb-3.5 leading-relaxed">
                  {protocol.description}
                </p>

                {/* Action Items List with Interactive Micro-Checklist */}
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
                    <span>Action Checklist</span>
                    <span className="text-slate-400 font-medium">Click to mark complete</span>
                  </div>

                  <div className="space-y-1.5">
                    {protocol.actionItems.map((item, idx) => {
                      const itemKey = `${protocol.id}-${idx}`;
                      const isDone = !!completedSteps[itemKey];

                      return (
                        <div
                          key={idx}
                          onClick={() => toggleStep(itemKey)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 text-xs ${
                            isDone
                              ? 'bg-emerald-50/50 border-emerald-200 text-slate-500 line-through'
                              : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/70 text-slate-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-600 text-white'
                                : 'bg-white border-slate-300 group-hover:border-slate-400'
                            }`}
                          >
                            {isDone ? (
                              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                            ) : (
                              <span className="text-[9px] font-bold font-mono text-slate-400">{idx + 1}</span>
                            )}
                          </div>
                          <span className="leading-snug text-[11px] select-none">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Impact Metric & Uniform Aligned Action Row */}
              <div className="p-4 sm:p-5 pt-0 space-y-2.5">
                {/* Clinical Impact Pill */}
                <div className="text-[11px] font-medium text-emerald-950 bg-gradient-to-r from-emerald-50 to-teal-50/60 p-2.5 rounded-xl border border-emerald-200/70 flex items-center gap-2 shadow-2xs">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="leading-tight">{protocol.impactMetric}</span>
                </div>

                {/* Pillar Specific Bottom Action (Uniform Height Across All 3 Cards) */}
                {protocol.category === 'circadian' && (
                  <button
                    type="button"
                    onClick={() => setCircadianReminderSet(!circadianReminderSet)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                      circadianReminderSet
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                    }`}
                  >
                    {circadianReminderSet ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Curfew Target Activated (9:30 PM)</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Activate 9:30 PM Wind-Down Goal</span>
                      </>
                    )}
                  </button>
                )}

                {protocol.category === 'calendar' && (
                  <button
                    type="button"
                    onClick={onApplyCalendarRules || onOpenCalendarModal}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                      calendarRulesApplied
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300 shadow-emerald-200'
                        : 'bg-[#3186FF] hover:bg-blue-600 text-white'
                    }`}
                  >
                    {calendarRulesApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>✓ Rules Enforced Across Future Dates</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Apply Calendar Rules</span>
                      </>
                    )}
                  </button>
                )}

                {protocol.category === 'audit' && (
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs px-3">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-500 font-medium block">Next Salon Hair Snip</span>
                      <span className="text-xs font-bold text-black font-mono">
                        {synthesis.nextSalonAuditDate || 'November 14, 2026'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                      LAKME Salon
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
