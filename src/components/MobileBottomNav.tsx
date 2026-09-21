'use client';

import React from 'react';
import { LayoutDashboard, Sliders, Activity, Sparkles, MessageSquare } from 'lucide-react';

export type MobileTab = 'overview' | 'scrubber' | 'sync' | 'protocols' | 'copilot';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onOpenChat: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenChat,
}) => {
  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onSelectTab('overview')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors ${
            activeTab === 'overview' ? 'text-[#3186FF] font-bold' : 'text-[#5F6368] hover:text-black'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Overview</span>
        </button>

        <button
          onClick={() => onSelectTab('scrubber')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors ${
            activeTab === 'scrubber' ? 'text-[#3186FF] font-bold' : 'text-[#5F6368] hover:text-black'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[10px]">Scrubber</span>
        </button>

        <button
          onClick={() => onSelectTab('sync')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors ${
            activeTab === 'sync' ? 'text-[#3186FF] font-bold' : 'text-[#5F6368] hover:text-black'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="text-[10px]">Sync</span>
        </button>

        <button
          onClick={() => onSelectTab('protocols')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors ${
            activeTab === 'protocols' ? 'text-[#3186FF] font-bold' : 'text-[#5F6368] hover:text-black'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px]">Protocols</span>
        </button>

        <button
          onClick={onOpenChat}
          className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg text-[#3186FF] hover:text-blue-700 transition-colors"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <span className="text-[10px] font-bold">Co-Pilot</span>
        </button>
      </div>
    </nav>
  );
};
