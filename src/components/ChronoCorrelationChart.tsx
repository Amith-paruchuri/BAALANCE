'use client';

import React, { useState } from 'react';
import { Moon } from 'lucide-react';
import type { HairCortisolSegment, WeeklyTelemetry } from '@/lib/types';
import { useInView } from '@/lib/useInView';

interface ChronoCorrelationChartProps {
  telemetry: WeeklyTelemetry[];
  segments?: HairCortisolSegment[];
  activeSegmentId: 1 | 2 | 3;
  onSelectWeek?: (weekNumber: number) => void;
  onSelectSegment?: (id: 1 | 2 | 3) => void;
  isCalendarConnected?: boolean;
  calendarEmail?: string;
  userRole?: string;
}

const cortisolTone = (value: number) =>
  value > 20
    ? { color: '#F43F5E', soft: 'bg-rose-50 border-rose-200 text-rose-700', word: 'high' }
    : value > 14
    ? { color: '#F59E0B', soft: 'bg-amber-50 border-amber-200 text-amber-800', word: 'raised' }
    : { color: '#10B981', soft: 'bg-emerald-50 border-emerald-200 text-emerald-800', word: 'healthy' };

/**
 * Week by week: one bar per week for meeting hours, coloured by that month's
 * hair cortisol. Hair gives one value per centimetre (one per month), so the
 * four weeks of a month share a colour. Bars rise into place when the reader
 * reaches the section.
 */
export const ChronoCorrelationChart = React.memo<ChronoCorrelationChartProps>(({
  telemetry,
  segments = [],
  activeSegmentId,
  onSelectWeek,
  onSelectSegment,
  isCalendarConnected = false,
}) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [focusWeek, setFocusWeek] = useState<number | null>(null);

  const months = ([1, 2, 3] as const).map(id => {
    const weeks = telemetry.filter(w => w.month === id).sort((a, b) => a.weekNumber - b.weekNumber);
    const segment = segments.find(s => s.id === id);
    const cortisol = segment?.cortisolPgPerMg ?? (weeks.length ? weeks.reduce((s, w) => s + w.cortisolPgPerMg, 0) / weeks.length : 0);
    return {
      id,
      label: segment?.title || weeks[0]?.monthLabel || `Month ${id}`,
      cortisol: Math.round(cortisol * 10) / 10,
      tone: cortisolTone(cortisol),
      weeks,
      hours: weeks.reduce((s, w) => s + (w.meetingHours || 0), 0),
      late: weeks.reduce((s, w) => s + (w.eveningCalls || 0), 0),
    };
  });

  const maxHours = Math.max(20, ...telemetry.map(w => w.meetingHours || 0));
  const scaleTop = Math.ceil(maxHours / 20) * 20;
  const gridLines = [scaleTop, (scaleTop * 2) / 3, scaleTop / 3, 0].map(v => Math.round(v));

  const peakMonth = months.reduce((a, b) => (b.cortisol > a.cortisol ? b : a));
  const busiestMonth = months.reduce((a, b) => (b.hours > a.hours ? b : a));
  const aligned = peakMonth.cortisol > 14 && peakMonth.id === busiestMonth.id && busiestMonth.hours > 0;
  const headline = aligned
    ? 'Stress rose when meetings did.'
    : peakMonth.cortisol > 14
    ? 'Your busiest weeks and your highest cortisol do not line up.'
    : 'Your weeks, next to your hair result.';

  const focused = focusWeek !== null ? telemetry.find(w => w.weekNumber === focusWeek) : null;
  const focusedMonth = focused ? months.find(m => m.id === focused.month) : null;

  return (
    <section
      ref={ref}
      className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-5 font-sans"
      aria-label="Week by week"
      data-testid="chart-card"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">Week by week</div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">{headline}</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Each bar is one week of meetings. Its colour is that month&apos;s hair cortisol.
          </p>
        </div>
        <span className="self-start text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
          {isCalendarConnected ? 'Your calendar' : 'Sample data'}
        </span>
      </div>

      <div className="rounded-2xl border border-[#EFE6DA] bg-gradient-to-b from-[#FBF7F2] to-white p-3 sm:p-5">
        <div className="flex gap-2 sm:gap-3">
          {/* Hours scale */}
          <div className="relative w-8 sm:w-10 shrink-0 h-52 sm:h-60 mt-[52px]" aria-hidden="true">
            {gridLines.map((value, i) => (
              <span
                key={i}
                className="absolute right-0 -translate-y-1/2 text-[10px] font-semibold text-slate-400"
                style={{ top: `${(i / (gridLines.length - 1)) * 100}%` }}
              >
                {value}h
              </span>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4 min-w-0">
            {months.map((month, monthIndex) => {
              const isActive = activeSegmentId === month.id;
              return (
                <div key={month.id} className="min-w-0">
                  {/* Month header: the hair cortisol value for that centimetre */}
                  <button
                    type="button"
                    onClick={() => onSelectSegment?.(month.id)}
                    aria-pressed={isActive}
                    className={`w-full h-11 px-1 rounded-xl border text-center cursor-pointer transition-shadow ${month.tone.soft} ${
                      isActive ? 'ring-2 ring-offset-1' : ''
                    }`}
                    style={isActive ? ({ '--tw-ring-color': month.tone.color } as React.CSSProperties) : undefined}
                  >
                    <div className="text-[11px] sm:text-xs font-extrabold leading-tight truncate">{month.label}</div>
                    <div className="text-[10px] sm:text-[11px] font-semibold leading-tight truncate">
                      {month.cortisol} pg/mg<span className="hidden sm:inline"> · {month.tone.word}</span>
                    </div>
                  </button>

                  {/* Bars */}
                  <div className="relative h-52 sm:h-60 mt-2">
                    {gridLines.map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-x-0 border-t border-dashed border-slate-200"
                        style={{ top: `${(i / (gridLines.length - 1)) * 100}%` }}
                        aria-hidden="true"
                      />
                    ))}
                    <div className="absolute inset-0 flex items-end justify-around gap-1 sm:gap-2 px-0.5">
                      {month.weeks.map((week, weekIndex) => {
                        const order = monthIndex * 4 + weekIndex;
                        const heightPct = Math.max(2, ((week.meetingHours || 0) / scaleTop) * 100);
                        const isFocused = focusWeek === week.weekNumber;
                        return (
                          <button
                            key={week.weekNumber}
                            type="button"
                            onMouseEnter={() => setFocusWeek(week.weekNumber)}
                            onMouseLeave={() => setFocusWeek(null)}
                            onFocus={() => setFocusWeek(week.weekNumber)}
                            onBlur={() => setFocusWeek(null)}
                            onClick={() => {
                              setFocusWeek(week.weekNumber);
                              onSelectWeek?.(week.weekNumber);
                              onSelectSegment?.(month.id);
                            }}
                            aria-label={`Week ${week.weekNumber}, ${week.dateRange}: ${week.meetingHours} meeting hours, ${week.eveningCalls} meetings after 7 PM`}
                            className="relative flex-1 max-w-[44px] h-full flex items-end cursor-pointer group"
                          >
                            <span
                              className="relative w-full rounded-t-lg"
                              style={{
                                height: inView ? `${heightPct}%` : '0%',
                                backgroundColor: month.tone.color,
                                opacity: isFocused || focusWeek === null ? 1 : 0.45,
                                transition: `height 900ms cubic-bezier(0.22, 1, 0.36, 1) ${order * 70}ms, opacity 200ms ease`,
                              }}
                            >
                              <span
                                className="absolute -top-5 inset-x-0 text-center text-[10px] font-bold text-slate-700"
                                style={{ opacity: inView ? 1 : 0, transition: `opacity 400ms ease ${order * 70 + 700}ms` }}
                              >
                                {Math.round(week.meetingHours || 0)}
                              </span>
                              {week.eveningCalls > 0 && heightPct > 18 && (
                                <span className="absolute bottom-1 inset-x-0 flex flex-col items-center text-white/95" aria-hidden="true">
                                  <Moon className="w-3 h-3" />
                                  <span className="text-[9px] font-bold leading-none mt-0.5">{week.eveningCalls}</span>
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Week labels */}
                  <div className="flex justify-around gap-1 sm:gap-2 px-0.5 mt-1.5">
                    {month.weeks.map(week => (
                      <span key={week.weekNumber} className="flex-1 max-w-[44px] text-center text-[10px] font-semibold text-slate-400">
                        W{week.weekNumber}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail for the week under the pointer, or how to read the chart */}
        <div className="mt-4 min-h-[2.5rem] flex items-center justify-center text-center" aria-live="polite">
          {focused && focusedMonth ? (
            <p className="text-xs sm:text-sm text-slate-700">
              <span className="font-extrabold text-slate-900">Week {focused.weekNumber}</span> ({focused.dateRange}):{' '}
              <span className="font-bold">{focused.meetingHours} meeting hours</span>, {focused.eveningCalls} after 7 PM. Hair cortisol for{' '}
              {focusedMonth.label}: {focusedMonth.cortisol} pg/mg.
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Moon className="w-3 h-3" /> Meetings after 7 PM that week
              </span>
              <span>Numbers above the bars are meeting hours</span>
              <span>Hair gives one cortisol value per month</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

ChronoCorrelationChart.displayName = 'ChronoCorrelationChart';
