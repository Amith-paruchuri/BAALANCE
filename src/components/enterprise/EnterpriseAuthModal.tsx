'use client';

import React, { useState } from 'react';
import { Mail, Building2, GraduationCap, Stethoscope, ArrowRight, ShieldCheck, Check, Sparkles, X } from 'lucide-react';
import { MOCK_ORGANIZATIONS } from '@/lib/enterpriseMockData';

interface EnterpriseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinOrg: (orgId: string, email: string) => void;
}

export const EnterpriseAuthModal: React.FC<EnterpriseAuthModalProps> = ({
  isOpen,
  onClose,
  onJoinOrg,
}) => {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setStatusMessage('Please enter a valid institutional email address.');
      return;
    }

    const domain = cleanEmail.split('@')[1];

    // Find matching organization by domain
    for (const [orgId, org] of Object.entries(MOCK_ORGANIZATIONS)) {
      if (org.allowedDomains.some(d => domain.includes(d) || d.includes(domain))) {
        onJoinOrg(orgId, cleanEmail);
        onClose();
        return;
      }
    }

    // Default route to healthcare or corporate if novel domain
    if (domain.includes('edu') || domain.includes('school') || domain.includes('ac.')) {
      onJoinOrg('st-jude-academy', cleanEmail);
    } else if (domain.includes('hospital') || domain.includes('health') || domain.includes('med')) {
      onJoinOrg('apollo-health', cleanEmail);
    } else {
      onJoinOrg('nexus-tech', cleanEmail);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3186FF] animate-pulse" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Institutional Access
          </span>
        </div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          Join Your Organization Workspace
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Enter your official work or university email to securely access your cohort stress surveillance matrix.
        </p>

        {/* Email Domain Form */}
        <form onSubmit={handleDomainSubmit} className="mt-5 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Institutional Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setStatusMessage(null);
                }}
                placeholder="e.g. dr.malhotra@aiims.edu or sarah@stripe.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#3186FF] focus:outline-none bg-white text-black font-medium"
              />
            </div>
            {statusMessage && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{statusMessage}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>Authenticate Institutional Domain</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-bold text-[10px]">
              Or Explore Pre-Configured Sector Demos
            </span>
          </div>
        </div>

        {/* 3 Quick Sector Launchers */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              onJoinOrg('apollo-health', 'demo.doctor@aiims.edu');
              onClose();
            }}
            className="w-full p-3 rounded-2xl border border-rose-200/80 bg-rose-50/50 hover:bg-rose-100/60 transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏥</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900">Apollo & AIIMS Hospital Network</span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-rose-200/70 text-rose-800">Healthcare</span>
                </div>
                <p className="text-[11px] text-slate-500">ICU, Emergency Medicine, Surgery & Night Rotations</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => {
              onJoinOrg('st-jude-academy', 'demo.counselor@stjude.edu');
              onClose();
            }}
            className="w-full p-3 rounded-2xl border border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/60 transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎓</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900">St. Jude International Academy</span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-200/70 text-amber-800">K-12 & Schools</span>
                </div>
                <p className="text-[11px] text-slate-500">Grades 9–12, Exam Stress Waves & Homework Portals</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => {
              onJoinOrg('nexus-tech', 'demo.lead@stripe.com');
              onClose();
            }}
            className="w-full p-3 rounded-2xl border border-blue-200/80 bg-blue-50/50 hover:bg-blue-100/60 transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏢</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900">Nexus Technologies & Stripe Global</span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-blue-200/70 text-blue-800">Corporate</span>
                </div>
                <p className="text-[11px] text-slate-500">Infrastructure On-Call, Sales Quotas & Cross-Timezone Curfew</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Security & De-identification Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Privacy-first: results shown only for groups of 5+</span>
          </div>
          <span>Partner laboratory tested</span>
        </div>
      </div>
    </div>
  );
};
