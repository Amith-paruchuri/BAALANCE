'use client';

import React from 'react';
import { useInView } from '@/lib/useInView';

interface HairJourneyCardProps {
  /** How many of the four stages are complete (1 to 4). */
  currentStep?: number;
}

/* Four small pictures, one per stage. Drawn here so they share one style. */

const CutArt = () => (
  <svg viewBox="0 0 120 90" className="w-full h-full" aria-hidden="true">
    {/* a lock of hair, tied, with scissors closing on it */}
    <path d="M22 70 C40 52 62 44 98 40" fill="none" stroke="#3A2A22" strokeWidth="7" strokeLinecap="round" />
    <path d="M24 76 C44 60 66 52 100 48" fill="none" stroke="#5A4336" strokeWidth="4" strokeLinecap="round" />
    <rect x="52" y="44" width="7" height="20" rx="3" transform="rotate(-24 55 54)" fill="#BF6F4E" />
    <g stroke="#0D4F59" strokeWidth="4" strokeLinecap="round" fill="none">
      <line x1="62" y1="12" x2="84" y2="50" />
      <line x1="92" y1="12" x2="70" y2="50" />
      <circle cx="58" cy="8" r="6" />
      <circle cx="96" cy="8" r="6" />
    </g>
  </svg>
);

const EnvelopeArt = () => (
  <svg viewBox="0 0 120 90" className="w-full h-full" aria-hidden="true">
    <rect x="18" y="22" width="84" height="54" rx="8" fill="#FFFFFF" stroke="#0D4F59" strokeWidth="3.5" />
    <path d="M20 26 L60 54 L100 26" fill="none" stroke="#0D4F59" strokeWidth="3.5" strokeLinejoin="round" />
    {/* foil packet with the hair inside */}
    <rect x="42" y="50" width="36" height="16" rx="3" fill="#D5DBE1" stroke="#94A3B8" strokeWidth="1.5" />
    <line x1="47" y1="58" x2="73" y2="58" stroke="#3A2A22" strokeWidth="2.5" strokeLinecap="round" />
    <g stroke="#BF6F4E" strokeWidth="3" strokeLinecap="round">
      <line x1="4" y1="38" x2="12" y2="38" />
      <line x1="0" y1="50" x2="12" y2="50" />
      <line x1="4" y1="62" x2="12" y2="62" />
    </g>
  </svg>
);

const TubesArt = () => (
  <svg viewBox="0 0 120 90" className="w-full h-full" aria-hidden="true">
    {/* three tubes, one per centimetre of hair, filled by that month's cortisol */}
    {[
      { x: 26, level: 22, color: '#10B981' },
      { x: 52, level: 46, color: '#F43F5E' },
      { x: 78, level: 30, color: '#F59E0B' },
    ].map(tube => (
      <g key={tube.x}>
        <rect x={tube.x} y={78 - tube.level} width="16" height={tube.level} rx="7" fill={tube.color} />
        <rect x={tube.x} y="14" width="16" height="64" rx="8" fill="none" stroke="#0D4F59" strokeWidth="3" />
        <line x1={tube.x - 3} y1="14" x2={tube.x + 19} y2="14" stroke="#0D4F59" strokeWidth="3" strokeLinecap="round" />
      </g>
    ))}
    <line x1="14" y1="84" x2="106" y2="84" stroke="#B9A999" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const ReportArt = () => (
  <svg viewBox="0 0 120 90" className="w-full h-full" aria-hidden="true">
    <rect x="30" y="6" width="60" height="78" rx="10" fill="#FFFFFF" stroke="#0D4F59" strokeWidth="3.5" />
    <rect x="42" y="50" width="9" height="20" rx="2.5" fill="#10B981" />
    <rect x="56" y="30" width="9" height="40" rx="2.5" fill="#F43F5E" />
    <rect x="70" y="42" width="9" height="28" rx="2.5" fill="#F59E0B" />
    <line x1="40" y1="18" x2="66" y2="18" stroke="#BF6F4E" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="96" cy="16" r="11" fill="#0D4F59" />
    <path d="M91 16 l3.5 3.5 l6.5 -7" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const STAGES = [
  { art: CutArt, day: 'Day 1', title: 'A lock is cut', text: 'Pencil-thin, 3 cm long, from the back of your head during a normal haircut. It does not show.' },
  { art: EnvelopeArt, day: 'Day 1', title: 'It is sent to the lab', text: 'Sealed in foil and an envelope. Hair keeps at room temperature, so it needs no cold storage.' },
  { art: TubesArt, day: 'Day 3', title: 'Each month is measured', text: 'The lab cuts the hair into three 1 cm pieces and measures the cortisol in each one.' },
  { art: ReportArt, day: 'Day 5', title: 'Your report is ready', text: 'BAALANCE AI reads the three results next to your calendar to find the likely cause.' },
];

/**
 * The sample's path from haircut to report. When the reader reaches it, a line
 * travels across the four stages and each picture arrives in turn.
 */
export const HairJourneyCard = React.memo<HairJourneyCardProps>(({ currentStep = 4 }) => {
  const { ref, inView } = useInView<HTMLElement>(0.3);
  const done = Math.min(Math.max(currentStep, 0), STAGES.length);
  // The line reaches the middle of the last completed stage.
  const reach = done === 0 ? 0 : ((done - 0.5) / STAGES.length) * 100;

  return (
    <section
      ref={ref}
      className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-6 font-sans"
      aria-label="From haircut to report"
      data-testid="journey-card"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">From haircut to report</div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">Five days, four stops</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">What happens to your hair between the salon chair and this screen.</p>
        </div>
        <span className="self-start text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
          {done} of {STAGES.length} complete
        </span>
      </div>

      <div className="relative">
        {/* The road (desktop): a dashed track with a line that travels along it */}
        <div className="hidden md:block absolute left-[12.5%] right-[12.5%] top-[52px] h-1 rounded-full bg-[#EFE6DA]" aria-hidden="true">
          <div
            className="h-full rounded-full bg-[#0D4F59]"
            style={{
              width: inView ? `${Math.min(100, ((reach - 12.5) / 75) * 100)}%` : '0%',
              transition: 'width 2600ms cubic-bezier(0.45, 0, 0.2, 1) 200ms',
            }}
          />
        </div>

        <ol className="relative grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
          {STAGES.map((stage, index) => {
            const isDone = index < done;
            const delay = 200 + index * 750;
            return (
              <li
                key={stage.title}
                className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.96)',
                  transition: `opacity 500ms ease ${delay}ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                }}
              >
                <div
                  className={`relative w-24 h-[104px] md:w-[124px] shrink-0 rounded-2xl border-2 p-2.5 ${
                    isDone ? 'bg-[#FBF7F2] border-[#0D4F59]' : 'bg-slate-50 border-slate-200 grayscale opacity-70'
                  }`}
                >
                  <stage.art />
                  <span
                    className={`absolute -top-2.5 -left-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-white ${
                      isDone ? 'bg-[#0D4F59] text-white' : 'bg-slate-300 text-white'
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="md:mt-3 min-w-0">
                  <div className="text-[11px] font-bold text-[#BF6F4E]">{stage.day}</div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">{stage.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{stage.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
});

HairJourneyCard.displayName = 'HairJourneyCard';
