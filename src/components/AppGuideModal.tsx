'use client';

import React, { useState } from 'react';
import {
  X,
  Compass,
  Sparkles,
  Calendar,
  HeartPulse,
  Brain,
  ShieldCheck,
  Flame,
  Moon,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { DashboardTab } from './BottomNavigationBar';

interface AppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: DashboardTab) => void;
}

export const AppGuideModal: React.FC<AppGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [activePillar, setActivePillar] = useState<number>(0);

  if (!isOpen) return null;

  const pillars = [
    {
      id: 'hair-strand',
      tab: 'stress' as DashboardTab,
      badge: 'Pillar 1 • Diagnostic Foundation',
      title: '90-Day Hair Cortisol Chrono-Spectrometry',
      icon: Layers,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      summary: 'Hair acts as an unalterable biological tree ring of your chronic stress over the last 90 days.',
      keyPoints: [
        'Scalp hair grows at ~1.0 cm/month (~0.33 mm/day). Capillaries deposit circulating cortisol molecules directly into follicle matrix cells around the clock, permanently trapping hormone receipts in solid keratin protein.',
        'Eliminates the acute volatility of blood and saliva tests, which only capture 15-minute point-in-time spikes distorted by morning coffee, commutes, or needle anxiety.',
        'Analyzed in 3 canonical 1.0 cm segments: Hair Tip (July baseline, 60–90 days ago), Mid-Shaft (August crunch surge, 30–60 days ago), and Scalp Root (September recovery, last 30 days).',
      ],
      actionLabel: 'Explore Hair Strand Viewer',
    },
    {
      id: 'google-calendar',
      tab: 'calendar' as DashboardTab,
      badge: 'Pillar 2 • Root Cause Culprit',
      title: 'Live Google Calendar Telemetry',
      icon: Calendar,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      summary: 'Differentiates the biological consequence (cortisol) from the actual root cause (late meetings).',
      keyPoints: [
        'Syncs directly via your Google Calendar Private iCal feed to ingest 90 days of meetings, total workload hours, and curfew breaches.',
        'Enforces a biological 7:00 PM evening curfew: taking calls past 7 PM triggers evening cortisol surges that delay melatonin secretion by ~90 minutes.',
        'Privacy-first architecture: Your private iCal URL is encrypted, masked on screen (••••••••••••), and permanently stored with your account.',
      ],
      actionLabel: 'View Google Calendar Grid',
    },
    {
      id: 'wearable-biometrics',
      tab: 'wearables' as DashboardTab,
      badge: 'Pillar 3 • Acute Biometrics (Coming Soon)',
      title: 'Wearable Telemetry: Acute vs. Chronic Stress',
      icon: HeartPulse,
      iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
      summary: 'Wearables capture acute minute-to-minute fluctuations in stress, while hair cortisol captures chronic cumulative stress levels.',
      keyPoints: [
        'Acute vs. Chronic: Wearables (Apple Watch, Whoop, Oura, Garmin) monitor instant HRV and heart rate, while hair cortisol tracks 90-day hormonal exposure.',
        'Seamless Fusion: We are integrating direct Bluetooth and OAuth wearable syncing to fuse real-time acute strain with 90-day biological ground truth.',
        'Autonomous Defense: Future models will automatically nudge calendar buffers when daytime HRV indicates elevated acute nervous system strain.',
      ],
      actionLabel: 'Preview Wearables Integration',
    },
    {
      id: 'allostatic-tricha',
      tab: 'tricha' as DashboardTab,
      badge: 'Pillar 4 • Clinical AI Synthesis',
      title: 'Allostatic Load Score & Tricha AI',
      icon: Brain,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      summary: 'Google Gemini synthesizes all biometrics into a unified 0–100 Burnout Index with personalized recovery.',
      keyPoints: [
        'Allostatic Load Score (0–100): A unified holistic burnout score calculated from cumulative hair cortisol, 12-week meeting volume, and late calls past 7 PM.',
        'Dynamic Real-Time Recalculation: Adjusting hair values or syncing new calendar events instantly recalculates the score in real time.',
        'Tricha AI Guide: A conversational recovery assistant with full context of your 90-day test and calendar schedule, offering tailored circadian, calendar, and lifestyle protocols.',
      ],
      actionLabel: 'Consult Tricha AI Companion',
    },
  ];

  const currentPillar = pillars[activePillar];
  const IconComponent = currentPillar.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <Compass className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">How BAALANCE Works</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Judges & Clinical Guide
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Connecting 90-day hair cortisol chronobiology with real-time Google Calendar intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-black hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Core Innovation Hero Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Diagnostic Thesis</span>
            </div>
            <p className="text-sm font-semibold leading-relaxed text-slate-100">
              "Your hair keeps the receipts." While blood and saliva only capture acute 15-minute spikes distorted by coffee or stress, human hair grows 1 cm/month, continuously incorporating cortisol into solid keratin protein 24/7.
            </p>
            <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-mono text-slate-300">
              <span className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/15">1 cm = 30 Days</span>
              <span className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/15">3.0 cm = 90 Days</span>
              <span className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/15">Inviolable Keratin Record</span>
            </div>
          </div>

          {/* 4 Pillars Navigation Tabs */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Explore Core System Pillars:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {pillars.map((p, idx) => {
                const PIcon = p.icon;
                const isActive = activePillar === idx;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePillar(idx)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[78px] ${
                      isActive
                        ? 'bg-blue-50/80 border-[#3186FF] ring-2 ring-blue-200 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center border ${p.iconColor}`}>
                        <PIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">0{idx + 1}</span>
                    </div>
                    <span className={`text-xs font-bold leading-tight line-clamp-1 mt-1.5 ${
                      isActive ? 'text-blue-900' : 'text-slate-700'
                    }`}>
                      {p.title.split(' ')[0]} {p.title.split(' ')[1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Pillar Detailed Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-3 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {currentPillar.badge}
              </span>

              <span className="text-xs font-bold text-[#3186FF] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live System Integration</span>
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${currentPillar.iconColor}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  {currentPillar.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentPillar.summary}
                </p>
              </div>
            </div>

            {/* Key Clinical & Architecture Points */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {currentPillar.keyPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <div className="w-4 h-4 rounded-full bg-blue-50 text-[#3186FF] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✓
                  </div>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {/* Direct Jump Button to Experience Feature */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Want to test this feature directly?
              </span>

              <button
                type="button"
                onClick={() => {
                  onNavigateTab(currentPillar.tab);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>{currentPillar.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick FAQ / Summary for Judges */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Note for Competition Judges:</span>
            </div>
            <p className="leading-relaxed text-amber-950 text-[11px]">
              You can toggle between the <strong>Live Calendar Sync</strong> (with your own Google Calendar private iCal link) or explore the pre-loaded <strong>Clinical Evaluation Case</strong> (featuring a documented August crunch surge). All charts, graphs, and Gemini AI synthesis adapt dynamically in real-time.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-[#E2E8F0] bg-slate-50/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            Close Guide
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateTab('stress');
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Start Exploring Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
