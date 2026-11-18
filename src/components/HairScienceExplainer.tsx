'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Activity, Droplets, Ruler, RotateCcw } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/useInView';

/**
 * The science in one picture, played in three beats:
 *   1. stress releases cortisol into the blood,
 *   2. growing hair traps it,
 *   3. hair grows about 1 cm a month, so 3 cm is a 3-month record.
 * It plays once on load; each step can be clicked, and in the last step each
 * centimetre can be hovered or tapped.
 */

const STEPS = [
  {
    icon: Activity,
    title: 'Stress releases cortisol',
    text: 'Cortisol is the hormone your body releases when you are under stress. It travels in your blood.',
  },
  {
    icon: Droplets,
    title: 'Growing hair traps it',
    text: 'Blood feeds the root of every hair. As the hair grows, cortisol gets locked inside it.',
  },
  {
    icon: Ruler,
    title: '1 cm of hair is 1 month',
    text: 'Hair grows about 1 cm a month. So 3 cm of hair is a 3-month record of your stress.',
  },
];

const MONTHS = [
  { label: '3 months ago', value: 11.2, color: '#10B981', note: 'A calm month: little cortisol was trapped in this centimetre.' },
  { label: '2 months ago', value: 28.4, color: '#F43F5E', note: 'A stressful month: this centimetre holds far more cortisol.' },
  { label: 'Last month', value: 15.6, color: '#F59E0B', note: 'Recovering: cortisol is coming back down in the newest centimetre.' },
];

// Geometry (viewBox 720 x 210). Scalp on the right, hair grows out to the left.
const X0 = 40;
const X1 = 640;
const CY = 96;
const centerY = (x: number) => CY - 8 * Math.sin(((Math.min(Math.max(x, X0), X1) - X0) / (X1 - X0)) * Math.PI);
const halfWidth = (x: number) => 2 + 9 * Math.pow((Math.min(Math.max(x, X0), X1) - X0) / (X1 - X0), 0.8);

function strandPath(tipX: number): string {
  const top: string[] = [];
  const bottom: string[] = [];
  const end = X1 + 30;
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const x = tipX + ((end - tipX) * i) / steps;
    // Taper to a point at the growing tip.
    const taper = Math.min(1, (x - tipX) / 26);
    const h = halfWidth(x) * taper;
    top.push(`${x.toFixed(1)},${(centerY(x) - h).toFixed(1)}`);
    bottom.unshift(`${x.toFixed(1)},${(centerY(x) + h).toFixed(1)}`);
  }
  return `M${top.join(' L')} L${bottom.join(' L')} Z`;
}

// Cortisol trapped along the strand: denser in the stressful middle month.
const TRAPPED = (() => {
  const out: Array<{ x: number; y: number; r: number }> = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed % 1000) / 1000;
  };
  [5, 14, 8].forEach((count, month) => {
    for (let i = 0; i < count; i++) {
      const x = X0 + month * 200 + 22 + rand() * 156;
      const side = rand() > 0.5 ? -1 : 1;
      out.push({ x, y: centerY(x) + side * (halfWidth(x) + 5 + rand() * 13), r: 2.6 + rand() * 1.6 });
    }
  });
  return out;
})();

const BLOOD = [
  { x: 662, y: 58 }, { x: 690, y: 70 }, { x: 668, y: 128 }, { x: 694, y: 118 }, { x: 700, y: 92 }, { x: 676, y: 146 }, { x: 656, y: 84 },
];

export const HairScienceExplainer: React.FC = () => {
  const [step, setStep] = useState(0);
  const [growth, setGrowth] = useState(0); // 0 = just a stub at the scalp, 1 = full 3 cm
  const [hovered, setHovered] = useState<number | null>(null);
  const autoplay = useRef(true);
  const raf = useRef<number | null>(null);

  // Animate hair growth whenever we are on step 2 or 3.
  useEffect(() => {
    const target = step === 0 ? 0 : 1;
    if (prefersReducedMotion()) {
      setGrowth(target);
      return;
    }
    const from = growth;
    const duration = step === 0 ? 400 : 1900;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setGrowth(from + (target - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Play the three beats once, unless the reader takes over.
  useEffect(() => {
    if (!autoplay.current || step >= STEPS.length - 1) return;
    const timer = setTimeout(() => autoplay.current && setStep(s => Math.min(s + 1, STEPS.length - 1)), step === 0 ? 2600 : 3000);
    return () => clearTimeout(timer);
  }, [step]);

  const goTo = (index: number) => {
    autoplay.current = false;
    setHovered(null);
    setStep(index);
  };
  const replay = () => {
    autoplay.current = true;
    setHovered(null);
    setStep(0);
  };

  const tipX = X1 - 18 - growth * (X1 - 18 - X0);
  const showMonths = step === 2 && growth > 0.97;
  const caption = showMonths && hovered !== null ? MONTHS[hovered].note : STEPS[step].text;

  return (
    <section className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-4 sm:p-6 text-left" aria-label="Why hair shows three months of stress" data-testid="science-explainer">
      <div className="rounded-2xl border border-[#EFE6DA] bg-gradient-to-b from-[#FBF7F2] to-white px-2 sm:px-4 pt-3 pb-2">
        <svg viewBox="0 0 720 214" className="w-full h-auto block" role="img" aria-label="A hair growing out of the scalp, trapping cortisol as it grows. Each centimetre holds one month.">
          <defs>
            <linearGradient id="explainerKeratin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5A4336" />
              <stop offset="100%" stopColor="#1F1613" />
            </linearGradient>
          </defs>

          {/* Scalp with the hair root and its blood supply */}
          <rect x="640" y="28" width="74" height="140" rx="16" fill="#E8B49C" />
          <rect x="651" y="28" width="63" height="140" rx="14" fill="#F6DDCB" />
          <path d="M714 60 C690 62 684 80 688 96 C684 112 690 130 714 132" fill="none" stroke="#D9654F" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
          <ellipse cx="676" cy={centerY(X1)} rx="17" ry="13" fill="#3A2A22" />

          {/* Cortisol in the blood around the root */}
          {BLOOD.map((dot, i) => (
            <circle key={i} cx={dot.x} cy={dot.y} r="4" fill="#F6B73C" stroke="#D98A1B" strokeWidth="0.8">
              <animate attributeName="opacity" values="0.35;1;0.35" dur={`${1.6 + (i % 3) * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.2}s`} />
            </circle>
          ))}

          {/* One tinted capsule per centimetre, shown in the last step */}
          {MONTHS.map((month, index) => {
            const active = hovered === index;
            return (
              <g
                key={month.label}
                opacity={showMonths ? 1 : 0}
                style={{ transition: 'opacity 500ms ease', cursor: showMonths ? 'pointer' : 'default' }}
                onMouseEnter={() => showMonths && setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => showMonths && setHovered(hovered === index ? null : index)}
              >
                <rect
                  x={X0 + index * 200 + 5}
                  y={CY - 48}
                  width="190"
                  height="88"
                  rx="44"
                  fill={month.color}
                  fillOpacity={active ? 0.24 : 0.11}
                  stroke={month.color}
                  strokeOpacity={active ? 1 : 0.5}
                  strokeWidth={active ? 3 : 1.5}
                />
              </g>
            );
          })}

          {/* Where the hair will grow, shown faintly before it has grown */}
          <line
            x1={X0}
            y1={CY - 4}
            x2={tipX - 6}
            y2={CY - 4}
            stroke="#B9A999"
            strokeWidth="2"
            strokeDasharray="3 9"
            strokeLinecap="round"
            opacity={growth < 0.97 ? 0.8 : 0}
            style={{ transition: 'opacity 300ms ease' }}
          />

          {/* The hair itself */}
          <path d={strandPath(tipX)} fill="url(#explainerKeratin)" />

          {/* Cortisol locked into the part of the hair that has already grown */}
          <g pointerEvents="none">
            {TRAPPED.map((dot, i) => (
              <circle
                key={i}
                cx={dot.x}
                cy={dot.y}
                r={dot.r}
                fill="#F6B73C"
                stroke="#D98A1B"
                strokeWidth="0.8"
                opacity={step > 0 && dot.x > tipX + 14 ? 1 : 0}
                style={{ transition: 'opacity 350ms ease' }}
              />
            ))}
          </g>

          {/* Ruler */}
          <g opacity={showMonths ? 1 : 0} style={{ transition: 'opacity 500ms ease' }} pointerEvents="none">
            <g stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round">
              <line x1={X0} y1="162" x2={X1} y2="162" />
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1={X0 + i * 200} y1="155" x2={X0 + i * 200} y2="169" />
              ))}
            </g>
            {MONTHS.map((month, index) => (
              <g key={month.label} fontFamily="inherit" textAnchor="middle">
                <text x={X0 + index * 200 + 100} y="188" fontSize="20" fontWeight="700" fill="#334155">
                  {month.label}
                </text>
                <text x={X0 + index * 200 + 100} y="206" fontSize="15" fill="#64748B">
                  1 cm
                </text>
              </g>
            ))}
          </g>

          {/* Labels for the first two steps */}
          <g fontFamily="inherit" pointerEvents="none">
            <text x="630" y="196" fontSize="18" fontWeight="700" fill="#8A4B32" textAnchor="end" opacity={step < 2 ? 1 : 0} style={{ transition: 'opacity 300ms ease' }}>
              {step === 0 ? 'Cortisol in the blood at the hair root' : 'The hair grows, with cortisol locked inside'}
            </text>
          </g>
        </svg>
      </div>

      {/* Caption for the current beat (or the hovered centimetre) */}
      <p className="text-sm sm:text-base text-slate-700 font-medium text-center mt-3 min-h-[3rem] sm:min-h-[1.75rem] px-2" aria-live="polite">
        {caption}
      </p>

      {/* The three steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2" role="tablist" aria-label="How it works">
        {STEPS.map((item, index) => {
          const isActive = step === index;
          const isDone = step > index;
          return (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => goTo(index)}
              className={`p-3 rounded-2xl border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                isActive ? 'bg-[#0D4F59] border-[#0D4F59] text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-white/15 text-white' : isDone ? 'bg-[#0D4F59]/10 text-[#0D4F59]' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <item.icon className="w-4 h-4" />
              </span>
              <span className="min-w-0">
                <span className={`block text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white/70' : 'text-[#BF6F4E]'}`}>Step {index + 1}</span>
                <span className="block text-sm font-extrabold leading-tight">{item.title}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 mt-3 px-1">
        <span className="text-[11px] text-slate-500">
          {showMonths ? 'Tap a centimetre to see what it tells us. Values are a sample.' : 'Illustration, not to scale.'}
        </span>
        <button type="button" onClick={replay} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
          <RotateCcw className="w-3 h-3" />
          Play again
        </button>
      </div>
    </section>
  );
};
