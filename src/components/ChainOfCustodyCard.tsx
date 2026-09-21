'use client';

import React from 'react';
import { ShieldCheck, Scissors, Truck, FlaskConical, Sparkles, CheckCircle2 } from 'lucide-react';
import { ChainOfCustody } from '@/lib/types';

interface ChainOfCustodyCardProps {
  chainOfCustody: ChainOfCustody;
  onAdvanceStep?: () => void;
}

export const ChainOfCustodyCard: React.FC<ChainOfCustodyCardProps> = ({
  chainOfCustody,
}) => {
  const steps = [
    {
      step: 1,
      label: 'Salon Snip',
      sublabel: 'Collection Hub',
      icon: Scissors,
    },
    {
      step: 2,
      label: 'Lab Courier',
      sublabel: 'Blue Dart Express',
      icon: Truck,
    },
    {
      step: 3,
      label: 'Hair Cortisol Test (ELISA)',
      sublabel: 'Spectrometry OK',
      icon: FlaskConical,
    },
    {
      step: 4,
      label: 'Gemini Correlation',
      sublabel: 'Active',
      icon: Sparkles,
      activeSpark: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3186FF]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-black">Chain of Custody</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#F0F4FA] font-bold text-[#3186FF] border border-[#E2E8F0]">
              {chainOfCustody.specimenBarcode}
            </span>
            <span className="text-xs text-[#5F6368] hidden sm:inline">• {chainOfCustody.sampleWeightMg} mg dry mass</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-center">
          <CheckCircle2 className="w-3.5 h-3.5" />
          CLIA Validated
        </span>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5">
        {steps.map((item) => {
          const isCompleted = item.step < chainOfCustody.currentStep;
          const isCurrent = item.step === chainOfCustody.currentStep;
          const Icon = item.icon;

          return (
            <div
              key={item.step}
              className={`p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-[#3186FF] bg-blue-50/40 ring-1 ring-[#3186FF]/30'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-[#E2E8F0] bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-[#3186FF] via-[#6366F1] to-[#FB7185] text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-[#5F6368]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>

                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                    isCurrent
                      ? 'bg-blue-100 text-[#3186FF]'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCurrent ? 'Active' : isCompleted ? 'Done' : 'Pending'}
                </span>
              </div>

              <div className="text-xs font-bold text-black truncate">{item.label}</div>
              <div className="text-[10px] text-[#5F6368] truncate">{item.sublabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
