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

  // Illustration: a watch sees day-to-day swings, hair sees the three-month level.
  const daily = [38, 52, 41, 66, 47, 58, 44, 71, 63, 82, 69, 88, 74, 91, 79, 86, 70, 77, 61, 68, 55, 60, 49, 54];
  const dailyPath = daily
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(20 + (i * 560) / (daily.length - 1)).toFixed(1)} ${(92 - v * 0.8).toFixed(1)}`)
    .join(' ');

  return (
    <div className="max-w-4xl mx-auto animate-fade-in font-sans">
      <section className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-6" aria-label="Wearables, coming soon">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">Coming soon</div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">Your watch and your hair, together</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              A watch shows today&apos;s stress. Hair shows the last three months. Side by side they tell you whether a bad week is
              a blip or a trend.
            </p>
          </div>
          <span className="self-start text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Not built yet
          </span>
        </div>

        {/* Two lanes: daily signal from a watch, monthly level from hair */}
        <div className="rounded-2xl border border-[#EFE6DA] bg-gradient-to-b from-[#FBF7F2] to-white p-4 sm:p-5 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
              <Watch className="w-3.5 h-3.5" />
              <span>Watch: day by day (illustration)</span>
            </div>
            <svg viewBox="0 0 600 100" className="w-full h-auto block mt-1" role="img" aria-label="Illustration of a daily stress signal that swings up and down">
              <line x1="20" y1="92" x2="580" y2="92" stroke="#E2E8F0" strokeWidth="1.5" />
              <path d={dailyPath} fill="none" stroke="#0D4F59" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
              <Layers className="w-3.5 h-3.5" />
              <span>Hair: month by month</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: 'Month 1', tone: 'bg-emerald-400', h: 'h-5' },
                { label: 'Month 2', tone: 'bg-rose-500', h: 'h-12' },
                { label: 'Month 3', tone: 'bg-amber-400', h: 'h-8' },
              ].map(m => (
                <div key={m.label} className="flex flex-col justify-end">
                  <div className={`rounded-lg ${m.tone} ${m.h}`} />
                  <div className="text-[10px] font-semibold text-slate-500 text-center mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Watch, title: 'Your watch', text: 'Heart rate, sleep and recovery, as they happen.' },
            { icon: Layers, title: 'Your hair', text: 'The three-month record that one good night of sleep cannot change.' },
            { icon: Sparkles, title: 'BAALANCE AI', text: 'Reads both next to your calendar to find the pattern.' },
          ].map(item => (
            <div key={item.title} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <item.icon className="w-4 h-4 text-[#BF6F4E]" />
              <div className="text-sm font-extrabold text-slate-900 mt-2">{item.title}</div>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{item.text}</p>
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
