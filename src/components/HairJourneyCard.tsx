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
  Hash,
  FileCheck2,
  Check,
  Sparkle,
} from 'lucide-react';

interface HairJourneyCardProps {
  currentStep?: number;
}

export const HairJourneyCard = React.memo<HairJourneyCardProps>(({
  currentStep = 4,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const [showDetails, setShowDetails] = useState(false);

  const journeyStages = [
    {
      step: 1,
      stepCode: '01',
      title: 'Salon Snip',
      phase: 'Hair Collection',
      location: 'Partner Salon Suite • South Extension II, New Delhi',
      date: 'Sep 14, 2026',
      time: '11:30 AM IST',
      description:
        'Hair sample collected safely near the posterior vertex during your routine haircut. Painless, non-invasive, and discreet.',
      detailNote:
        'Collected by Certified Stylist. Scalp-root orientation strictly preserved with sealed foil backing.',
      icon: Scissors,
      accentGradient: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      borderAccent: 'border-emerald-200 hover:border-emerald-300',
      cardGlow: 'hover:shadow-emerald-100/50',
      iconContainer: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-50 shadow-xs',
      badge: 'Sample Collected',
      isDone: true,
      tags: [],
      custodyDetails: [
        { label: 'Sample Envelope', value: 'BL-DEL-8941' },
        { label: 'Sample Length', value: '3.0 cm (90-Day Window)' },
        { label: 'Custody Chain', value: 'Collected → Verified by Salon Manager' },
        { label: 'Storage Temperature', value: 'Ambient Dry (Room Temperature)' },
      ],
    },
    {
      step: 2,
      stepCode: '02',
      title: 'Room-Temp Courier',
      phase: 'Sealed Pouch Transit',
      location: 'Express Courier • Direct to Partner Lab',
      date: 'Sep 14, 2026',
      time: '04:15 PM IST',
      description:
        'Sample sealed in a tamper-evident envelope and routed via room-temperature express courier directly to the partner testing laboratory.',
      detailNote:
        'Hair cortisol is chemically stable in solid keratin at ambient temperatures, requiring no cold-chain transit.',
      icon: Truck,
      accentGradient: 'from-sky-500 to-blue-600',
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-200/80',
      borderAccent: 'border-sky-200 hover:border-sky-300',
      cardGlow: 'hover:shadow-sky-100/50',
      iconContainer: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white ring-4 ring-sky-50 shadow-xs',
      badge: 'Delivered',
      isDone: true,
      tags: [],
      custodyDetails: [
        { label: 'Courier Transit', value: 'Sealed room-temperature courier' },
        { label: 'Transit Time', value: '18 hours' },
        { label: 'Sample Integrity', value: '100% Intact • Sealed Envelope' },
        { label: 'Receiving Facility', value: 'Partner Testing Laboratory' },
      ],
    },
    {
      step: 3,
      stepCode: '03',
      title: 'Lab test (ELISA)',
      phase: 'Cortisol Measurement',
      location: 'Partner Laboratory • Endocrinology Department',
      date: 'Sep 16, 2026',
      time: '02:00 PM IST',
      description:
        'Hair strand washed to remove external residue, then cut into three 1-centimeter pieces. Each 1 cm represents 30 days of biological cortisol history.',
      detailNote:
        'Assayed on microplate reader. Confirmed August cortisol surge at 28.4 pg/mg (+154% above 11.0 baseline).',
      icon: FlaskConical,
      accentGradient: 'from-purple-500 to-indigo-600',
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-200/80',
      borderAccent: 'border-purple-200 hover:border-purple-300',
      cardGlow: 'hover:shadow-purple-100/50',
      iconContainer: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white ring-4 ring-purple-50 shadow-xs',
      badge: 'Lab Verified',
      isDone: true,
      tags: [],
      custodyDetails: [
        { label: 'Assay Method', value: 'Competitive Immunoassay (ELISA)' },
        { label: 'Standard', value: 'Hydrocortisone Standard' },
        { label: 'Testing Pathologist', value: 'Partner Lab Pathologist' },
      ],
    },
    {
      step: 4,
      stepCode: '04',
      title: 'Gemini finds the cause',
      phase: 'Calendar Correlation',
      location: 'Powered by Google Gemini • BAALANCE',
      date: 'Sep 18, 2026',
      time: '10:00 AM IST',
      description:
        '90-day hair cortisol timeline mapped against Google Calendar meeting hours to isolate late evening calls behind biological strain.',
      detailNote:
        'Cross-correlation isolated 57 late calls past 7:00 PM and heavy August meetings as the primary stress drivers.',
      icon: Sparkles,
      accentGradient: 'from-[#3186FF] to-blue-700',
      badgeBg: 'bg-blue-50 text-[#3186FF] border-blue-200',
      borderAccent: 'border-blue-300 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/20 ring-1 ring-[#3186FF]/25 shadow-sm',
      cardGlow: 'shadow-blue-100/60',
      iconContainer: 'bg-gradient-to-br from-[#3186FF] to-indigo-600 text-white ring-4 ring-blue-100 shadow-sm',
      badge: 'Active & Ready',
      isDone: true,
      isCurrent: true,
      tags: [],
      custodyDetails: [
        { label: 'Intelligence', value: 'Powered by Google Gemini' },
        { label: 'Inputs', value: 'Hair Biomarkers + Google Calendar' },
        { label: 'Stress Score', value: '78 / 100 (High stress)' },
      ],
    },
  ];

  const toggleExpand = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 font-sans space-y-5 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-blue-50/40 via-emerald-50/20 to-transparent pointer-events-none" />

      {/* Header with Title and Verification Credentials */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
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
              From salon haircut to partner lab test and Gemini insight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Partner Lab Tested</span>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-bold text-[#3186FF] hover:text-blue-800 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 transition-all cursor-pointer"
          >
            {showDetails ? 'Hide details' : 'See details'}
          </button>
        </div>
      </div>

      {/* Modern Connected Milestone Breadcrumb Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
        {journeyStages.map((stage) => {
          return (
            <div
              key={stage.step}
              className="p-3 rounded-2xl border text-left bg-slate-50/80 border-slate-200/80 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400">STAGE {stage.stepCode}</span>
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-2xs">
                  ✓
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">{stage.title}</div>
              <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{stage.date}</div>
            </div>
          );
        })}
      </div>

      {/* Main Vertical Journey Stepper (Visible when user clicks 'See details') */}
      {showDetails && (
        <div className="relative pl-3 sm:pl-5 space-y-6 pt-4 animate-fade-in border-t border-slate-100">
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
      )}
    </div>
  );
});
