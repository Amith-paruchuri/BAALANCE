'use client';

import React from 'react';
import { Scissors, Truck, FlaskConical, Sparkles, Check } from 'lucide-react';

interface HairJourneyCardProps {
  /** How many of the four stages are complete (1 to 4). */
  currentStep?: number;
}

const STAGES = [
  {
    icon: Scissors,
    title: 'Hair collected',
    text: 'A pencil-thin 3 cm lock from the back of the head, during a normal haircut.',
    when: 'Day 1',
  },
  {
    icon: Truck,
    title: 'Sent to the lab',
    text: 'Sealed in foil and an envelope. Hair is stable at room temperature, so no cold chain.',
    when: 'Day 1',
  },
  {
    icon: FlaskConical,
    title: 'Measured month by month',
    text: 'The lab cuts the hair into 1 cm segments and measures cortisol in each one.',
    when: 'Day 3',
  },
  {
    icon: Sparkles,
    title: 'Report ready',
    text: 'BAALANCE AI reads the results next to your calendar to find the likely cause.',
    when: 'Day 5',
  },
];

/** The sample's path from haircut to report, as a four-stage tracker. */
export const HairJourneyCard = React.memo<HairJourneyCardProps>(({ currentStep = 4 }) => {
  const done = Math.min(Math.max(currentStep, 0), STAGES.length);

  return (
    <section
      className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-5 font-sans"
      aria-label="Your sample's journey"
      data-testid="journey-card"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">From haircut to report</div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">Your sample&apos;s journey</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">About 5 days from the salon chair to your report.</p>
        </div>
        <span className="self-start text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          {done} of {STAGES.length} complete
        </span>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-0">
        {STAGES.map((stage, index) => {
          const isDone = index < done;
          const isLast = index === STAGES.length - 1;
          return (
            <li key={stage.title} className="relative flex md:flex-col gap-3 md:gap-0 md:pr-4">
              {/* Marker and connector */}
              <div className="flex md:items-center flex-col md:flex-row items-center shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${
                    isDone ? 'bg-[#0D4F59] border-[#0D4F59] text-white' : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <stage.icon className="w-4 h-4" />}
                </div>
                {!isLast && (
                  <div className={`flex-1 w-0.5 md:w-auto md:h-0.5 my-1 md:my-0 md:mx-2 ${index < done - 1 ? 'bg-[#0D4F59]' : 'bg-slate-200'}`} />
                )}
              </div>

              <div className="md:mt-3 pb-3 md:pb-0">
                <div className="flex items-center gap-1.5">
                  <stage.icon className="w-3.5 h-3.5 text-[#BF6F4E] hidden md:block" />
                  <h3 className="text-sm font-extrabold text-slate-900">{stage.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{stage.text}</p>
                <div className="text-[11px] font-semibold text-slate-400 mt-1.5">{stage.when}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
});

HairJourneyCard.displayName = 'HairJourneyCard';
