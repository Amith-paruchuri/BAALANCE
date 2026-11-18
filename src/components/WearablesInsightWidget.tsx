'use client';

import React, { useState } from 'react';
import {
  Watch,
  Sparkles,
  CheckCircle2,
  Bell,
  Heart,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { WeeklyTelemetry, HairCortisolSegment, UserProfile } from '@/lib/types';
import { apiFetch } from '@/lib/apiFetch';
import { useInView } from '@/lib/useInView';

interface WearablesInsightWidgetProps {
  telemetry?: WeeklyTelemetry[];
  segments?: HairCortisolSegment[];
  userProfile?: UserProfile;
  onOpenConnectModal?: () => void;
}

export const WearablesInsightWidget: React.FC<WearablesInsightWidgetProps> = ({
  userProfile,
}) => {
  const [emailInput, setEmailInput] = useState(userProfile?.email || '');
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('baalance_wearables_waitlist') === 'true';
    }
    return false;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('Apple Watch');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    setIsSubmitting(true);
    try {
      await apiFetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: userProfile?.name || cleanEmail.split('@')[0],
          device: selectedDevice,
          source: `Wearable (${selectedDevice})`,
          role: userProfile?.role,
          sector: userProfile?.sector,
        }),
      });
    } catch (_) {}

    setHasJoinedWaitlist(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('baalance_wearables_waitlist', 'true');
      localStorage.setItem('baalance_wearables_waitlist_email', cleanEmail);
      localStorage.setItem('baalance_wearables_waitlist_device', selectedDevice);
    }
    setIsSubmitting(false);
  };

  const DEVICES = ['Apple Watch', 'WHOOP', 'Oura Ring', 'Garmin'];

  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  // Illustration only. Three months of daily "stress" as a watch would see it
  // (it jumps around), over the monthly level that hair records.
  const LEFT = 20;
  const RIGHT = 700;
  const TOP = 20;
  const BASE = 240;
  const monthLevels = [0.26, 0.78, 0.5]; // share of the way from low to high
  const yFor = (level: number) => BASE - level * (BASE - TOP - 10);
  const DAYS = 84;
  const BLIP_DAY = 16;
  const daily = Array.from({ length: DAYS }, (_, i) => {
    const month = Math.min(2, Math.floor(i / 28));
    const r = Math.sin((i + 1) * 12.9898) * 43758.5453;
    const noise = (r - Math.floor(r) - 0.5) * 0.24;
    const level = i === BLIP_DAY ? 0.86 : Math.min(0.97, Math.max(0.05, monthLevels[month] + noise));
    return { x: LEFT + (i / (DAYS - 1)) * (RIGHT - LEFT), y: yFor(level) };
  });
  const linePath = daily.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const monthWidth = (RIGHT - LEFT) / 3;
  const monthColors = ['#10B981', '#F43F5E', '#F59E0B'];
  const blip = daily[BLIP_DAY];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in font-sans">
      <section className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-6" aria-label="Wearables, coming soon">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">Coming soon</div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">A blip or a trend? Your watch and your hair, together</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              A watch sees stress day by day, and it jumps around. Hair holds the average for each month. Put together, you can tell
              one bad day from a bad three months.
            </p>
          </div>
          <span className="shrink-0 whitespace-nowrap text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            In development
          </span>
        </div>

        {/* The chart: stress level (up) over the last three months (across) */}
        <div ref={ref} className="rounded-2xl border border-[#EFE6DA] bg-gradient-to-b from-[#FBF7F2] to-white p-3 sm:p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div className="text-xs font-extrabold text-slate-900">Stress level over three months</div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-0.5 rounded bg-[#0D4F59]" />
                Watch, each day
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-400/50 border border-rose-400" />
                Hair, each month
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Vertical axis */}
            <div className="flex flex-col justify-between items-end text-[10px] sm:text-[11px] font-semibold text-slate-500 py-1 shrink-0 w-10 sm:w-12" aria-hidden="true">
              <span>High stress</span>
              <span>Low stress</span>
            </div>

            <div className="flex-1 min-w-0">
              <svg viewBox="0 0 720 260" className="w-full h-auto block" role="img" aria-label="Illustration: a watch line that jumps up and down each day, over three blocks showing the monthly level that hair records. Month two is high all month.">
                {/* axes */}
                <line x1={LEFT} y1={TOP - 6} x2={LEFT} y2={BASE} stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <line x1={LEFT} y1={BASE} x2={RIGHT + 6} y2={BASE} stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

                {/* Hair: one level per month */}
                {monthLevels.map((level, i) => {
                  const top = yFor(level);
                  return (
                    <rect
                      key={i}
                      x={LEFT + i * monthWidth + 5}
                      y={inView ? top : BASE}
                      width={monthWidth - 10}
                      height={inView ? BASE - top : 0}
                      rx="8"
                      fill={monthColors[i]}
                      fillOpacity="0.2"
                      stroke={monthColors[i]}
                      strokeOpacity="0.7"
                      strokeWidth="2"
                      style={{ transition: `y 900ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 180}ms, height 900ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 180}ms` }}
                    />
                  );
                })}

                {/* Watch: daily line, drawn left to right */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#0D4F59"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={inView ? 0 : 1}
                  style={{ transition: 'stroke-dashoffset 2400ms ease 500ms' }}
                />

                {/* 1: the blip. 2: the trend. */}
                <g style={{ opacity: inView ? 1 : 0, transition: 'opacity 500ms ease 2600ms' }} fontFamily="inherit">
                  <circle cx={blip.x} cy={blip.y} r="9" fill="none" stroke="#0D4F59" strokeWidth="2.5" />
                  <circle cx={blip.x + 26} cy={blip.y - 14} r="15" fill="#0D4F59" />
                  <text x={blip.x + 26} y={blip.y - 8} textAnchor="middle" fontSize="18" fontWeight="800" fill="#FFFFFF">1</text>
                  <circle cx={LEFT + monthWidth * 1.5} cy={yFor(monthLevels[1]) - 22} r="15" fill="#BE123C" />
                  <text x={LEFT + monthWidth * 1.5} y={yFor(monthLevels[1]) - 16} textAnchor="middle" fontSize="18" fontWeight="800" fill="#FFFFFF">2</text>
                </g>
              </svg>

              {/* Horizontal axis */}
              <div className="grid grid-cols-3 text-center text-[10px] sm:text-[11px] font-semibold text-slate-500 pl-[2.8%] pr-[2.8%]" aria-hidden="true">
                <span>3 months ago</span>
                <span>2 months ago</span>
                <span>Last month</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#0D4F59] text-white text-xs font-black flex items-center justify-center shrink-0">1</span>
              <p className="text-xs text-slate-700">
                <span className="font-extrabold text-slate-900">A blip.</span> One bad day spikes on the watch, but that month&apos;s hair level stays low.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-rose-700 text-white text-xs font-black flex items-center justify-center shrink-0">2</span>
              <p className="text-xs text-slate-700">
                <span className="font-extrabold text-slate-900">A trend.</span> Stress stays high for weeks, and the hair for that month records it.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Illustration with made-up values, to show the idea.</p>
        </div>

        {/* Watch versus hair */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              icon: Watch,
              title: 'Your watch',
              rows: [
                ['Looks at', 'Today, hour by hour'],
                ['Measures', 'Heart rate, sleep and movement'],
                ['Good for', 'Noticing a rough day as it happens'],
                ['One good night', 'Changes the picture'],
              ],
            },
            {
              icon: Layers,
              title: 'Your hair',
              rows: [
                ['Looks at', 'The last three months'],
                ['Measures', 'Cortisol stored in each centimetre'],
                ['Good for', 'Seeing a pattern you cannot feel day to day'],
                ['One good night', 'Does not change it'],
              ],
            },
          ].map(card => (
            <div key={card.title} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#BF6F4E] flex items-center justify-center">
                  <card.icon className="w-4 h-4" />
                </span>
                <span className="text-sm font-extrabold text-slate-900">{card.title}</span>
              </div>
              <dl className="mt-3 space-y-1.5">
                {card.rows.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-3 text-xs">
                    <dt className="text-slate-500 shrink-0">{label}</dt>
                    <dd className="font-semibold text-slate-900 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        {/* Waitlist */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <div className="text-xs font-extrabold text-slate-900">Tell me when it is ready</div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Your device">
            {DEVICES.map(dev => (
              <button
                key={dev}
                type="button"
                onClick={() => setSelectedDevice(dev)}
                aria-pressed={selectedDevice === dev}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  selectedDevice === dev
                    ? 'bg-[#0D4F59] border-[#0D4F59] text-white'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {dev}
              </button>
            ))}
          </div>

          {hasJoinedWaitlist ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>You are on the list for {selectedDevice}. We will email you when it is ready.</span>
              </div>
              <button
                type="button"
                onClick={() => setHasJoinedWaitlist(false)}
                className="text-emerald-700 hover:underline text-[11px] font-bold cursor-pointer shrink-0"
              >
                Change
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="wearables-email" className="sr-only">Email address</label>
              <input
                id="wearables-email"
                type="email"
                required
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F59]/40"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#0D4F59] hover:bg-[#0B434B] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Adding…' : 'Notify me'}</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
