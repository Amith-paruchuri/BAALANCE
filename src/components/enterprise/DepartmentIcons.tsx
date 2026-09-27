'use client';

import React from 'react';

interface AnimatedEmojiIconProps {
  iconKey?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedDepartmentIcon: React.FC<AnimatedEmojiIconProps> = ({
  iconKey = 'emergency',
  className = '',
  size = 'md',
}) => {
  const sizeStyles = {
    sm: { container: 'w-8 h-8 rounded-xl text-lg', ping: 'w-2 h-2 -top-0.5 -right-0.5' },
    md: { container: 'w-11 h-11 rounded-2xl text-2xl', ping: 'w-2.5 h-2.5 -top-1 -right-1' },
    lg: { container: 'w-14 h-14 rounded-2xl text-3xl', ping: 'w-3 h-3 -top-1 -right-1' },
  }[size];

  const getEmojiData = (key: string) => {
    switch (key.toLowerCase()) {
      // HOSPITAL DEPARTMENTS
      case 'emergency':
      case 'em':
      case 'em-01':
        return { emoji: '🚨', bg: 'bg-rose-100 border-rose-300 shadow-rose-200/50', animate: 'animate-bounce', hasPing: true };
      case 'icu':
      case 'critical-care':
      case 'icu-02':
        return { emoji: '🩺', bg: 'bg-red-100 border-red-300 shadow-red-200/50', animate: 'animate-pulse', hasPing: false };
      case 'surgery':
      case 'trauma-surgery':
      case 'surg-03':
        return { emoji: '🔪', bg: 'bg-indigo-100 border-indigo-300 shadow-indigo-200/50', animate: 'hover:rotate-12 transition-transform', hasPing: false };
      case 'cardiology':
      case 'cath-lab':
      case 'card-04':
        return { emoji: '🫀', bg: 'bg-rose-100 border-rose-300 shadow-rose-200/50', animate: 'animate-pulse', hasPing: true };
      case 'neurology':
      case 'stroke':
      case 'neuro-05':
        return { emoji: '🧠', bg: 'bg-purple-100 border-purple-300 shadow-purple-200/50', animate: 'animate-bounce', hasPing: false };
      case 'anesthesia':
      case 'airway':
      case 'anes-06':
        return { emoji: '💉', bg: 'bg-cyan-100 border-cyan-300 shadow-cyan-200/50', animate: 'hover:scale-110 transition-transform', hasPing: false };
      case 'pediatrics':
      case 'neonatology':
      case 'peds-07':
        return { emoji: '👶', bg: 'bg-amber-100 border-amber-300 shadow-amber-200/50', animate: 'animate-bounce', hasPing: false };
      case 'oncology':
      case 'bmt':
      case 'onc-08':
        return { emoji: '🔬', bg: 'bg-fuchsia-100 border-fuchsia-300 shadow-fuchsia-200/50', animate: 'hover:rotate-6 transition-transform', hasPing: false };
      case 'orthopedics':
      case 'spine':
      case 'ortho-09':
        return { emoji: '🦴', bg: 'bg-teal-100 border-teal-300 shadow-teal-200/50', animate: 'hover:scale-110 transition-transform', hasPing: false };

      // SCHOOL DEPARTMENTS
      case 'grade-9':
      case 'freshmen':
      case 'gr-09':
        return { emoji: '🎒', bg: 'bg-emerald-100 border-emerald-300 shadow-emerald-200/50', animate: 'animate-pulse', hasPing: false };
      case 'grade-10':
      case 'gr-10':
        return { emoji: '📚', bg: 'bg-cyan-100 border-cyan-300 shadow-cyan-200/50', animate: 'hover:scale-110 transition-transform', hasPing: false };
      case 'grade-11':
      case 'jee-neet':
      case 'gr-11':
        return { emoji: '🔥', bg: 'bg-rose-100 border-rose-300 shadow-rose-200/50', animate: 'animate-bounce', hasPing: true };
      case 'grade-12':
      case 'finals':
      case 'gr-12':
        return { emoji: '🎓', bg: 'bg-amber-100 border-amber-300 shadow-amber-200/50', animate: 'hover:rotate-6 transition-transform', hasPing: false };
      case 'stem':
      case 'fac-stem':
        return { emoji: '🔬', bg: 'bg-blue-100 border-blue-300 shadow-blue-200/50', animate: 'animate-pulse', hasPing: false };
      case 'humanities':
      case 'fac-hum':
        return { emoji: '🎨', bg: 'bg-violet-100 border-violet-300 shadow-violet-200/50', animate: 'hover:scale-110 transition-transform', hasPing: false };
      case 'athletics':
      case 'ath-07':
        return { emoji: '🏆', bg: 'bg-orange-100 border-orange-300 shadow-orange-200/50', animate: 'animate-bounce', hasPing: false };
      case 'counseling':
      case 'well-08':
        return { emoji: '💭', bg: 'bg-pink-100 border-pink-300 shadow-pink-200/50', animate: 'hover:scale-110 transition-transform', hasPing: false };

      // CORPORATE DEPARTMENTS
      case 'infra':
      case 'reliability':
      case 'eng-infra':
        return { emoji: '💻', bg: 'bg-amber-100 border-amber-300 shadow-amber-200/50', animate: 'animate-pulse', hasPing: true };
      case 'sales':
      case 'enterprise-sales':
      case 'sales-ent':
        return { emoji: '📈', bg: 'bg-emerald-100 border-emerald-300 shadow-emerald-200/50', animate: 'animate-bounce', hasPing: false };
      case 'secops':
      case 'security':
      case 'sec-ops':
        return { emoji: '🛡️', bg: 'bg-rose-100 border-rose-300 shadow-rose-200/50', animate: 'animate-pulse', hasPing: false };
      case 'product':
      case 'ux':
      case 'prod-ux':
        return { emoji: '🎨', bg: 'bg-purple-100 border-purple-300 shadow-purple-200/50', animate: 'hover:scale-110 transition-transform', hasPing: false };
      case 'ai':
      case 'ml':
      case 'eng-ai':
        return { emoji: '🤖', bg: 'bg-cyan-100 border-cyan-300 shadow-cyan-200/50', animate: 'animate-bounce', hasPing: false };
      case 'support':
      case 'cs':
      case 'cs-ops':
        return { emoji: '🎧', bg: 'bg-blue-100 border-blue-300 shadow-blue-200/50', animate: 'hover:scale-110 transition-transform', hasPing: false };
      case 'finance':
      case 'legal':
      case 'fin-corp':
        return { emoji: '💼', bg: 'bg-slate-100 border-slate-300 shadow-slate-200/50', animate: 'hover:scale-110 transition-transform', hasPing: false };
      case 'hr':
      case 'talent':
      case 'hr-talent':
        return { emoji: '🤝', bg: 'bg-teal-100 border-teal-300 shadow-teal-200/50', animate: 'hover:scale-110 transition-transform', hasPing: false };

      default:
        return { emoji: '🏥', bg: 'bg-slate-100 border-slate-300 shadow-slate-200/50', animate: '', hasPing: false };
    }
  };

  const { emoji, bg, animate, hasPing } = getEmojiData(iconKey);

  return (
    <div
      className={`relative inline-flex items-center justify-center border shadow-xs transition-all select-none ${sizeStyles.container} ${bg} ${className}`}
    >
      <span className={`leading-none ${animate}`}>{emoji}</span>
      {hasPing && (
        <span className={`absolute rounded-full bg-rose-500 animate-ping ${sizeStyles.ping}`} />
      )}
    </div>
  );
};

export const AnimatedSubgroupIcon: React.FC<AnimatedEmojiIconProps> = ({
  iconKey = 'night',
  className = '',
  size = 'sm',
}) => {
  const sizeStyles = {
    sm: { container: 'w-7 h-7 rounded-lg text-sm' },
    md: { container: 'w-9 h-9 rounded-xl text-lg' },
    lg: { container: 'w-11 h-11 rounded-xl text-xl' },
  }[size];

  const getSubgroupEmoji = (key: string) => {
    switch (key.toLowerCase()) {
      case 'night':
      case 'resuscitation':
      case 'em-n':
        return { emoji: '🌙', bg: 'bg-indigo-50 border-indigo-200' };
      case 'day':
      case 'triage':
      case 'em-d':
        return { emoji: '☀️', bg: 'bg-amber-50 border-amber-200' };
      case 'surge':
      case 'weekend':
      case 'em-w':
        return { emoji: '🔥', bg: 'bg-rose-50 border-rose-200' };
      case 'resident':
      case 'junior':
      case 'surg-res':
        return { emoji: '⏰', bg: 'bg-red-50 border-red-200' };
      case 'attending':
      case 'staff':
      case 'surg-att':
        return { emoji: '🛡️', bg: 'bg-emerald-50 border-emerald-200' };
      case 'micu':
      case 'icu-m':
        return { emoji: '🫁', bg: 'bg-blue-50 border-blue-200' };
      case 'sicu':
      case 'icu-s':
        return { emoji: '🚨', bg: 'bg-rose-50 border-rose-200' };
      case 'nicu':
      case 'peds-icu':
      case 'icu-n':
        return { emoji: '🍼', bg: 'bg-amber-50 border-amber-200' };
      case 'oncall':
      case 'pager':
      case 'card-stemi':
        return { emoji: '📟', bg: 'bg-rose-50 border-rose-200' };
      case 'stem-track':
      case 'math':
      case '11-a':
        return { emoji: '📐', bg: 'bg-blue-50 border-blue-200' };
      case 'med-track':
      case '11-b':
        return { emoji: '🧬', bg: 'bg-rose-50 border-rose-200' };
      case 'arts-track':
      case '11-c':
        return { emoji: '📖', bg: 'bg-violet-50 border-violet-200' };
      case 'sales-us':
      case 'americas':
        return { emoji: '✈️', bg: 'bg-rose-50 border-rose-200' };
      case 'sales-apac':
      case 'intl':
        return { emoji: '🌏', bg: 'bg-indigo-50 border-indigo-200' };
      default:
        return { emoji: '👥', bg: 'bg-slate-50 border-slate-200' };
    }
  };

  const { emoji, bg } = getSubgroupEmoji(iconKey);

  return (
    <div
      className={`inline-flex items-center justify-center border shadow-2xs select-none ${sizeStyles.container} ${bg} ${className}`}
    >
      <span className="leading-none">{emoji}</span>
    </div>
  );
};
