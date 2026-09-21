'use client';

import React from 'react';
import { Smartphone, Monitor, Sparkles, Wifi, Battery, Signal } from 'lucide-react';

interface PhoneSimulatorFrameProps {
  isPhoneMode: boolean;
  onTogglePhoneMode: () => void;
  children: React.ReactNode;
}

export const PhoneSimulatorFrame: React.FC<PhoneSimulatorFrameProps> = ({
  isPhoneMode,
  onTogglePhoneMode,
  children,
}) => {
  if (!isPhoneMode) {
    return (
      <div className="w-full min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E293B] py-6 sm:py-10 px-4 flex flex-col items-center justify-center animate-fade-in">
      {/* Floating Pitch Video Banner / Controller */}
      <div className="mb-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-3 text-white text-xs shadow-lg">
        <span className="flex items-center gap-1.5 font-bold text-sky-400">
          <Smartphone className="w-4 h-4" />
          <span>Pitch Video Mobile View (iPhone 16 Pro 19.5:9 Frame)</span>
        </span>
        <span className="text-slate-400">•</span>
        <button
          onClick={onTogglePhoneMode}
          className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium transition-colors flex items-center gap-1"
          title="Switch back to desktop view"
        >
          <Monitor className="w-3 h-3" />
          <span>Exit Mobile Frame</span>
        </button>
      </div>

      {/* Realistic Mobile Device Mockup */}
      <div className="relative w-[390px] h-[844px] max-h-[90vh] bg-[#F0F4FA] rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#0F172A,0_0_0_14px_#334155] overflow-hidden flex flex-col border-[4px] border-slate-900 select-none">
        {/* Top Phone Chrome / Dynamic Island & Status Bar */}
        <div className="h-11 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-7 shrink-0 z-40 relative">
          <span className="text-[12px] font-bold text-black font-sans tracking-tight">9:41</span>
          
          {/* Dynamic Island Pill */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B] border border-slate-800" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 text-black">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Scrollable Device Screen Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#F0F4FA] no-scrollbar">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="h-5 bg-white/90 backdrop-blur-md flex items-center justify-center shrink-0 z-40">
          <div className="w-32 h-1 bg-slate-900/30 rounded-full" />
        </div>
      </div>
    </div>
  );
};
