'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Flag, ShieldCheck } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';

type AgentInfo = NonNullable<ChatMessage['agent']>;

const TOOL_LABEL: Record<string, string> = {
  get_hair_results: 'hair results',
  get_scores: 'scores',
  get_calendar_load: 'calendar',
  get_week_detail: 'one week',
  search_evidence: 'evidence search',
  get_helplines: 'helplines',
  suggest_app_action: 'app actions',
};

/**
 * "How Tricha answered": every stage the message went through, and for each
 * agent what it was asked, what it found and what it flagged. Collapsed by
 * default so the answer stays the focus.
 */
export const AgentTracePanel: React.FC<{ agent: AgentInfo }> = ({ agent }) => {
  const [open, setOpen] = useState(false);
  const pipeline = agent.pipeline || [];
  const trace = agent.trace || [];
  if (pipeline.length === 0 && trace.length === 0) return null;
  const flagCount = trace.reduce((n, t) => n + (t.flags?.length || 0), 0) + (agent.dataFlags || []).filter(f => f.severity === 'warn').length;

  return (
    <div className="text-[11px]" data-testid="agent-trace-panel">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex items-center gap-1 font-bold text-[#0D4F59] hover:underline cursor-pointer"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        How Tricha answered
        {flagCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">{flagCount} flagged</span>}
      </button>

      {open && (
        <ol className="mt-2 space-y-2 border-l-2 border-[#EFE6DA] pl-3">
          {pipeline.map((step, i) => {
            const isAgents = step.stage === 'Agents';
            return (
              <li key={`${step.stage}-${i}`} className="space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0D4F59] shrink-0 mt-px" />
                  <div>
                    <span className="font-bold text-slate-800">{step.stage}: </span>
                    <span className="text-slate-700">{step.status}</span>
                    {step.detail && <div className="text-slate-500">{step.detail}</div>}
                  </div>
                </div>

                {isAgents && trace.length > 0 && (
                  <ul className="space-y-1.5 ml-5">
                    {trace.map((t, j) => (
                      <li key={`${t.agent}-${j}`} className="rounded-lg bg-white border border-slate-200 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800">{t.role} agent</span>
                          <span className="text-slate-400 font-mono">{(t.ms / 1000).toFixed(1)} s</span>
                        </div>
                        {t.question && <div className="text-slate-500 mt-0.5">Asked: {t.question}</div>}
                        {t.output && <div className="text-slate-700 mt-0.5 whitespace-pre-line">{t.output}</div>}
                        {t.tools && t.tools.length > 0 && (
                          <div className="text-slate-400 mt-0.5">Used: {Array.from(new Set(t.tools)).map(x => TOOL_LABEL[x] || x).join(', ')}</div>
                        )}
                        {t.flags && t.flags.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {t.flags.map((f, k) => (
                              <li key={k} className="flex items-start gap-1 text-amber-900">
                                <Flag className="w-3 h-3 shrink-0 mt-px" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
          <li className="text-slate-500">
            <a href="/tricha" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-800">How this pipeline works and how it is tested</a>
          </li>
        </ol>
      )}
    </div>
  );
};
