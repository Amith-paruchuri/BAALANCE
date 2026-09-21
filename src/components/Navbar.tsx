'use client';

import React from 'react';
import { LogOut, Sparkles, User, Play, Compass, HelpCircle } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { BaalanceLogo } from './BaalanceLogo';
import { DashboardTab } from './BottomNavigationBar';

interface NavbarProps {
  userProfile: UserProfile;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onOpenAppGuide?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  activeTab,
  onSelectTab,
  onOpenAppGuide,
  onSignOut,
}) => {
  const initial = (userProfile.name || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-2xs font-sans">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <BaalanceLogo size="sm" showTagline={false} animated={true} />
          
          <div className="hidden lg:flex items-center pl-3 border-l border-[#E2E8F0]">
            <span className="text-[11px] font-semibold text-[#0D4F59] tracking-wider uppercase">
              "Your hair keeps the receipts."
            </span>
          </div>
        </div>

        {/* Right: Controls (How It Works Guide for Judges/Users + Profile) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* How It Works Feature Guide Button */}
          {onOpenAppGuide && (
            <button
              type="button"
              onClick={onOpenAppGuide}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white shadow-2xs transition-all cursor-pointer"
              title="How It Works & Feature Guide for Judges"
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>How It Works</span>
            </button>
          )}

          {/* User Avatar Initial (Click switches to Profile tab) */}
          <button
            type="button"
            onClick={() => onSelectTab('profile')}
            className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-blue-50 border border-blue-200 ring-1 ring-blue-300'
                : 'hover:bg-slate-100 border border-transparent'
            }`}
            title="View Profile & Settings"
          >
            <div className="w-7 h-7 rounded-full bg-[#3186FF] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {initial}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-black leading-tight truncate max-w-[120px]">
                {userProfile.name}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">
                Profile ⚙️
              </span>
            </div>
          </button>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
