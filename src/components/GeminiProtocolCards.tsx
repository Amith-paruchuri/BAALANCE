'use client';

import React, { useState } from 'react';
import { Sparkles, Calendar, Scissors, CheckCircle2, Check, Bell, ArrowRight } from 'lucide-react';
import { useInView } from '@/lib/useInView';
import { GeminiSynthesisResult } from '@/lib/types';

interface GeminiProtocolCardsProps {
  synthesis: GeminiSynthesisResult;
  isSynthesizing?: boolean;
  onRefreshSynthesis?: () => void;
  onOpenCalendarModal?: () => void;
  onApplyCalendarRules?: () => void;
  calendarRulesApplied?: boolean;
  /** Meetings after 7 PM in the last 90 days, from the user's calendar. */
  lateMeetings?: number;
  /** Hours of sleep per night, from the user's questionnaire. */
  sleepHours?: number;
}

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
  lateMeetings,
  sleepHours,
}) => {
  const { ref, inView } = useInView<HTMLElement>(0.15);
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

  // Each step opens with a small picture and the user's own number, so the plan reads as theirs.
  const scenes: Record<string, { tint: string; from: string; to: string; caption: string; art: React.ReactNode }> = {
    circadian: {
      tint: 'bg-amber-50 border-amber-100',
      from: typeof sleepHours === 'number' && sleepHours > 0 ? `${sleepHours} h` : 'Now',
      to: typeof sleepHours === 'number' && sleepHours >= 7 ? 'Keep it' : '7 to 8 h',
      caption: 'Sleep per night',
      art: (
        <svg viewBox="0 0 120 70" className="w-28 h-auto" aria-hidden="true">
          <path d="M8 58 A52 52 0 0 1 112 58" fill="none" stroke="#F1C27D" strokeWidth="2" strokeDasharray="3 5" />
          <line x1="4" y1="58" x2="116" y2="58" stroke="#E7C9A0" strokeWidth="2" strokeLinecap="round" />
          <circle cx="26" cy="27" r="9" fill="#F59E0B" />
          <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
            <line x1="26" y1="10" x2="26" y2="14" /><line x1="11" y1="27" x2="15" y2="27" /><line x1="14" y1="15" x2="17" y2="18" /><line x1="38" y1="15" x2="35" y2="18" />
          </g>
          <path d="M100 30 a10 10 0 1 0 6 16 a8 8 0 0 1 -6 -16z" fill="#0D4F59" />
          <circle cx="84" cy="22" r="1.5" fill="#0D4F59" /><circle cx="94" cy="14" r="1.2" fill="#0D4F59" />
        </svg>
      ),
    },
    calendar: {
      tint: 'bg-[#EEF6F6] border-[#D8EBEC]',
      from: typeof lateMeetings === 'number' ? String(lateMeetings) : 'Now',
      to: typeof lateMeetings === 'number' && lateMeetings === 0 ? 'Keep it' : 'None',
      caption: 'Meetings after 7 PM',
      art: (
        <svg viewBox="0 0 80 80" className="w-20 h-auto" aria-hidden="true">
          <circle cx="40" cy="40" r="32" fill="#FFFFFF" stroke="#0D4F59" strokeWidth="3" />
          {/* 7 PM to 11 PM, the hours to protect */}
          <path d="M40 40 L24 67.7 A32 32 0 0 1 12.3 24 Z" fill="#F43F5E" opacity="0.85" />
          <line x1="40" y1="40" x2="40" y2="20" stroke="#0D4F59" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="40" x2="27" y2="62" stroke="#0D4F59" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="40" r="3" fill="#0D4F59" />
        </svg>
      ),
    },
    audit: {
      tint: 'bg-[#FBF7F2] border-[#EFE6DA]',
      from: '8 weeks',
      to: retestDate,
      caption: 'Until your next hair sample',
      art: (
        <svg viewBox="0 0 80 80" className="w-20 h-auto" aria-hidden="true">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#EAD9C8" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke="#BF6F4E"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="188.5"
            strokeDashoffset={inView ? 141 : 188.5}
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 1400ms ease 500ms' }}
          />
          <text x="40" y="38" textAnchor="middle" fontSize="20" fontWeight="800" fill="#6B3A25" fontFamily="inherit">8</text>
          <text x="40" y="52" textAnchor="middle" fontSize="9" fontWeight="700" fill="#8A4B32" fontFamily="inherit">weeks</text>
        </svg>
      ),
    },
  };

  return (
    <section
      ref={ref}
      className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-5 font-sans"
      aria-label="Your three-step plan"
      data-testid="plan-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">What to do next</div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">Three changes before your next haircut</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Built from your own numbers. In 8 weeks, a new hair sample shows whether they worked.
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
        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Actions done">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%`, transition: 'width 400ms ease' }} />
        </div>
        <span className="text-[11px] font-bold text-slate-500 shrink-0">
          {doneCount} of {allKeys.length} done
        </span>
      </div>

      {/* Three steps, each opening with a picture and the user's own number */}
      <ol className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {protocols.map((protocol, pIdx) => {
          const scene = scenes[protocol.category] || scenes.audit;
          const stepKeys = protocol.actionItems.slice(0, 2).map((_, idx) => `${protocol.id}-${idx}`);
          const stepDone = stepKeys.length > 0 && stepKeys.every(k => completedSteps[k]);

          return (
            <li
              key={protocol.id}
              className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden flex flex-col"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(18px)',
                transition: `opacity 600ms ease ${pIdx * 140}ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${pIdx * 140}ms`,
              }}
            >
              {/* Scene */}
              <div className={`relative px-4 py-4 border-b ${scene.tint} flex items-center justify-between gap-3`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                        stepDone ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    >
                      {stepDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : pIdx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">{scene.caption}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 leading-none">{scene.from}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                    <span className="text-base sm:text-lg font-extrabold text-emerald-700 leading-none">{scene.to}</span>
                  </div>
                </div>
                <div className="shrink-0">{scene.art}</div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-base font-extrabold text-slate-900">{protocol.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{protocol.description}</p>

                <ul className="space-y-2 mt-3 flex-1">
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
                            isDone ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200'
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

                <div className="mt-4">
                  {protocol.category === 'circadian' && (
                    <button
                      type="button"
                      onClick={() => setWindDownGoalSet(!windDownGoalSet)}
                      aria-pressed={windDownGoalSet}
                      className={`w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
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
                      className={`w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        calendarRulesApplied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-[#0D4F59] hover:bg-[#0B434B] text-white'
                      }`}
                    >
                      {calendarRulesApplied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                      <span>{calendarRulesApplied ? 'Changes approved. Review again' : 'Review suggested calendar changes'}</span>
                    </button>
                  )}
                  {protocol.category === 'audit' && (
                    <div className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FBF7F2] border border-[#EFE6DA] text-xs">
                      <Scissors className="w-3.5 h-3.5 text-[#BF6F4E]" />
                      <span className="text-slate-600">Book your next haircut for around</span>
                      <span className="font-bold text-slate-900">{retestDate}</span>
                    </div>
                  )}
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
