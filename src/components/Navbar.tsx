'use client';

import React from 'react';
import { LogOut, Building2, LifeBuoy } from 'lucide-react';
import { openHelpPanel } from '@/lib/helplines';
import { UserProfile } from '@/lib/types';
import { BaalanceLogo } from './BaalanceLogo';
import { DashboardTab } from './BottomNavigationBar';

interface NavbarProps {
  userProfile: UserProfile;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onOpenEnterprise?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  activeTab,
  onSelectTab,
  onOpenEnterprise,
  onSignOut,
}) => {
  const initial = (userProfile.name || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-[#FBF7F2]/90 backdrop-blur-md border-b border-[#E7E1D8] font-sans">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <BaalanceLogo size="sm" showTagline={false} animated={true} />
          
          <div className="hidden lg:flex items-center pl-3 border-l border-[#E2E8F0]">
            <span className="text-xs font-medium italic text-slate-500">Hair keeps the receipts.</span>
          </div>
        </div>

        {/* Right: Controls (How It Works Guide for Judges/Users + Profile) */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={() => openHelpPanel('helplines')}
            className="flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
            title="Helplines and doctors near you"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Get help</span>
          </button>

          {/* Switch to Enterprise Workspaces */}
          {onOpenEnterprise && (
            <button
              type="button"
              onClick={onOpenEnterprise}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Workspaces for hospitals, colleges and companies"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">For teams</span>
            </button>
          )}


          {/* User Avatar Initial (Click switches to Profile tab) */}
          <button
            type="button"
            onClick={() => onSelectTab('profile')}
            className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white border border-slate-200'
                : 'hover:bg-white border border-transparent'
            }`}
            title="Profile and settings"
            aria-label="Profile and settings"
          >
            <div className="w-7 h-7 rounded-full bg-[#0D4F59] text-white flex items-center justify-center font-bold text-xs">
              {initial}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-black leading-tight truncate max-w-[120px]">
                {userProfile.name}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">Profile</span>
            </div>
          </button>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
