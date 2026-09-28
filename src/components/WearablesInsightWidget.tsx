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
      await fetch('/api/waitlist', {
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

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in font-sans py-4">
      {/* SINGLE CLEAN CARD */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 sm:p-10 relative overflow-hidden space-y-6">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/60 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Top Eyebrow */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#3186FF] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#3186FF] animate-pulse" />
            <span>Coming soon</span>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Hardware Integration
          </span>
        </div>

        {/* Main Headline & Promise */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Coming soon: watch + hair
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium max-w-2xl">
            Your watch shows today&apos;s stress. Your hair shows the last 3 months. Together, the full picture.
          </p>
        </div>

        {/* 3 Simple Value Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#3186FF] flex items-center justify-center font-bold">
              <Watch className="w-4 h-4" />
            </div>
            <div className="text-xs font-black text-slate-900">Your Watch</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tracks today&apos;s heart rate, sleep quality, and daily energy spikes in real time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-xs font-black text-slate-900">Your Hair</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Provides the indelible 90-day biological receipt that one good night of sleep cannot fake.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xs font-black text-slate-900">Google Gemini</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Connects the dots between your calendar, your day, and your biological recovery.
            </p>
          </div>
        </div>

        {/* Supported Devices Selector */}
        <div className="pt-2 space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Select your device for priority sync:
          </label>
          <div className="flex flex-wrap gap-2">
            {DEVICES.map((dev) => (
              <button
                key={dev}
                type="button"
                onClick={() => setSelectedDevice(dev)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDevice === dev
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {dev}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Signup Bar */}
        <div className="pt-2 border-t border-slate-100">
          {hasJoinedWaitlist ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>You&apos;re on the priority list for {selectedDevice} sync!</span>
              </div>
              <button
                type="button"
                onClick={() => setHasJoinedWaitlist(false)}
                className="text-emerald-700 hover:underline text-[11px] font-bold cursor-pointer"
              >
                Change
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email to get early access..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3186FF] focus:bg-white"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Joining...' : 'Notify Me'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
