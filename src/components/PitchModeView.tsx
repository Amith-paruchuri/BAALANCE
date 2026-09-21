'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Scissors,
  TrendingUp,
  Calendar,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Flame,
  Sun,
  Moon,
  Clock,
  HeartPulse,
} from 'lucide-react';
import { BaalanceLogo } from './BaalanceLogo';
import { HairStrandScrubber } from './HairStrandScrubber';
import { ChronoCorrelationChart } from './ChronoCorrelationChart';
import { ChainOfCustodyCard } from './ChainOfCustodyCard';
import { GeminiProtocolCards } from './GeminiProtocolCards';
import {
  CLINICAL_SURGE_SEGMENTS,
  WEEKLY_12_WEEK_TELEMETRY,
  INITIAL_CHAIN_OF_CUSTODY,
  CLINICAL_FALLBACK_SYNTHESIS,
} from '@/lib/mockData';

interface PitchScene {
  id: number;
  title: string;
  badge: string;
  scriptSnippet: string;
  keyCallout: string;
}

const PITCH_SCENES: PitchScene[] = [
  {
    id: 1,
    title: 'The Burnout Blindspot',
    badge: 'Scene 1 • 0:00 - 0:18',
    scriptSnippet:
      'If your blood sugar rises, a glucometer catches it in seconds. If your blood pressure climbs, a cuff reads it right on your arm. So why is there no routine test for chronic burnout? Eight out of ten professionals are burned out right now, and unmanaged stress doubles your heart attack risk—making it just as lethal over time as heavy smoking.',
    keyCallout: 'No routine diagnostic exists for chronic burnout—until now.',
  },
  {
    id: 2,
    title: 'The 3cm = 3 Months Timeline',
    badge: 'Scene 2 • 0:18 - 0:42',
    scriptSnippet:
      'Whenever you face pressure, your body releases a hormone called cortisol directly into your bloodstream, which gets permanently trapped inside your growing hair. Because hair grows about one centimeter every month, reading it is simple: the first centimeter right by your scalp reveals how much cortisol you trapped over the last 30 days; the next centimeter down holds the cortisol you trapped from two months ago; and the third centimeter reflects cortisol levels three months ago. Just three centimeters of hair gives you an exact, month-by-month timeline of your stress over the entire last quarter.',
    keyCallout: '1 cm = 30 Days. 3 cm gives an exact 90-day retrospective timeline.',
  },
  {
    id: 3,
    title: 'Salon Collection & Chain of Custody',
    badge: 'Scene 3 • 0:42 - 0:58',
    scriptSnippet:
      'Yet every two months, we pay a stylist at the salon to sweep this valuable data into the trash. That’s why I created BAALANCE. During your regular haircut, your stylist seals 10 to 15 optimal hair strands into our collection pouch and sends it to our accredited lab.',
    keyCallout: 'Turn a regular haircut into a CLIA-validated diagnostic collection.',
  },
  {
    id: 4,
    title: 'Gemini Synthesis & Stress Trajectory',
    badge: 'Scene 4 • 0:58 - 1:12',
    scriptSnippet:
      'From there, our intelligent co-pilot, powered by Gemini, interprets the raw values from the lab to build a clear trajectory of your stress levels over the last three months.',
    keyCallout: 'Gemini translates lab test data into a continuous Burnout Score trajectory.',
  },
  {
    id: 5,
    title: 'Chrono-Correlation & Calendar Defense',
    badge: 'Scene 5 • 1:12 - 1:35',
    scriptSnippet:
      'Then, by integrating directly with your Google Calendar and wearable data, Gemini correlates the exact causes behind your rise in stress—revealing, for example, that your July cortisol spike coincided with back-to-back project deadlines and late-night meetings. Gemini then delivers tailored lifestyle advice and proactive calendar adjustments for your daily routine. And with a single tap of your approval, it directly executes those changes in your Google Calendar and sends update emails to your invitees automatically.',
    keyCallout: 'Gemini correlates cortisol spikes with late meetings & executes 1-click Google Calendar defense with auto-email.',
  },
  {
    id: 6,
    title: 'The Punchline & Recovery Protocol',
    badge: 'Scene 6 • 1:35 - 1:45',
    scriptSnippet: 'Stop guessing your burnout. Your hair keeps the receipts.',
    keyCallout: '"Your hair keeps the receipts."',
  },
];

export const PitchModeView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [activeSegmentId, setActiveSegmentId] = useState<1 | 2 | 3>(2);

  const scene = PITCH_SCENES[currentSceneIndex];

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSceneIndex < PITCH_SCENES.length - 1) {
        setCurrentSceneIndex(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentSceneIndex > 0) {
        setCurrentSceneIndex(prev => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSceneIndex]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-4 px-2 sm:px-4">
      {/* Top Controller Bar */}
      <div className="w-full max-w-5xl bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-3 sm:p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <BaalanceLogo size="sm" showTagline={false} animated={true} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Pitch Storyboard Mode
              </span>
              <span className="text-[10px] bg-sky-500/20 text-sky-400 font-mono px-2 py-0.5 rounded-full border border-sky-500/30">
                {scene.badge}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-200 mt-0.5">{scene.title}</h2>
          </div>
        </div>

        {/* Scene Switcher Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {PITCH_SCENES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSceneIndex(idx)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                currentSceneIndex === idx
                  ? 'bg-[#3186FF] text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Scene {s.id}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            disabled={currentSceneIndex === 0}
            onClick={() => setCurrentSceneIndex(prev => Math.max(0, prev - 1))}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
            title="Previous Scene (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentSceneIndex === PITCH_SCENES.length - 1}
            onClick={() => setCurrentSceneIndex(prev => Math.min(PITCH_SCENES.length - 1, prev + 1))}
            className="p-1.5 rounded-xl bg-[#3186FF] hover:bg-blue-600 disabled:opacity-30 text-white transition-colors flex items-center gap-1 text-xs font-bold px-3"
            title="Next Scene (Right Arrow)"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Exit Pitch Mode
          </button>
        </div>
      </div>

      {/* Main Pitch Stage: Script Teleprompter + Mobile Device Mockup */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Script Teleprompter & Director Guidance (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Teleprompter Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Voiceover Script</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">{scene.badge}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-sm sm:text-base leading-relaxed text-slate-100 font-sans">
              "{scene.scriptSnippet}"
            </div>

            <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-800/40 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-sky-300">Screen Objective:</span>
                <p className="text-xs text-slate-300 mt-0.5">{scene.keyCallout}</p>
              </div>
            </div>
          </div>

          {/* Video Recording Tips */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <p className="font-bold text-slate-300">🎬 Recording Tip for Video Pitch:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Use a screen capture tool (Loom, QuickTime, or OBS) cropping to the mobile frame on the right.</li>
              <li>Use the Left/Right arrows on your keyboard to switch scenes seamlessly while speaking.</li>
              <li>Keep the pace confident: total speaking time is ~90 seconds.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Curated Clean UI Phone Mockup (7 cols) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative w-[380px] h-[780px] bg-[#F0F4FA] text-slate-900 rounded-[46px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_10px_#0F172A,0_0_0_12px_#334155] overflow-hidden flex flex-col border-[3px] border-slate-900 select-none">
            {/* Phone Top Chrome / Dynamic Island & Status Bar */}
            <div className="h-10 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-40 relative">
              <span className="text-[12px] font-bold text-black font-sans">9:41</span>
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-20 h-4 bg-black rounded-full" />
              <div className="flex items-center gap-1.5 text-xs text-black">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* CURATED SCENE CONTENT (CLEAN & MINIMAL) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3.5 no-scrollbar bg-[#F0F4FA]">
              {/* SCENE 1: THE DIAGNOSTIC GAP */}
              {currentSceneIndex === 0 && (
                <div className="space-y-4 animate-fade-in pt-2">
                  <div className="flex justify-center py-2">
                    <BaalanceLogo size="md" showTagline={true} animated={true} />
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">The Diagnostic Blindspot</span>
                    
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-emerald-950">Blood Sugar Rise</span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded">Glucometer (5s)</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <HeartPulse className="w-4 h-4 text-[#3186FF]" />
                          <span className="font-semibold text-blue-950">Blood Pressure Climb</span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[#3186FF] bg-white px-2 py-0.5 rounded">Arm Cuff (15s)</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
                          <span className="font-bold text-rose-950">Chronic Burnout</span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">NO ROUTINE TEST</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div className="text-2xl font-black text-rose-600">8 / 10</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Professionals Burned Out</div>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div className="text-2xl font-black text-rose-600">2.1x</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Heart Attack Risk</div>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white text-center shadow-md">
                    <p className="text-xs font-bold">The Solution: BAALANCE</p>
                    <p className="text-[10px] opacity-90 mt-0.5">Quarterly Keratin Cortisol Telemetry</p>
                  </div>
                </div>
              )}

              {/* SCENE 2: THE 3CM = 3 MONTHS TIMELINE */}
              {currentSceneIndex === 1 && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#3186FF]">Biochemical Principle</span>
                    <h3 className="text-xs font-bold text-black mt-0.5">Hair Growth Rate = 1 cm per Month</h3>
                    <p className="text-[11px] text-[#5F6368] mt-0.5">
                      Cortisol is permanently encapsulated into the keratin matrix as hair grows.
                    </p>
                  </div>

                  {/* 3cm Hair Strand Scrubber Component */}
                  <HairStrandScrubber
                    segments={CLINICAL_SURGE_SEGMENTS}
                    activeSegmentId={activeSegmentId}
                    onSelectSegment={id => setActiveSegmentId(id)}
                  />

                  {/* 3-Month Breakdown Cards */}
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-black">Root (0–1 cm)</span>
                        <span className="text-[10px] text-slate-500 block">Last 30 Days (September)</span>
                      </div>
                      <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        15.6 pg/mg (Strain)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-rose-950 flex items-center gap-1">
                          <span>Mid-Shaft (1–2 cm)</span>
                          <span className="text-[9px] bg-rose-200 text-rose-800 px-1 rounded font-bold">CRUNCH PEAK</span>
                        </span>
                        <span className="text-[10px] text-rose-700 block">30–60 Days Ago (August Crunch)</span>
                      </div>
                      <span className="font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                        28.4 pg/mg (+185%)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-black">Tip (2–3 cm)</span>
                        <span className="text-[10px] text-slate-500 block">60–90 Days Ago (July Baseline)</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        11.2 pg/mg (Normal)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 3: SALON SNIP & CHAIN OF CUSTODY */}
              {currentSceneIndex === 2 && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600">Zero-Friction Ingestion</span>
                    <h3 className="text-xs font-bold text-black mt-0.5">The Salon Collection Model</h3>
                    <p className="text-[11px] text-[#5F6368] mt-0.5">
                      10–15 hair strands collected during regular 60-day haircuts instead of being swept into the trash.
                    </p>
                  </div>

                  {/* Chain of Custody Stepper */}
                  <ChainOfCustodyCard chainOfCustody={INITIAL_CHAIN_OF_CUSTODY} />

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5 text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900">CLIA Accredited Spectrometry</span>
                      <p className="text-[10px] text-emerald-700 mt-0.5">
                        ELISA lab assay quantitative precision: ±0.4 pg/mg.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 4: GEMINI TRAJECTORY & ALLOSTATIC SCORE */}
              {currentSceneIndex === 3 && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3186FF] via-[#6366F1] to-[#FB7185] flex items-center justify-center text-white font-black text-lg shadow-sm">
                        78
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600">Body Wear-and-Tear Score</span>
                        <h4 className="text-xs font-bold text-black">High Stress Load</h4>
                        <p className="text-[10px] text-slate-500 font-mono">90-Day Hair Cortisol Trajectory</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-1 rounded-lg border border-purple-200">
                      Gemini Co-Pilot
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
                    <span className="text-xs font-bold text-black flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#3186FF]" />
                      <span>Gemini Synthesis Analysis:</span>
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      "Biomarker trajectory indicates a severe stress surge during Month 2 (+185% baseline elevation), followed by delayed recovery in Month 1 due to late-night calls."
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-[10px] text-slate-500">Confidence</div>
                      <div className="text-sm font-bold text-black font-mono mt-0.5">94%</div>
                    </div>
                    <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 shadow-xs">
                      <div className="text-[10px] text-rose-700">July Surge</div>
                      <div className="text-sm font-bold text-rose-700 font-mono mt-0.5">+185%</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-[10px] text-slate-500">Recovery</div>
                      <div className="text-sm font-bold text-amber-600 font-mono mt-0.5">Partial</div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 5: CHRONO-CORRELATION ENGINE */}
              {currentSceneIndex === 4 && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#3186FF]">The Correlation Engine</span>
                    <h3 className="text-xs font-bold text-black mt-0.5">Hair Cortisol + Calendar</h3>
                  </div>

                  {/* 12-Week Chrono Correlation Multi-layer Chart */}
                  <ChronoCorrelationChart
                    telemetry={WEEKLY_12_WEEK_TELEMETRY}
                    activeSegmentId={activeSegmentId}
                  />

                  {/* Root Cause Culprit Card */}
                  <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Root Cause Identified by Gemini:</span>
                    </div>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      July Cortisol Spike correlated with <strong>back-to-back project deadlines (11 calls past 7 PM)</strong> that repeatedly breached evening recovery boundaries.
                    </p>
                  </div>
                </div>
              )}

              {/* SCENE 6: PUNCHLINE & RECOVERY PROTOCOLS */}
              {currentSceneIndex === 5 && (
                <div className="space-y-4 animate-fade-in pt-2">
                  {/* Tailored Protocol Cards */}
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-black">
                      <Sparkles className="w-3.5 h-3.5 text-[#3186FF]" />
                      <span>Tailored Daily Recovery Protocols:</span>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#3186FF]" />
                          <span className="font-semibold text-slate-800">Hard 7:00 PM Calendar Curfew</span>
                        </div>
                        <span className="text-[10px] text-blue-700 font-bold bg-white px-2 py-0.5 rounded">Applied</span>
                      </div>

                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Sun className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-semibold text-slate-800">Morning Cortisol Reset (15 min)</span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-bold bg-white px-2 py-0.5 rounded">Daily 07:30</span>
                      </div>
                    </div>
                  </div>

                  {/* The Closing Punchline Hero Card */}
                  <div className="py-6 px-4 rounded-3xl bg-slate-900 text-white text-center space-y-3 shadow-lg border border-slate-800">
                    <div className="flex justify-center">
                      <BaalanceLogo size="md" showTagline={false} animated={true} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Stop guessing your burnout.</p>
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                        "Your hair keeps the receipts."
                      </h3>
                    </div>
                    <div className="pt-2">
                      <span className="inline-block text-[11px] font-bold px-4 py-1.5 rounded-full bg-[#3186FF] text-white shadow-xs">
                        baalance.ai
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Home Indicator Bar */}
            <div className="h-4 bg-white/90 backdrop-blur-md flex items-center justify-center shrink-0">
              <div className="w-28 h-1 bg-slate-900/30 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
