'use client';

import React from 'react';
import {
  HeartPulse,
  Activity,
  Scissors,
  Heart,
  Zap,
  Syringe,
  Baby,
  Dna,
  Bone,
  Moon,
  Sun,
  Flame,
  Clock,
  Shield,
  ShieldAlert,
  Server,
  TrendingUp,
  Cpu,
  Headphones,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Trophy,
  HeartHandshake,
  Palette,
  Scale,
  Sparkles,
  Layers,
  Radio,
  BellRing,
  BedDouble,
  Crosshair,
  LucideIcon,
} from 'lucide-react';

interface AnimatedIconProps {
  iconKey?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedDepartmentIcon: React.FC<AnimatedIconProps> = ({
  iconKey = 'emergency',
  className = '',
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  switch (iconKey.toLowerCase()) {
    // HOSPITAL DEPARTMENTS
    case 'emergency':
    case 'em':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-200">
          <HeartPulse className={`${sizeClass} animate-pulse ${className}`} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        </div>
      );
    case 'icu':
    case 'critical-care':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-red-500/10 text-red-600 border border-red-200">
          <Activity className={`${sizeClass} animate-pulse ${className}`} />
        </div>
      );
    case 'surgery':
    case 'trauma-surgery':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-200">
          <Scissors className={`${sizeClass} transition-transform hover:rotate-45 ${className}`} />
        </div>
      );
    case 'cardiology':
    case 'cath-lab':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-200">
          <Heart className={`${sizeClass} animate-bounce ${className}`} style={{ animationDuration: '1.2s' }} />
        </div>
      );
    case 'neurology':
    case 'stroke':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-200">
          <Zap className={`${sizeClass} animate-pulse text-purple-500 ${className}`} />
        </div>
      );
    case 'anesthesia':
    case 'airway':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-200">
          <Syringe className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'pediatrics':
    case 'neonatology':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200">
          <Baby className={`${sizeClass} animate-bounce ${className}`} style={{ animationDuration: '2s' }} />
        </div>
      );
    case 'oncology':
    case 'bmt':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 border border-fuchsia-200">
          <Dna className={`${sizeClass} animate-spin ${className}`} style={{ animationDuration: '10s' }} />
        </div>
      );
    case 'orthopedics':
    case 'spine':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-200">
          <Bone className={`${sizeClass} ${className}`} />
        </div>
      );

    // SCHOOL DEPARTMENTS
    case 'grade-9':
    case 'freshmen':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-200">
          <Sparkles className={`${sizeClass} animate-pulse ${className}`} />
        </div>
      );
    case 'grade-10':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-200">
          <BookOpen className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'grade-11':
    case 'jee-neet':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-200">
          <Flame className={`${sizeClass} animate-bounce text-rose-600 ${className}`} style={{ animationDuration: '1s' }} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        </div>
      );
    case 'grade-12':
    case 'finals':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200">
          <GraduationCap className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'stem':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-200">
          <FlaskConical className={`${sizeClass} animate-pulse ${className}`} />
        </div>
      );
    case 'humanities':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-violet-500/10 text-violet-600 border border-violet-200">
          <Layers className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'athletics':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-200">
          <Trophy className={`${sizeClass} animate-bounce ${className}`} style={{ animationDuration: '2.5s' }} />
        </div>
      );
    case 'counseling':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-pink-500/10 text-pink-600 border border-pink-200">
          <HeartHandshake className={`${sizeClass} ${className}`} />
        </div>
      );

    // CORPORATE DEPARTMENTS
    case 'infra':
    case 'reliability':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200">
          <Server className={`${sizeClass} ${className}`} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        </div>
      );
    case 'sales':
    case 'enterprise-sales':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-200">
          <TrendingUp className={`${sizeClass} animate-pulse text-emerald-600 ${className}`} />
        </div>
      );
    case 'secops':
    case 'security':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-200">
          <ShieldAlert className={`${sizeClass} animate-pulse ${className}`} />
        </div>
      );
    case 'product':
    case 'ux':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-200">
          <Palette className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'ai':
    case 'ml':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-200">
          <Cpu className={`${sizeClass} animate-spin ${className}`} style={{ animationDuration: '14s' }} />
        </div>
      );
    case 'support':
    case 'cs':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-200">
          <Headphones className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'finance':
    case 'legal':
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-slate-500/10 text-slate-600 border border-slate-200">
          <Scale className={`${sizeClass} ${className}`} />
        </div>
      );

    default:
      return (
        <div className="relative inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
          <Activity className={`${sizeClass} ${className}`} />
        </div>
      );
  }
};

export const AnimatedSubgroupIcon: React.FC<AnimatedIconProps> = ({
  iconKey = 'night',
  className = '',
  size = 'sm',
}) => {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  switch (iconKey.toLowerCase()) {
    case 'night':
    case 'resuscitation':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-indigo-500/10 text-indigo-600">
          <Moon className={`${sizeClass} animate-pulse ${className}`} />
        </div>
      );
    case 'day':
    case 'triage':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-amber-500/10 text-amber-600">
          <Sun className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'surge':
    case 'weekend':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-rose-500/10 text-rose-600">
          <Flame className={`${sizeClass} animate-bounce ${className}`} style={{ animationDuration: '1.2s' }} />
        </div>
      );
    case 'resident':
    case 'junior':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-red-500/10 text-red-600">
          <Clock className={`${sizeClass} animate-spin ${className}`} style={{ animationDuration: '8s' }} />
        </div>
      );
    case 'attending':
    case 'staff':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-emerald-500/10 text-emerald-600">
          <Shield className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'micu':
    case 'sicu':
    case 'icu':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-rose-500/10 text-rose-600">
          <Activity className={`${sizeClass} animate-pulse ${className}`} />
        </div>
      );
    case 'nicu':
    case 'peds-icu':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-amber-500/10 text-amber-600">
          <Baby className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'oncall':
    case 'pager':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-amber-500/10 text-amber-600">
          <BellRing className={`${sizeClass} animate-bounce ${className}`} style={{ animationDuration: '1s' }} />
        </div>
      );
    case 'stem-track':
    case 'math':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-blue-500/10 text-blue-600">
          <FlaskConical className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'med-track':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-rose-500/10 text-rose-600">
          <HeartPulse className={`${sizeClass} animate-pulse ${className}`} />
        </div>
      );
    case 'arts-track':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-violet-500/10 text-violet-600">
          <BookOpen className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'sales-us':
    case 'americas':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-emerald-500/10 text-emerald-600">
          <TrendingUp className={`${sizeClass} ${className}`} />
        </div>
      );
    case 'sales-apac':
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-indigo-500/10 text-indigo-600">
          <Moon className={`${sizeClass} ${className}`} />
        </div>
      );
    default:
      return (
        <div className="inline-flex items-center justify-center p-1 rounded-lg bg-slate-100 text-slate-600">
          <Crosshair className={`${sizeClass} ${className}`} />
        </div>
      );
  }
};
