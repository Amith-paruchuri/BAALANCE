'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardList, X, CheckCircle2 } from 'lucide-react';
import {
  PSS10_ITEMS,
  PSS10_OPTIONS,
  PSS10_STEM,
  PSS10_BAND_LABEL,
  isCompletePss10,
  scorePss10,
  type Pss10Band,
  type Pss10Result,
} from '@/lib/pss10';

interface Pss10CardProps {
  result?: Pss10Result;
  history?: Pss10Result[];
  onComplete: (result: Pss10Result) => void;
}

const BAND_STYLE: Record<Pss10Band, string> = {
  low: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  moderate: 'bg-amber-50 text-amber-800 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const Pss10Card: React.FC<Pss10CardProps> = ({ result, history = [], onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState<Array<number | null>>(() => PSS10_ITEMS.map(() => null));

  const answered = answers.filter(a => a !== null).length;
  const previous = history.length > 0 ? history[history.length - 1] : undefined;
  const change = result && previous ? result.score - previous.score : null;

  const open = () => {
    setAnswers(PSS10_ITEMS.map(() => null));
    setIsOpen(true);
  };

  const submit = () => {
    if (!isCompletePss10(answers)) return;
    onComplete(scorePss10(answers));
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-4" data-testid="pss10-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">How you feel</div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">Stress questionnaire (PSS-10)</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            10 questions, about 2 minutes. How stressed you felt in the last month, to read next to your hair result.
          </p>
        </div>
        <button
          type="button"
          onClick={open}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-[#0D4F59] hover:bg-[#0B434B] text-white text-xs font-bold transition-colors cursor-pointer"
        >
          {result ? 'Retake' : 'Start'}
        </button>
      </div>

      {result ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{result.score}</span>
            <span className="text-xs font-semibold text-slate-500">/ 40</span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${BAND_STYLE[result.band]}`}>
            {PSS10_BAND_LABEL[result.band]}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Completed {formatDate(result.completedAt)}</span>
          {change !== null && previous && (
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
              {change === 0 ? 'No change' : `${change > 0 ? '+' : ''}${change} points`} since {formatDate(previous.completedAt)}
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-600 font-medium">
          Not completed yet. Hair cortisol shows the body&apos;s stress load; this shows how stressed you feel. We use both.
        </p>
      )}

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Perceived Stress Scale (Cohen, Kamarck and Mermelstein, 1983). Scores of 0 to 13 are usually read as low, 14 to 26
        as moderate and 27 to 40 as high. It is a screening questionnaire, not a diagnosis.
      </p>

      {/* Rendered on <body> so the page's animated containers cannot offset the fixed overlay. */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans"
          role="dialog"
          aria-modal="true"
          aria-label="PSS-10 stress questionnaire"
        >
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Stress questionnaire (PSS-10)</h2>
                <p className="text-xs text-slate-600 mt-1">
                  These questions ask about your feelings and thoughts during the last month. Pick how often you felt or
                  thought a certain way.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close questionnaire"
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {PSS10_ITEMS.map((item, index) => (
                <fieldset key={item.id} className="space-y-2">
                  <legend className="text-xs sm:text-sm font-semibold text-slate-900">
                    <span className="text-slate-400 font-mono mr-1.5">{item.id}.</span>
                    {PSS10_STEM} {item.text}
                  </legend>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {PSS10_OPTIONS.map(option => {
                      const selected = answers[index] === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`text-[11px] sm:text-xs font-semibold text-center px-2 py-2 rounded-xl border cursor-pointer transition-colors ${
                            selected
                              ? 'bg-[#0D4F59] border-[#0D4F59] text-white'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`pss10-${item.id}`}
                            value={option.value}
                            checked={selected}
                            onChange={() => setAnswers(prev => prev.map((a, i) => (i === index ? option.value : a)))}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-600">
                {answered} of {PSS10_ITEMS.length} answered
              </span>
              <button
                type="button"
                onClick={submit}
                disabled={answered < PSS10_ITEMS.length}
                className="px-5 py-2.5 rounded-xl bg-[#0D4F59] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>See my score</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
