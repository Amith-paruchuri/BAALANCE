'use client';

import React, { useState } from 'react';
import { Sparkles, Sun, Calendar, Scissors, CheckCircle2, Check, Bell } from 'lucide-react';
import { GeminiSynthesisResult } from '@/lib/types';

interface GeminiProtocolCardsProps {
  synthesis: GeminiSynthesisResult;
  isSynthesizing?: boolean;
  onRefreshSynthesis?: () => void;
  onOpenCalendarModal?: () => void;
  onApplyCalendarRules?: () => void;
  calendarRulesApplied?: boolean;
}

const STEP_ICON: Record<string, typeof Sun> = {
  circadian: Sun,
  calendar: Calendar,
  audit: Scissors,
};

/**
 * The recovery plan as one path: three numbered steps on a rail, each with
 * two actions to tick off and one thing to do next.
 */
export const GeminiProtocolCards = React.memo<GeminiProtocolCardsProps>(({
  synthesis,
  isSynthesizing = false,
  onRefreshSynthesis,
  onOpenCalendarModal,
  onApplyCalendarRules,
  calendarRulesApplied = false,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [windDownGoalSet, setWindDownGoalSet] = useState(false);

  const protocols = synthesis.protocols || [];
  const allKeys = protocols.flatMap(p => p.actionItems.slice(0, 2).map((_, idx) => `${p.id}-${idx}`));
  const doneCount = allKeys.filter(k => completedSteps[k]).length;
  const progress = allKeys.length ? Math.round((doneCount / allKeys.length) * 100) : 0;

  // Re-test date: use the plan's date if it is still ahead, otherwise 8 weeks from today.
  const retestDate = (() => {
    const planned = synthesis.nextSalonAuditDate ? new Date(synthesis.nextSalonAuditDate) : null;
    const target = planned && !isNaN(planned.getTime()) && planned.getTime() > Date.now()
      ? planned
      : new Date(Date.now() + 56 * 24 * 60 * 60 * 1000);
    return target.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  const toggleStep = (stepKey: string) => {
    setCompletedSteps(prev => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  return (
    <section
      className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-5 font-sans"
      aria-label="Your three-step plan"
      data-testid="plan-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">What to do next</div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">Your 3-step plan</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Small changes to protect your evenings before your re-test in 8 weeks. The next haircut shows if it worked.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefreshSynthesis}
          disabled={isSynthesizing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 transition-colors cursor-pointer disabled:opacity-60 shrink-0 self-start"
        >
          <Sparkles className={`w-3.5 h-3.5 text-[#BF6F4E] ${isSynthesizing ? 'animate-spin' : ''}`} />
          <span>{isSynthesizing ? 'Updating with AI…' : 'Refresh plan'}</span>
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Actions done">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%`, transition: 'width 300ms ease' }} />
        </div>
        <span className="text-[11px] font-bold text-slate-500 shrink-0">
          {doneCount} of {allKeys.length} actions done
        </span>
      </div>

      {/* Steps on a rail */}
      <ol className="relative">
        {protocols.map((protocol, pIdx) => {
          const StepIcon = STEP_ICON[protocol.category] || Scissors;
          const isLast = pIdx === protocols.length - 1;
          const stepKeys = protocol.actionItems.slice(0, 2).map((_, idx) => `${protocol.id}-${idx}`);
          const stepDone = stepKeys.length > 0 && stepKeys.every(k => completedSteps[k]);

          return (
            <li key={protocol.id} className="relative flex gap-3 sm:gap-5">
              {/* Rail: number and connecting line */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-colors ${
                    stepDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-[#BF6F4E] text-[#BF6F4E]'
                  }`}
                >
                  {stepDone ? <Check className="w-4 h-4 stroke-[3]" /> : pIdx + 1}
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-[#EFE6DA] my-1.5" />}
              </div>

              {/* Step body */}
              <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-6'}`}>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <StepIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{protocol.title}</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{protocol.description}</p>

                      {/* One thing to do for this step */}
                      <div className="mt-3">
                        {protocol.category === 'circadian' && (
                          <button
                            type="button"
                            onClick={() => setWindDownGoalSet(!windDownGoalSet)}
                            aria-pressed={windDownGoalSet}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              windDownGoalSet ? 'bg-emerald-600 text-white' : 'bg-[#0D4F59] hover:bg-[#0B434B] text-white'
                            }`}
                          >
                            {windDownGoalSet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                            <span>{windDownGoalSet ? 'Goal set: wind down by 9:30 PM' : 'Set a 9:30 PM wind-down goal'}</span>
                          </button>
                        )}

                        {protocol.category === 'calendar' && (
                          <button
                            type="button"
                            onClick={onApplyCalendarRules || onOpenCalendarModal}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              calendarRulesApplied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-[#0D4F59] hover:bg-[#0B434B] text-white'
                            }`}
                          >
                            {calendarRulesApplied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                            <span>{calendarRulesApplied ? 'Changes approved. Review again' : 'Review suggested calendar changes'}</span>
                          </button>
                        )}

                        {protocol.category === 'audit' && (
                          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs">
                            <Scissors className="w-3.5 h-3.5 text-[#BF6F4E]" />
                            <span className="text-slate-500">Next hair sample around</span>
                            <span className="font-bold text-slate-900">{retestDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Two actions to tick off */}
                    <ul className="lg:col-span-3 space-y-2">
                      {protocol.actionItems.slice(0, 2).map((item, idx) => {
                        const itemKey = `${protocol.id}-${idx}`;
                        const isDone = !!completedSteps[itemKey];
                        return (
                          <li key={idx}>
                            <button
                              type="button"
                              onClick={() => toggleStep(itemKey)}
                              aria-pressed={isDone}
                              className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 ${
                                isDone ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white hover:bg-slate-50 border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'
                                }`}
                              >
                                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                              </span>
                              <span className={`text-xs leading-relaxed ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="text-[11px] text-slate-500">
        These are general wellbeing suggestions, not medical advice. If you feel unwell, see a doctor.
      </p>
    </section>
  );
});

GeminiProtocolCards.displayName = 'GeminiProtocolCards';
