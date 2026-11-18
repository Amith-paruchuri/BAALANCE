'use client';

import React, { useState } from 'react';
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

const HEALTHY_LIMIT = 14;

const cortisolTone = (value: number) =>
  value > 20
    ? { color: '#F43F5E', soft: 'bg-rose-50 border-rose-200 text-rose-700', word: 'high' }
    : value > 14
    ? { color: '#F59E0B', soft: 'bg-amber-50 border-amber-200 text-amber-800', word: 'raised' }
    : { color: '#10B981', soft: 'bg-emerald-50 border-emerald-200 text-emerald-800', word: 'healthy' };

/**
 * Week by week: one bar per week for meeting hours (coloured by that month's
 * measured hair cortisol), with a dot-and-line plot of weekly hair cortisol on
 * top. The lab measures one value per centimetre (one per month); the weekly
 * points are estimates derived from those, and the chart says so. Bars rise and
 * the line draws when the reader reaches the section.
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

  // Weekly hair cortisol, drawn over the bars against its own (right-hand) scale.
  const allWeeks = months.flatMap(m => m.weeks);
  const cortisolTop = Math.max(20, Math.ceil(Math.max(HEALTHY_LIMIT, ...allWeeks.map(w => w.cortisolPgPerMg || 0)) / 10) * 10);
  const cortisolLines = [cortisolTop, (cortisolTop * 2) / 3, cortisolTop / 3, 0].map(v => Math.round(v));
  const dots = allWeeks.map((week, i) => ({
    week: week.weekNumber,
    value: week.cortisolPgPerMg,
    x: Math.round(((i + 0.5) / Math.max(1, allWeeks.length)) * 10000) / 100,
    y: Math.round((1 - Math.min(1, (week.cortisolPgPerMg || 0) / cortisolTop)) * 10000) / 100,
  }));

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
            Bars are meeting hours each week. The line with dots is hair cortisol, week by week.
          </p>
        </div>
        <span className="self-start text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
          {isCalendarConnected ? 'Your calendar' : 'Sample data'}
        </span>
      </div>

      <div className="rounded-2xl border border-[#EFE6DA] bg-gradient-to-b from-[#FBF7F2] to-white p-3 sm:p-5">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-600 mb-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-400" />
            Meeting hours that week (left scale)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="relative w-6 h-3 flex items-center">
              <span className="absolute inset-x-0 h-0.5 bg-slate-900" />
              <span className="relative mx-auto w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-900" />
            </span>
            Hair cortisol that week, estimated (right scale)
          </span>
        </div>

        <div className="flex gap-1.5 sm:gap-3">
          {/* Left scale: meeting hours */}
          <div className="relative w-7 sm:w-9 shrink-0 h-52 sm:h-60 mt-[52px]" aria-hidden="true">
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

          <div className="flex-1 min-w-0">
            {/* Month headers: the measured hair cortisol for that centimetre */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
              {months.map(month => {
                const isActive = activeSegmentId === month.id;
                return (
                  <button
                    key={month.id}
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
                );
              })}
            </div>

            {/* Plot: twelve equal columns, bars underneath, cortisol dots on top */}
            <div className="relative h-52 sm:h-60 mt-2">
              {gridLines.map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-x-0 border-t border-dashed border-slate-200"
                  style={{ top: `${(i / (gridLines.length - 1)) * 100}%` }}
                  aria-hidden="true"
                />
              ))}

              {/* Healthy limit for hair cortisol */}
              <div
                className="absolute inset-x-0 border-t-2 border-dotted border-emerald-500/70"
                style={{ top: `${(1 - HEALTHY_LIMIT / cortisolTop) * 100}%` }}
                aria-hidden="true"
              >
                <span className="absolute right-0 -top-4 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-white/80 px-1 rounded">
                  Healthy below {HEALTHY_LIMIT}
                </span>
              </div>

              {/* Bars */}
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${allWeeks.length}, minmax(0, 1fr))` }}>
                {allWeeks.map((week, order) => {
                  const month = months.find(m => m.id === week.month) || months[0];
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
                      aria-label={`Week ${week.weekNumber}, ${week.dateRange}: ${week.meetingHours} meeting hours, ${week.eveningCalls} meetings after 7 PM, estimated hair cortisol ${week.cortisolPgPerMg} pg/mg`}
                      className={`relative h-full flex items-end justify-center cursor-pointer px-[12%] ${
                        order % 4 === 0 && order > 0 ? 'border-l border-slate-200/70' : ''
                      }`}
                    >
                      <span
                        className="relative w-full max-w-[40px] rounded-t-lg"
                        style={{
                          height: inView ? `${heightPct}%` : '0%',
                          backgroundColor: month.tone.color,
                          opacity: isFocused ? 1 : focusWeek === null ? 0.85 : 0.4,
                          transition: `height 900ms cubic-bezier(0.22, 1, 0.36, 1) ${order * 70}ms, opacity 200ms ease`,
                        }}
                      >
                        <span className="absolute bottom-1 inset-x-0 text-center text-[9px] sm:text-[10px] font-bold text-white" aria-hidden="true">
                          {Math.round(week.meetingHours || 0)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Weekly hair cortisol: a line with a dot for each week, drawn over the bars */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polyline
                  points={dots.map(d => `${d.x},${d.y}`).join(' ')}
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ opacity: inView ? 1 : 0, transition: 'opacity 700ms ease 1500ms' }}
                />
              </svg>
              {dots.map((dot, order) => {
                const isFocused = focusWeek === dot.week;
                return (
                  <span
                    key={dot.week}
                    className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-slate-900"
                    style={{
                      left: `${dot.x}%`,
                      top: `${dot.y}%`,
                      width: isFocused ? 14 : 10,
                      height: isFocused ? 14 : 10,
                      borderWidth: isFocused ? 3 : 2.5,
                      opacity: inView ? 1 : 0,
                      transition: `opacity 300ms ease ${900 + order * 110}ms, width 150ms ease, height 150ms ease`,
                    }}
                    aria-hidden="true"
                  >
                    {isFocused && (
                      <span className="absolute left-1/2 -translate-x-1/2 -top-6 px-1.5 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap">
                        {dot.value} pg/mg
                      </span>
                    )}
                  </span>
                );
              })}
            </div>

            {/* Week labels */}
            <div className="grid mt-1.5" style={{ gridTemplateColumns: `repeat(${allWeeks.length}, minmax(0, 1fr))` }}>
              {allWeeks.map(week => (
                <span
                  key={week.weekNumber}
                  className={`text-center text-[9px] sm:text-[10px] font-semibold ${focusWeek === week.weekNumber ? 'text-slate-900' : 'text-slate-400'}`}
                >
                  W{week.weekNumber}
                </span>
              ))}
            </div>
          </div>

          {/* Right scale: hair cortisol */}
          <div className="relative w-6 sm:w-8 shrink-0 h-52 sm:h-60 mt-[52px]" aria-hidden="true">
            {cortisolLines.map((value, i) => (
              <span
                key={i}
                className="absolute left-0 -translate-y-1/2 text-[10px] font-semibold text-slate-700"
                style={{ top: `${(i / (cortisolLines.length - 1)) * 100}%` }}
              >
                {value}
              </span>
            ))}
            <span className="absolute left-0 -top-5 text-[9px] font-bold text-slate-500 whitespace-nowrap">pg/mg</span>
          </div>
        </div>

        {/* Detail for the week under the pointer, or how to read the chart */}
        <div className="mt-4 min-h-[2.75rem] flex items-center justify-center text-center" aria-live="polite">
          {focused && focusedMonth ? (
            <p className="text-xs sm:text-sm text-slate-700">
              <span className="font-extrabold text-slate-900">Week {focused.weekNumber}</span> ({focused.dateRange}):{' '}
              <span className="font-bold">{focused.meetingHours} meeting hours</span>, {focused.eveningCalls} after 7 PM. Hair cortisol that
              week: <span className="font-bold">{focused.cortisolPgPerMg} pg/mg</span> (estimated; {focusedMonth.label} measured{' '}
              {focusedMonth.cortisol}).
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 max-w-xl">
              Hover or tap a week for its details. The lab measures one cortisol value per centimetre of hair, which is one per month;
              the weekly points are estimated from those three values.
            </p>
          )}
        </div>
      </div>
    </section>
  );
});

ChronoCorrelationChart.displayName = 'ChronoCorrelationChart';
