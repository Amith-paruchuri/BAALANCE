'use client';

import React from 'react';
import { Droplets, Sparkles, Users, Pill, CheckCircle, Info } from 'lucide-react';
import { ConfounderAdjustment } from '@/lib/enterpriseTypes';

interface ConfounderNormalizationCardProps {
  confounders: ConfounderAdjustment[];
  activeUnitName?: string;
  detectedConfounders?: string[];
}

export const ConfounderNormalizationCard: React.FC<ConfounderNormalizationCardProps> = ({
  confounders,
  activeUnitName,
  detectedConfounders = [],
}) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'hygiene':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'chemical':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'demographic':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'pharmacology':
      default:
        return <Pill className="w-4 h-4 text-rose-600" />;
    }
  };

  const getPillBadge = (category: string) => {
    switch (category) {
      case 'hygiene':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">Hygiene & Wash</span>;
      case 'chemical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Chemical Treatments</span>;
      case 'demographic':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Ethnicity & Texture</span>;
      case 'pharmacology':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Medications & CBG</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Mathematical Normalization Engine
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Multi-Confounder Bias Calibration
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Raw hair cortisol is normalized against demographic, hygiene, and chemical variables for true equity.
          </p>
        </div>

        {activeUnitName && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold self-start sm:self-auto">
            Active Focus: <span className="text-[#3186FF]">{activeUnitName}</span>
          </div>
        )}
      </div>

      {/* Grid of 4 Confounders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {confounders.map((c, idx) => {
          const isDetectedInUnit = detectedConfounders.some(dc =>
            c.factor.toLowerCase().includes(dc.toLowerCase()) || dc.toLowerCase().includes(c.category)
          );

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isDetectedInUnit
                  ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300'
                  : 'bg-slate-50/60 border-slate-200/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-white shadow-2xs border border-slate-100">
                    {getIcon(c.category)}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                      {c.factor}
                    </h4>
                    <div className="mt-0.5">{getPillBadge(c.category)}</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-white border border-slate-200 text-slate-700">
                  {c.rawImpactPercent > 0 ? `+${c.rawImpactPercent}%` : `${c.rawImpactPercent}%`} delta
                </span>
              </div>

              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                {c.description}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                <span className="font-mono text-slate-500 font-bold">Formula:</span>
                <span className="font-mono font-bold text-slate-800 truncate max-w-[210px]" title={c.normalizedFormula}>
                  {c.normalizedFormula}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Equity & Clinical Integrity Notice */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="text-[11px] text-emerald-900 font-medium">
          <strong>Clinical Standardization Guarantee:</strong> No employee or student is unfairly penalized or miscategorized due to hair texture, religious wash rituals, or necessary prescription therapies.
        </p>
      </div>
    </div>
  );
};
