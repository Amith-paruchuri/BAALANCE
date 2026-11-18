'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock, Moon, Plane, ShieldCheck, Sun } from 'lucide-react';
import type { WeeklyTelemetry } from '@/lib/types';
import { useInView } from '@/lib/useInView';

interface CalendarLoadHeroProps {
  telemetry: WeeklyTelemetry[];
  /** 'connected' shows the account, 'sample' the demo calendar, 'none' nothing linked yet. */
  status: 'connected' | 'sample' | 'none';
  accountLabel?: string;
  changesApproved: boolean;
  onReviewChanges: () => void;
  onConnect: () => void;
}

/**
 * The top of the Calendar tab. It opens with the one number that matters (how
 * many meetings ran past 7 PM), shows where in the day they fall, and how they
 * built up week by week. Everything is computed from the user's weeks.
 */
export const CalendarLoadHero: React.FC<CalendarLoadHeroProps> = ({
  telemetry,
  status,
  accountLabel,
  changesApproved,
  onReviewChanges,
  onConnect,
}) => {
  const { ref, inView } = useInView<HTMLElement>(0.2);

  const weeks = [...telemetry].sort((a, b) => a.weekNumber - b.weekNumber);
  const late = weeks.reduce((sum, w) => sum + (w.eveningCalls || 0), 0);
  const hours = weeks.reduce((sum, w) => sum + (w.meetingHours || 0), 0);
  const flights = weeks.reduce((sum, w) => sum + (w.flightShifts || 0), 0);
  const weekCount = Math.max(1, weeks.length);
  const perWeek = Math.round((late / weekCount) * 10) / 10;
  const hoursPerWeek = Math.round(hours / weekCount);
  const maxLate = Math.max(1, ...weeks.map(w => w.eveningCalls || 0));
  const worst = weeks.reduce<WeeklyTelemetry | null>((a, w) => (!a || (w.eveningCalls || 0) > (a.eveningCalls || 0) ? w : a), null);

  const headline =
    late > 0 ? (
      <>
        <span className="text-rose-600">{late}</span> of your meetings ran past 7 PM.
      </>
    ) : (
      <>Your evenings are clear.</>
    );
  const sub =
    late > 0
      ? `About ${perWeek} a week over the last 90 days. Evenings are when your body brings cortisol back down, so late meetings are the first thing to change.`
      : 'No meetings after 7 PM in the last 90 days. If your hair cortisol is still high, the cause is likely outside your calendar.';

  const statusDot = status === 'connected' ? 'bg-emerald-500' : status === 'sample' ? 'bg-amber-400' : 'bg-slate-300';
  const statusText =
    status === 'connected' ? `Connected: ${accountLabel}` : status === 'sample' ? 'Sample calendar, last 90 days' : 'Not connected yet';

  return (
    <section
      ref={ref}
      className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-6 font-sans"
      aria-label="Your calendar load"
      data-testid="calendar-hero"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">Calendar tells us why</div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 leading-tight">{headline}</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">{sub}</p>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusDot}`} />
            <span className="truncate">{statusText}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onReviewChanges}
            className="px-4 py-2.5 rounded-xl bg-[#0D4F59] hover:bg-[#0B434B] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {changesApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{changesApproved ? 'Review changes again' : 'Review suggested changes'}</span>
          </button>
          <button
            type="button"
            onClick={onConnect}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Connect Outlook or Google</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Your day: working hours, then the evening that should be yours */}
        <div className="lg:col-span-3 rounded-2xl border border-[#EFE6DA] bg-gradient-to-b from-[#FBF7F2] to-white p-4 sm:p-5">
          <div className="text-xs font-extrabold text-slate-900">Where they land in your day</div>
          <div className="mt-4 flex h-14 rounded-2xl overflow-hidden border border-slate-200" role="img" aria-label="A day from 8 AM to 11 PM. Meetings after 7 PM fall in the evening recovery hours.">
            <div className="flex-[11] bg-[#0D4F59]/10 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#0D4F59]">
              <Sun className="w-3.5 h-3.5" />
              <span>Working day</span>
            </div>
            <div
              className="flex-[4] relative flex items-center justify-center gap-1.5 text-[11px] font-bold text-white overflow-hidden"
              style={{ backgroundColor: late > 0 ? '#F43F5E' : '#10B981' }}
            >
              {/* fills from the left when the section comes into view */}
              <span
                className="absolute inset-0 bg-white/85 origin-right"
                style={{ transform: inView ? 'scaleX(0)' : 'scaleX(1)', transition: 'transform 1100ms cubic-bezier(0.22, 1, 0.36, 1) 250ms' }}
                aria-hidden="true"
              />
              <Moon className="w-3.5 h-3.5 relative" />
              <span className="relative">{late > 0 ? `${late} meetings` : 'Free'}</span>
            </div>
          </div>
          <div className="mt-1.5 flex text-[10px] font-semibold text-slate-400">
            <span className="flex-[11] flex justify-between pr-1">
              <span>8 AM</span>
              <span>1 PM</span>
              <span>7 PM</span>
            </span>
            <span className="flex-[4] text-right">11 PM</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            The red block is your evening. Each meeting there delays the wind-down your body needs before sleep.
          </p>
        </div>

        {/* How they built up, week by week */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5 flex flex-col">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-xs font-extrabold text-slate-900">Late meetings, week by week</div>
            {worst && (worst.eveningCalls || 0) > 0 && (
              <span className="text-[10px] font-semibold text-slate-500 shrink-0">Most: week {worst.weekNumber}</span>
            )}
          </div>
          <div className="mt-3 flex-1 flex items-end gap-1 h-24 min-h-[6rem]">
            {weeks.map((week, index) => {
              const value = week.eveningCalls || 0;
              return (
                <div key={week.weekNumber} className="flex-1 h-full flex flex-col justify-end items-center gap-0.5" title={`Week ${week.weekNumber}: ${value} after 7 PM`}>
                  <span className="text-[9px] font-bold text-slate-500" style={{ opacity: inView ? 1 : 0, transition: `opacity 300ms ease ${index * 60 + 600}ms` }}>
                    {value}
                  </span>
                  <span
                    className="w-full rounded-t-md"
                    style={{
                      height: inView ? `${Math.max(4, (value / maxLate) * 78)}%` : '0%',
                      backgroundColor: value >= maxLate * 0.66 ? '#F43F5E' : value >= maxLate * 0.33 ? '#F59E0B' : '#94A3B8',
                      transition: `height 800ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 60}ms`,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1">
            <span>Week 1</span>
            <span>Week {weeks.length || 12}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { icon: Moon, label: 'After 7 PM', value: String(late), unit: 'meetings in 90 days', tone: late > 0 ? 'text-rose-600' : 'text-emerald-700' },
          { icon: Clock, label: 'Meeting hours', value: String(hoursPerWeek), unit: `a week (${Math.round(hours)} in all)`, tone: 'text-slate-900' },
          { icon: Plane, label: 'Flights', value: String(flights), unit: 'in 90 days', tone: 'text-slate-900' },
        ].map(item => (
          <div key={item.label} className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-black font-mono leading-tight mt-1 ${item.tone}`}>{item.value}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500">{item.unit}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
