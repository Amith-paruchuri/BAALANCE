'use client';

import React, { useState } from 'react';
import {
  Scissors,
  Truck,
  FlaskConical,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building2,
  Hash,
  FileCheck2,
  Check,
  Sparkle,
} from 'lucide-react';

interface HairJourneyCardProps {
  currentStep?: number;
}

export const HairJourneyCard: React.FC<HairJourneyCardProps> = ({
  currentStep = 4,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const journeyStages = [
    {
      step: 1,
      stepCode: '01',
      title: 'Salon Specimen Snip',
      phase: 'Partner Stylist Intake',
      location: 'LAKME Salon • South Extension II, New Delhi',
      date: 'Sep 14, 2026',
      time: '11:30 AM IST',
      description:
        'Hair specimen collected safely near the posterior vertex during your routine haircut. Painless, non-invasive, and discreet.',
      detailNote:
        'Collected by Certified Master Stylist R. Sharma. Scalp-root orientation strictly preserved with foil specimen backing and foil seal.',
      icon: Scissors,
      accentGradient: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      borderAccent: 'border-emerald-200 hover:border-emerald-300',
      cardGlow: 'hover:shadow-emerald-100/50',
      iconContainer: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-50 shadow-xs',
      badge: 'Salon Certified',
      isDone: true,
      tags: [],
      custodyDetails: [
        { label: 'Sample Envelope Barcode', value: 'LAKME-DEL-SE2-8941' },
        { label: 'Specimen Length', value: '3.0 cm (90-Day Chrono-Window)' },
        { label: 'Custody Chain', value: 'Collected → Verified by Salon Manager' },
        { label: 'Storage Temperature', value: 'Ambient Dry (21°C, <40% RH)' },
      ],
    },
    {
      step: 2,
      stepCode: '02',
      title: 'Priority Air Transit',
      phase: 'Cold-Chain & Air Courier',
      location: 'Blue Dart Aviation • Flight B7-204 (DEL → BLR)',
      date: 'Sep 14, 2026',
      time: '04:15 PM IST',
      description:
        'Specimen sealed in a tamper-evident barcode envelope (#BLUEDART-DEL-9842) and flown via direct air priority courier to the central testing laboratory.',
      detailNote:
        'Continuous temperature and humidity tracking via RFID air tag. Delivered to diagnostic reception within 18 hours of salon collection.',
      icon: Truck,
      accentGradient: 'from-sky-500 to-blue-600',
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-200/80',
      borderAccent: 'border-sky-200 hover:border-sky-300',
      cardGlow: 'hover:shadow-sky-100/50',
      iconContainer: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white ring-4 ring-sky-50 shadow-xs',
      badge: 'Delivered',
      isDone: true,
      tags: ['Air Cargo Priority', 'Tamper-Evident Seal', '<18h Direct Transit'],
      custodyDetails: [
        { label: 'Air Waybill (AWB)', value: '#BLUEDART-DEL-9842-EXP' },
        { label: 'Transit Time', value: '16 hrs 45 mins' },
        { label: 'Specimen Integrity', value: '100% Intact • Zero Seal Breaches' },
        { label: 'Receiving Hub', value: 'Central Diagnostics Hub (Hub 4)' },
      ],
    },
    {
      step: 3,
      stepCode: '03',
      title: 'Micro-ELISA Assay & Spectrometry',
      phase: 'Clinical Hair Cortisol Test',
      location: 'Accredited Clinical Endocrinology Lab • NABL / CLIA',
      date: 'Sep 16, 2026',
      time: '02:00 PM IST',
      description:
        'Hair strand washed to eliminate external sebum, then micro-segmented into three 1-centimeter pieces. Each 1 cm represents 30 days of biological cortisol history.',
      detailNote:
        'Assayed on automated ThermoFisher microplate reader. 0.1 pg/mg sensitivity confirmed August cortisol surge at 28.4 pg/mg (+158% above 11.0 baseline).',
      icon: FlaskConical,
      accentGradient: 'from-purple-500 to-indigo-600',
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-200/80',
      borderAccent: 'border-purple-200 hover:border-purple-300',
      cardGlow: 'hover:shadow-purple-100/50',
      iconContainer: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white ring-4 ring-purple-50 shadow-xs',
      badge: 'Assayed & Verified',
      isDone: true,
      tags: ['3x 1cm Segments', '0.1 pg/mg Sensitivity', 'CLIA Baseline ~11.0'],
      custodyDetails: [
        { label: 'Assay Method', value: 'Competitive Luminescent Immunoassay (CLIA)' },
        { label: 'Instrument', value: 'SpectraMax iD3 Multi-Mode Reader' },
        { label: 'Calibration Standard', value: 'NIST-traceable Hydrocortisone Standard' },
        { label: 'Testing Pathologist', value: 'Dr. N. Rao, MD (Endocrine Pathology)' },
      ],
    },
    {
      step: 4,
      stepCode: '04',
      title: 'Tricha AI Synthesis & Culprit Discovery',
      phase: 'Neuro-Circadian Correlation',
      location: 'Gemini 3.6 Flash Neural Engine • BAALANCE Core',
      date: 'Sep 18, 2026',
      time: '10:00 AM IST',
      description:
        '12-week cortisol timeline mapped against Google Calendar meeting hours and wearable sleep stages to isolate the exact lifestyle triggers behind biological strain.',
      detailNote:
        'Cross-correlation isolated 23 late-night calls after 7:00 PM and deep sleep debt as the root cause of delayed recovery into September.',
      icon: Sparkles,
      accentGradient: 'from-[#3186FF] to-blue-700',
      badgeBg: 'bg-blue-50 text-[#3186FF] border-blue-200',
      borderAccent: 'border-blue-300 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/20 ring-1 ring-[#3186FF]/25 shadow-sm',
      cardGlow: 'shadow-blue-100/60',
      iconContainer: 'bg-gradient-to-br from-[#3186FF] to-indigo-600 text-white ring-4 ring-blue-100 shadow-sm',
      badge: 'Active & Ready',
      isDone: true,
      isCurrent: true,
      tags: ['Google Calendar Correlated', 'Deep Sleep Debt Isolated', 'Burnout Score Calibrated'],
      custodyDetails: [
        { label: 'Model Architecture', value: 'Google Gemini 3.6 Flash Neural Engine' },
        { label: 'Telemetry Streams', value: 'Hair Biomarkers + Google Calendar + Sleep' },
        { label: 'Synthesis Score', value: '78 / 100 (High Burnout Zone)' },
        { label: 'Clinical Confidence', value: '94% Cross-Validated' },
      ],
    },
  ];

  const toggleExpand = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 font-sans space-y-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-blue-50/40 via-emerald-50/20 to-transparent pointer-events-none" />

      {/* Header with Title and Verification Credentials */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3186FF] to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkle className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Your Hair's Journey Timeline
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                4/4 Complete
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              From LAKME Salon haircut to certified endocrinology lab test and AI insight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>LAKME Salon Partner</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>NABL / CLIA Accredited Lab</span>
          </div>
        </div>
      </div>

      {/* Modern Connected Milestone Breadcrumb Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
        {journeyStages.map((stage, i) => {
          const isSelected = expandedStep === stage.step;
          return (
            <button
              key={stage.step}
              type="button"
              onClick={() => toggleExpand(stage.step)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/60 border-[#3186FF] ring-2 ring-[#3186FF]/20 shadow-xs'
                  : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400">STAGE {stage.stepCode}</span>
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-2xs">
                  ✓
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">{stage.title}</div>
              <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{stage.phase}</div>
            </button>
          );
        })}
      </div>

      {/* Main Vertical Journey Stepper */}
      <div className="relative pl-3 sm:pl-5 space-y-6 pt-2">
        {/* Continuous Gradient Vertical Rail */}
        <div
          className="absolute left-[27px] sm:left-[35px] top-6 bottom-8 w-[3px] bg-gradient-to-b from-emerald-500 via-sky-500 via-purple-500 to-[#3186FF] rounded-full shadow-2xs"
          aria-hidden="true"
        />

        {journeyStages.map((stage) => {
          const isExpanded = expandedStep === stage.step;
          const Icon = stage.icon;

          return (
            <div key={stage.step} className="relative flex items-start gap-3.5 sm:gap-5 group">
              {/* Step Circle Container */}
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 z-10 transition-transform group-hover:scale-105 duration-200 ${stage.iconContainer}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Elevated Journey Card */}
              <div
                className={`flex-1 rounded-2xl border transition-all duration-200 p-4 sm:p-5 ${
                  stage.borderAccent || 'border-slate-200 bg-white hover:border-slate-300'
                } ${stage.cardGlow || 'hover:shadow-md'}`}
              >
                {/* Header Row: Title, Step badge, Status pill, and Date Capsule */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white tracking-wider">
                      STEP {stage.stepCode}
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      {stage.title}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${stage.badgeBg}`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{stage.badge}</span>
                    </span>
                  </div>

                  {/* Clean Date & Time Capsule */}
                  <div className="inline-flex items-center gap-2 text-[11px] font-mono font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/80 shrink-0">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{stage.date}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{stage.time}</span>
                    </div>
                  </div>
                </div>

                {/* Location / Facility Tag */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3186FF] mt-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[#3186FF] shrink-0" />
                  <span>{stage.location}</span>
                </div>

                {/* Biological Narrative */}
                <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                  {stage.description}
                </p>

                {/* Key Specimen Tags */}
                {stage.tags && stage.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {stage.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/80 text-slate-700 text-[11px] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expandable Custody & Laboratory Technical Dossier */}
                {isExpanded && (
                  <div className="mt-4 pt-3.5 border-t border-slate-200/80 space-y-3 bg-slate-50/70 p-3.5 rounded-xl animate-fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <FileCheck2 className="w-4 h-4 text-[#3186FF]" />
                      <span>Chain of Custody & Clinical Verification Sheet</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {stage.custodyDetails.map((item, cIdx) => (
                        <div key={cIdx} className="p-2.5 bg-white rounded-lg border border-slate-200/70">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            {item.label}
                          </span>
                          <span className="text-xs font-bold text-slate-900 mt-0.5 block font-mono">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-100 text-xs text-blue-900 font-medium flex items-start gap-2">
                      <Hash className="w-3.5 h-3.5 text-[#3186FF] shrink-0 mt-0.5" />
                      <span>{stage.detailNote}</span>
                    </div>
                  </div>
                )}

                {/* Drawer Toggle Action Button */}
                <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Verified by BAALANCE Chain of Custody Protocol
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleExpand(stage.step)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3186FF] hover:text-blue-700 py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Lab Dossier' : 'View Chain of Custody Sheet'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
