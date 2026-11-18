'use client';

import React from 'react';
import { Droplet, CalendarClock, ClipboardList } from 'lucide-react';
import type { HairCortisolSegment, WeeklyTelemetry } from '@/lib/types';
import { PSS10_BAND_LABEL, type Pss10Result } from '@/lib/pss10';

interface StressSummaryProps {
  segments: HairCortisolSegment[];
  telemetry: WeeklyTelemetry[];
  pss10?: Pss10Result;
  /** Upper end of the healthy range, in pg/mg. */
  healthyBelow?: number;
  onSeeLateMeetings: () => void;
  onTakeQuestionnaire: () => void;
}

/** Three small bars with labels: enough to see the shape of three months at a glance. */
const MiniBars: React.FC<{ values: Array<{ label: string; value: number; color: string }> }> = ({ values }) => {
  const max = Math.max(1, ...values.map(v => v.value));
  return (
    <div className="mt-3 grid grid-cols-3 gap-1.5 items-end" aria-hidden="true">
      {values.map(v => (
        <div key={v.label} className="text-center">
          <div className="h-9 flex items-end">
            <div className="w-full rounded-t-md" style={{ height: `${Math.max(8, (v.value / max) * 100)}%`, backgroundColor: v.color }} />
          </div>
          <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{v.label}</div>
        </div>
      ))}
    </div>
  );
};

/**
 * "Hair tells us when, calendar tells us why": the peak hair cortisol month,
 * the late meetings in the same 90 days and the PSS-10 score, side by side.
 * Every number is computed from the user's own data.
 */
export const StressSummary: React.FC<StressSummaryProps> = ({
  segments,
  telemetry,
  pss10,
  healthyBelow = 14,
  onSeeLateMeetings,
  onTakeQuestionnaire,
}) => {
  if (!segments.length) return null;

  const peak = segments.reduce((a, b) => (b.cortisolPgPerMg > a.cortisolPgPerMg ? b : a));
  const peakIsHigh = peak.cortisolPgPerMg >= healthyBelow;

  const lateByMonth = new Map<number, { label: string; count: number }>();
  for (const week of telemetry) {
    const entry = lateByMonth.get(week.month) || { label: week.monthLabel, count: 0 };
    entry.count += week.eveningCalls || 0;
    lateByMonth.set(week.month, entry);
  }
  const totalLate = Array.from(lateByMonth.values()).reduce((sum, m) => sum + m.count, 0);
  const busiest = Array.from(lateByMonth.entries()).reduce<{ month: number; label: string; count: number } | null>(
    (best, [month, m]) => (!best || m.count > best.count ? { month, label: m.label, count: m.count } : best),
    null
  );
  const sameMonth = !!busiest && busiest.count > 0 && busiest.month === peak.id;

  const finding = !peakIsHigh
    ? `All three months are below ${healthyBelow.toFixed(1)} pg/mg, the upper end of the healthy range.`
    : sameMonth
    ? `Your hair cortisol peaked in ${peak.title}, the same month as your most meetings after 7 PM (${busiest!.count}).`
    : totalLate > 0 && busiest
    ? `Your hair cortisol peaked in ${peak.title}. Your late meetings peaked in ${busiest.label}, so the calendar does not fully explain it.`
    : `Your hair cortisol peaked in ${peak.title}. Your calendar shows no meetings after 7 PM, so the cause is likely outside it.`;

  const pssTone =
    pss10?.band === 'high'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : pss10?.band === 'moderate'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  return (
    <section
      className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-4"
      aria-label="Summary: hair cortisol, late meetings and questionnaire"
      data-testid="stress-summary"
    >
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">At a glance</div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
          Your hair tells us when. Your calendar tells us why.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Droplet className="w-3.5 h-3.5" />
            <span>Hair cortisol, highest month</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{peak.cortisolPgPerMg.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">pg/mg</span>
          </div>
          <span
            className={`inline-block mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              peakIsHigh ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {peakIsHigh ? `Peak in ${peak.title}` : 'In the healthy range'}
          </span>
          <MiniBars
            values={[...segments].sort((x, y) => x.id - y.id).map(seg => ({
              label: seg.title.slice(0, 3),
              value: seg.cortisolPgPerMg,
              color: seg.cortisolPgPerMg > 20 ? '#F43F5E' : seg.cortisolPgPerMg > 14 ? '#F59E0B' : '#10B981',
            }))}
          />
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Meetings after 7 PM</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalLate}</span>
            <span className="text-xs font-semibold text-slate-500">in 90 days</span>
          </div>
          <span
            className={`inline-block mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              totalLate > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {totalLate > 0 && busiest ? `Most in ${busiest.label} (${busiest.count})` : 'None found'}
          </span>
          <MiniBars
            values={Array.from(lateByMonth.entries())
              .sort((x, y) => x[0] - y[0])
              .map(([, m]) => ({ label: m.label.slice(0, 3), value: m.count, color: '#0D4F59' }))}
          />
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>How you felt (PSS-10)</span>
          </div>
          {pss10 ? (
            <>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">{pss10.score}</span>
                <span className="text-xs font-semibold text-slate-500">of 40</span>
              </div>
              <span className={`inline-block mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full border ${pssTone}`}>
                {PSS10_BAND_LABEL[pss10.band]}
              </span>
              <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(pss10.score / 40) * 100}%`,
                    backgroundColor: pss10.band === 'high' ? '#F43F5E' : pss10.band === 'moderate' ? '#F59E0B' : '#10B981',
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <p className="mt-1.5 text-xs text-slate-600 font-medium">Not answered yet. 10 questions, about 2 minutes.</p>
              <button
                type="button"
                onClick={onTakeQuestionnaire}
                className="mt-2 px-3 py-1.5 rounded-xl bg-[#0D4F59] hover:bg-blue-600 text-white text-[11px] font-bold cursor-pointer"
              >
                Answer the questionnaire
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-slate-200/80">
        <p className="text-xs sm:text-sm font-semibold text-slate-900">{finding}</p>
        <p className="text-[11px] text-slate-500 mt-1">
          An association in your own data, not proof of cause. Hair cortisol and how stressed you feel are only modestly
          linked, so we show both.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={onSeeLateMeetings}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold cursor-pointer"
          >
            See the late meetings
          </button>
        </div>
      </div>
    </section>
  );
};
