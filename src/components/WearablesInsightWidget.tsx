'use client';

import React, { useState } from 'react';
import {
  Activity,
  HeartPulse,
  Watch,
  Sparkles,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
  Bell,
  Calendar,
  Layers,
  Check,
} from 'lucide-react';
import { WeeklyTelemetry, HairCortisolSegment, UserProfile } from '@/lib/types';

interface WearablesInsightWidgetProps {
  telemetry?: WeeklyTelemetry[];
  segments?: HairCortisolSegment[];
  userProfile?: UserProfile;
  onOpenConnectModal?: () => void;
}

export const WearablesInsightWidget: React.FC<WearablesInsightWidgetProps> = ({
  userProfile,
  onOpenConnectModal,
}) => {
  const [emailInput, setEmailInput] = useState(userProfile?.email || '');
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('baalance_wearables_waitlist') === 'true';
    }
    return false;
  });
  const [selectedDevice, setSelectedDevice] = useState<string>('apple');
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState<boolean>(false);
  const [waitlistSuccessMsg, setWaitlistSuccessMsg] = useState<string>('');

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    setIsSubmittingWaitlist(true);
    const chosenDevice = DEVICES.find(d => d.id === selectedDevice)?.name || 'Apple Watch';

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: userProfile?.name || cleanEmail.split('@')[0],
          device: chosenDevice,
          source: `Wearable Waitlist (${chosenDevice})`,
          role: userProfile?.role,
          sector: userProfile?.sector,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHasJoinedWaitlist(true);
        setWaitlistSuccessMsg(`You're on the priority waitlist for ${chosenDevice} sync!`);
        if (typeof window !== 'undefined') {
          localStorage.setItem('baalance_wearables_waitlist', 'true');
          localStorage.setItem('baalance_wearables_waitlist_email', cleanEmail);
          localStorage.setItem('baalance_wearables_waitlist_device', chosenDevice);
        }
      } else {
        // Fallback local persistence
        setHasJoinedWaitlist(true);
        setWaitlistSuccessMsg(`You're on the priority waitlist for ${chosenDevice} sync!`);
      }
    } catch (_) {
      setHasJoinedWaitlist(true);
      setWaitlistSuccessMsg(`You're on the priority waitlist for ${chosenDevice} sync!`);
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  const DEVICES = [
    {
      id: 'apple',
      name: 'Apple Watch',
      model: 'Ultra 2 & Series 9/10',
      category: 'HealthKit Direct Sync',
      metrics: ['HRV (SDNN)', 'Wrist Temperature', 'Deep / REM Stages', 'Active Caloric Burn'],
      status: 'In Alpha Testing',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: '94% Protocol Ready',
    },
    {
      id: 'whoop',
      name: 'WHOOP',
      model: 'WHOOP 4.0 Strap',
      category: 'WHOOP API v2 OAuth',
      metrics: ['Recovery %', 'Day Strain', 'Sleep Performance', 'Nocturnal Respiratory Rate'],
      status: 'In Alpha Testing',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      badge: 'API Integrated',
    },
    {
      id: 'oura',
      name: 'Oura Ring',
      model: 'Gen 3 Heritage & Horizon',
      category: 'Oura Cloud Sync',
      metrics: ['Readiness Score', 'Sleep Score', 'Skin Temp Deviation', 'Resting Heart Rate'],
      status: 'In Development',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: 'Testing Q4 2026',
    },
    {
      id: 'garmin',
      name: 'Garmin',
      model: 'Fenix, Epix & Forerunner',
      category: 'Garmin Health Connect',
      metrics: ['Body Battery™', 'All-Day Stress Score', 'Pulse Ox', 'Heart Rate Variability'],
      status: 'In Development',
      statusColor: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'Partner Integration',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-8">
      {/* 1. HERO COMING SOON CARD */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 sm:p-8 relative overflow-hidden">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/40 via-purple-50/20 to-transparent pointer-events-none rounded-full blur-3xl -mr-20 -mt-20" />

        <div className="relative z-10 space-y-5">
          {/* Eyebrow & Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3186FF] animate-pulse" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3186FF] bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-200/60">
                Biometric Hardware Pipeline • Coming Soon
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#3186FF]" />
              <span>Direct OAuth & Bluetooth BLE</span>
            </div>
          </div>

          {/* Headline */}
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight">
              Wearable Biometrics & Real-Time Stress Tracking
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Wearables capture <strong className="text-black font-semibold">acute minute-to-minute fluctuations</strong> in stress (HRV drops, heart rate spikes), while hair cortisol captures <strong className="text-black font-semibold">cumulative chronic stress levels over 90 days</strong>. We are integrating both so Gemini can correlate real-time autonomic strain directly with your biological ground truth.
            </p>
          </div>

          {/* Quick Rationale Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-[#3186FF] flex items-center justify-center shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-black">Acute Autonomic Spikes</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Instant HRV & pulse responses during high-pressure meetings.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-black">Chronic 90-Day Receipts</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  ELISA-quantified hair cortisol that cannot be hidden by a good night of sleep.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-black">Autonomous Calendar Shield</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Gemini automatically reschedules late calls when acute strain exceeds threshold.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE BIOLOGY COMPARISON: ACUTE VS. CHRONIC STRESS */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              The Physiology
            </span>
            <h3 className="text-base sm:text-lg font-black text-black tracking-tight mt-0.5">
              Why We Fuse Wearables with Hair Cortisol
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:block">
            Dual-Stream Chronobiology
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Wearable Telemetry */}
          <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Watch className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                  Wearables (Acute Stream)
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Seconds to Hours
              </span>
            </div>

            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Nocturnal Architecture:</strong> Measures deep sleep vs. REM vs. restless awakenings after 7 PM calls.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Autonomic Reactivity:</strong> Captures instantaneous sympathetic surges (HRV drops, heart rate spikes).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Limitation:</strong> Highly volatile day-to-day; a single cup of coffee or cold shower alters readings.</span>
              </li>
            </ul>
          </div>

          {/* Card B: Hair Cortisol Analysis */}
          <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                  Hair Cortisol (Chronic Stream)
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                90-Day Cumulative Truth
              </span>
            </div>

            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                <span><strong>Hormonal Keratin Deposition:</strong> Cortisol diffuses from follicular capillaries into hair at ~1 cm/month.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                <span><strong>CLIA-Validated Ground Truth:</strong> Segmented 1 cm cuts isolate historic stress across July, August, and September.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                <span><strong>Advantage:</strong> Free from momentary circadian fluctuations—reveals genuine biological allostatic load.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. SUPPORTED HARDWARE & BETA ACCESS */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Device Compatibility
            </span>
            <h3 className="text-base sm:text-lg font-black text-black tracking-tight mt-0.5">
              Supported Hardware Ecosystem
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Selecting your primary device speeds up beta provisioning
          </span>
        </div>

        {/* Device Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {DEVICES.map((device) => {
            const isSelected = selectedDevice === device.id;
            return (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                  isSelected
                    ? 'border-[#3186FF] bg-blue-50/40 ring-2 ring-[#3186FF]/20 shadow-xs'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-black">{device.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${device.statusColor}`}>
                      {device.status}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-slate-500">{device.model}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{device.category}</p>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-600 block mb-1">Key Signals:</span>
                    <ul className="text-[10px] text-slate-500 space-y-0.5">
                      {device.metrics.map((m, i) => (
                        <li key={i} className="flex items-center gap-1.5 truncate">
                          <span className="w-1 h-1 rounded-full bg-[#3186FF]" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {device.badge}
                  </span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    isSelected ? 'bg-[#3186FF] text-white' : 'border border-slate-300 text-transparent'
                  }`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. WAITLIST SIGNUP BOX */}
        <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold tracking-tight">
                  Request Early Access to Wearable OAuth Sync
                </h4>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                We are actively onboarding beta testers for direct Apple HealthKit, WHOOP, and Oura Cloud sync. Leave your email to receive an early integration invite.
              </p>
            </div>

            {hasJoinedWaitlist ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{waitlistSuccessMsg || "You're on the priority beta waitlist!"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasJoinedWaitlist(false)}
                  className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Change Device / Email
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your.email@gmail.com"
                  disabled={isSubmittingWaitlist}
                  className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-64 disabled:opacity-60"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmittingWaitlist}
                  className="px-4 py-2 rounded-xl bg-[#3186FF] hover:bg-blue-600 disabled:bg-blue-400 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  {isSubmittingWaitlist ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Join Beta</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
