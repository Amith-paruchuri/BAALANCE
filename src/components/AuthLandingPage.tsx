'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Mail,
  Lock,
  User,
  Activity,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  GraduationCap,
  Stethoscope,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { BaalanceLogo } from './BaalanceLogo';

interface AuthLandingPageProps {
  onStartDemo: () => void;
  onAuthenticate: (userData: { name: string; email: string; isNewUser?: boolean }) => void;
  onOpenPitchMode?: () => void;
  onOpenEnterprise?: (orgId?: string) => void;
}

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({
  onStartDemo,
  onAuthenticate,
  onOpenEnterprise,
}) => {
  const [portalMode, setPortalMode] = useState<'individual' | 'enterprise'>('individual');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Enterprise domain input
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [enterpriseError, setEnterpriseError] = useState<string | null>(null);

  // Form fields - empty by default so user can enter their own credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Handle Form Submission (Sign In or Sign Up)
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    const userEmail = email.trim();
    if (!userEmail) {
      setPasswordError('Please enter your email address.');
      return;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      return;
    }

    if (activeTab === 'signup') {
      if (!name.trim()) {
        setPasswordError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match. Please verify.');
        return;
      }
    }

    const userName = activeTab === 'signup'
      ? name.trim()
      : (name.trim() || userEmail.split('@')[0]);

    const isNew = activeTab === 'signup';
    onAuthenticate({ name: userName, email: userEmail, isNewUser: isNew });
  };

  const handleEnterpriseDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnterpriseError(null);
    const cleanEmail = institutionEmail.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setEnterpriseError('Please enter a valid work or school email address.');
      return;
    }

    const domain = cleanEmail.split('@')[1];
    if (domain.includes('edu') || domain.includes('school') || domain.includes('ac.')) {
      onOpenEnterprise?.('st-jude-academy');
    } else if (domain.includes('hospital') || domain.includes('health') || domain.includes('med') || domain.includes('aiims') || domain.includes('apollo')) {
      onOpenEnterprise?.('apollo-health');
    } else {
      onOpenEnterprise?.('nexus-tech');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex flex-col justify-between p-4 sm:p-8 selection:bg-[#3186FF] selection:text-white font-sans">
      {/* Top Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <BaalanceLogo size="sm" showTagline={false} animated={true} />

        <div className="flex items-center gap-2">
          {portalMode === 'individual' ? (
            <>
              <button
                type="button"
                onClick={() => setPortalMode('enterprise')}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Building2 className="w-3 h-3 text-slate-500" />
                <span>For teams</span>
              </button>
              <button
                type="button"
                onClick={onStartDemo}
                className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Try the demo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPortalMode('individual')}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <User className="w-3 h-3 text-[#3186FF]" />
                <span>For you</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenEnterprise?.('apollo-health')}
                className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Launch Hospital Demo</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-4xl mx-auto w-full py-6 sm:py-10 space-y-6 text-center">
        {/* Animated Brand Hero */}
        <div className="flex flex-col items-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-xs font-bold text-slate-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#BF6F4E]" />
            <span>One snip of hair. Three months of stress, measured.</span>
          </div>

          <BaalanceLogo size="xl" showTagline={true} animated={true} />

          {/* 3-Step Visual Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-slate-700 bg-white/80 backdrop-blur-xs py-2 px-4 rounded-full border border-slate-200/90 shadow-2xs max-w-xl mx-auto mt-1">
            <span className="flex items-center gap-1.5">
              <span>✂️</span> <span>Snip at a salon or at home</span>
            </span>
            <span className="text-slate-300 font-normal">→</span>
            <span className="flex items-center gap-1.5">
              <span>🧪</span> <span>Lab reads your cortisol</span>
            </span>
            <span className="text-slate-300 font-normal">→</span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#3186FF] font-bold">✨</span> <span>Gemini finds what caused it</span>
            </span>
          </div>
        </div>

        {/* PRIMARY PORTAL SELECTOR: INDIVIDUAL VS ENTERPRISE */}
        <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300 shadow-2xs max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setPortalMode('individual')}
            className={`px-5 sm:px-7 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              portalMode === 'individual'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className={`w-3.5 h-3.5 ${portalMode === 'individual' ? 'text-[#3186FF]' : 'text-slate-400'}`} />
            <span>For you</span>
          </button>

          <button
            type="button"
            onClick={() => setPortalMode('enterprise')}
            className={`px-5 sm:px-7 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              portalMode === 'enterprise'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${portalMode === 'enterprise' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>For teams</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: INDIVIDUAL PORTAL                                */}
        {/* ======================================================== */}
        {portalMode === 'individual' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto text-left animate-in fade-in duration-150">
            {/* Option 1: Instant Demo */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500/80 p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden ring-4 ring-emerald-500/10">
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                    Interactive 90-Day Demo
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">No login required</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  See what your hair reveals
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Real 3-month hair cortisol case matched against 57 late calls past 7 PM on Google Calendar.
                </p>

                {/* Hair Timeline & Score Preview Mini-Widget */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">3-Month Cortisol (pg/mg)</span>
                    <span className="font-extrabold text-[#E05252] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Score: 78 · High stress
                    </span>
                  </div>

                  {/* 3 Monthly segments */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                      <div className="text-[10px] text-slate-500 font-medium">July (Tip)</div>
                      <div className="text-xs font-black text-emerald-700">11.2</div>
                      <div className="text-[9px] text-emerald-600 font-semibold">Healthy</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-rose-300 shadow-2xs ring-2 ring-rose-400/20">
                      <div className="text-[10px] text-slate-500 font-medium">August</div>
                      <div className="text-xs font-black text-[#E05252]">28.4 ⚠️</div>
                      <div className="text-[9px] text-rose-600 font-semibold">Peak stress</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-amber-200 shadow-2xs">
                      <div className="text-[10px] text-slate-500 font-medium">Sept (Root)</div>
                      <div className="text-xs font-black text-amber-700">15.6</div>
                      <div className="text-[9px] text-amber-600 font-semibold">Recovering</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                    <span>📅 57 calls past 7 PM</span>
                    <span>✈️ 11 flights</span>
                    <span>✨ Gemini action plan</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartDemo}
                className="mt-5 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>See a 90-day demo (no login)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Option 2: Authentication Card (Sign In / Sign Up) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      setPasswordError(null);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'signin'
                        ? 'bg-white text-black shadow-xs'
                        : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      setPasswordError(null);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'signup'
                        ? 'bg-white text-black shadow-xs'
                        : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <h3 className="text-base font-bold text-[#000000]">
                  {activeTab === 'signin' ? 'Welcome Back' : 'Create New Account'}
                </h3>
                <p className="text-xs text-[#5F6368] mt-0.5">
                  {activeTab === 'signin'
                    ? 'Access your hair cortisol lab history and calendar analysis'
                    : 'Track biological stress with zero-friction salon collection'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3186FF] focus:outline-none bg-white text-black"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email ID"
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3186FF] focus:outline-none bg-white text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={activeTab === 'signin' ? 'Enter your password' : 'Min. 6 characters'}
                      className="w-full pl-8 pr-9 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3186FF] focus:outline-none bg-white text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>
                </div>

                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-8 pr-9 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3186FF] focus:outline-none bg-white text-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                      </button>
                    </div>
                  </div>
                )}

                {passwordError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer mt-2"
                >
                  <span>{activeTab === 'signin' ? 'Sign In to Dashboard' : 'Create Account & Begin Intake'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: ENTERPRISE & INSTITUTIONS WORKSPACES             */}
        {/* ======================================================== */}
        {portalMode === 'enterprise' && (
          <div className="max-w-3xl mx-auto text-left space-y-6 animate-in fade-in duration-150">
            {/* Top Enterprise Value Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Workplace Stress Intelligence
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                See which teams are burning out, before people quit
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
                Periodic hair tests measure long-term team stress without intrusive surveys. Objective biological data, calibrated for individual hair wash frequency and medications.
              </p>

              {/* Instant Domain Join Input */}
              <form onSubmit={handleEnterpriseDomainSubmit} className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={institutionEmail}
                    onChange={e => {
                      setInstitutionEmail(e.target.value);
                      setEnterpriseError(null);
                    }}
                    placeholder="Enter work/school email (e.g. dr@aiims.edu)"
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#3186FF] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0 flex items-center justify-center gap-2"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
              {enterpriseError && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{enterpriseError}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy-first: groups of 5+ only</span>
                </div>
                <span>•</span>
                <span>Tested at partner laboratories</span>
                <span>•</span>
                <span>Zero individual scores visible to leadership</span>
              </div>
            </div>

            {/* 3 Sector Demos */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
                Explore Sector-Specific Live Workspaces
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Sector 1: Hospital */}
                <button
                  type="button"
                  onClick={() => onOpenEnterprise?.('apollo-health')}
                  className="bg-white rounded-2xl border border-rose-200/90 p-5 text-left shadow-card hover:shadow-cardHover hover:border-rose-400 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">🏥</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Healthcare
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">
                      Sunrise Multispeciality Hospital
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ICU, Emergency Medicine, Surgery & resident 36h shift pacing.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                    <span>Enter Hospital Demo</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Sector 2: School */}
                <button
                  type="button"
                  onClick={() => onOpenEnterprise?.('st-jude-academy')}
                  className="bg-white rounded-2xl border border-amber-200/90 p-5 text-left shadow-card hover:shadow-cardHover hover:border-amber-400 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">🎓</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Education
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                      Greenfield Public School
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Grades 9–12, Section B exam pressure & 10 PM homework curfew. (Parent consent required)
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                    <span>Enter School Demo</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Sector 3: Corporate */}
                <button
                  type="button"
                  onClick={() => onOpenEnterprise?.('nexus-tech')}
                  className="bg-white rounded-2xl border border-blue-200/90 p-5 text-left shadow-card hover:shadow-cardHover hover:border-blue-400 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">🏢</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Corporate
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Nimbus Tech
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Bengaluru, Gurugram & Pune Hubs · Engineering on-call pager stress & evening curfews.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>Enter Company Demo</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Social Proof & Origin Footer */}
      <footer className="w-full text-center py-4 border-t border-slate-200/80">
        <p className="text-xs font-medium text-slate-500">
          Built by a final-year medical student at <span className="font-semibold text-slate-700">AIIMS New Delhi</span> · <span className="text-[#3186FF] font-semibold">Google Fund My Crazy 2026 Top 10</span>
        </p>
      </footer>
    </div>
  );
};
