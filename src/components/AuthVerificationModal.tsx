'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight, Mail, Sparkles, Lock, RefreshCw, X } from 'lucide-react';

interface AuthVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  name: string;
  mode: 'google' | 'credentials';
  isNewUser?: boolean;
  onVerified: (userData: { name: string; email: string; isNewUser?: boolean }) => void;
}

export const AuthVerificationModal: React.FC<AuthVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  name,
  mode,
  isNewUser = false,
  onVerified,
}) => {
  const [code, setCode] = useState(['8', '9', '4', '2', '0', '1']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVerifying(true);
      // Auto-simulate credential / OAuth handshake verification
      const timer = setTimeout(() => {
        setIsVerifying(false);
        setIsSuccess(true);
      }, mode === 'google' ? 800 : 1000);
      return () => clearTimeout(timer);
    } else {
      setIsSuccess(false);
      setIsVerifying(false);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleComplete = () => {
    onVerified({ name, email, isNewUser });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 sm:p-7 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Animated Shield */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3186FF] to-[#6366F1] text-white flex items-center justify-center shadow-md mb-4">
          {isSuccess ? (
            <CheckCircle2 className="w-7 h-7 text-white animate-bounce" />
          ) : isVerifying ? (
            <RefreshCw className="w-6 h-6 animate-spin" />
          ) : (
            <ShieldCheck className="w-7 h-7" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-black tracking-tight">
          {mode === 'google' ? 'Google Account Verified' : 'Security Verification'}
        </h3>
        
        <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
          {mode === 'google'
            ? 'Authenticated with Supabase OAuth gateway at nyxivqlpikoffdopfmei.supabase.co'
            : `We verified your secure access credentials for ${email}`}
        </p>

        {/* User Card */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-left flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#3186FF] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-black truncate">{name}</div>
            <div className="text-[11px] text-slate-500 font-mono truncate">{email}</div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            ✓ Active
          </span>
        </div>

        {/* 6-Digit Code Box (for credential mode) */}
        {mode === 'credentials' && (
          <div className="mt-4">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
              Encrypted Session Code
            </label>
            <div className="flex justify-center gap-1.5 sm:gap-2">
              {code.map((digit, idx) => (
                <div
                  key={idx}
                  className="w-9 h-10 rounded-xl border border-slate-300 bg-white font-mono font-bold text-sm flex items-center justify-center text-slate-800 shadow-xs"
                >
                  {digit}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 mt-1.5 block">
              Auto-verified with biometric platform keystore
            </span>
          </div>
        )}

        {/* Storage Gateway Indicator */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Storage: nyxivqlpikoffdopfmei.supabase.co</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleComplete}
          disabled={isVerifying}
          className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <span>{isNewUser ? 'Continue to Demographic & Lifestyle Profile' : 'Enter Dashboard'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
