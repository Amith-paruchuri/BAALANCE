'use client';

import React from 'react';
import {
  Flame,
  Calendar,
  HeartPulse,
  MessageSquare,
  User,
  Sparkles,
} from 'lucide-react';

export type DashboardTab = 'stress' | 'calendar' | 'wearables' | 'tricha' | 'profile';

interface BottomNavigationBarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  unreadChatAlert?: boolean;
}

interface NavItem {
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  hasDot?: boolean;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  onSelectTab,
  unreadChatAlert = false,
}) => {
  const items: NavItem[] = [
    {
      id: 'stress',
      label: 'Stress',
      icon: Flame,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
    },
    {
      id: 'wearables',
      label: 'Wearables',
      icon: HeartPulse,
    },
    {
      id: 'tricha',
      label: 'Tricha AI',
      icon: MessageSquare,
      badge: 'AI',
      hasDot: unreadChatAlert,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-4px_25px_rgba(0,0,0,0.06)] py-1.5 sm:py-2 px-2 sm:px-4 font-sans">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative select-none ${
                isActive
                  ? 'border-2 border-[#3186FF] bg-blue-50/80 text-[#3186FF] shadow-xs'
                  : 'border border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {/* Icon Container with optional badges */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-[#3186FF]' : 'text-slate-500'
                  }`}
                />

                {item.hasDot && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}

                {item.badge && !isActive && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full bg-gradient-to-r from-[#3186FF] to-indigo-600 text-white text-[8px] font-bold uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] sm:text-xs mt-1 transition-all ${
                  isActive ? 'font-bold text-[#3186FF]' : 'font-medium text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
