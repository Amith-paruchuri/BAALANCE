'use client';

import React, { useEffect, useState } from 'react';
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
  Scissors,
  FlaskConical,
  CalendarClock,
} from 'lucide-react';
import { BaalanceLogo } from './BaalanceLogo';
import { HairScienceExplainer } from './HairScienceExplainer';
import { openHelpPanel } from '@/lib/helplines';
import {
  type OAuthProvider,
  signInWithProvider,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from '@/lib/supabase';

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

  // Only say the AI runs on Azure when the server is actually configured that way.
  const [aiOnAzure, setAiOnAzure] = useState(false);
  useEffect(() => {
    fetch('/api/settings/gemini-key')
      .then(r => (r.ok ? r.json() : null))
      .then(d => setAiOnAzure(d?.provider === 'azure'))
      .catch(() => {});
  }, []);

  const scrollToSignIn = () => {
    setPortalMode('individual');
    setTimeout(() => document.getElementById('sign-in')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [oauthPending, setOauthPending] = useState<OAuthProvider | null>(null);

  const handleOAuth = async (provider: OAuthProvider) => {
    setPasswordError(null);
    setOauthPending(provider);
    try {
      // Read the calendar automatically once the user comes back signed in.
      sessionStorage.setItem('baalance_pending_calendar_sync', provider);
    } catch (_) {}
    const result = await signInWithProvider(provider);
    if (!result.success) {
      setOauthPending(null);
      setPasswordError(result.error || 'Could not start sign-in.');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
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
    setIsSubmitting(true);
    setNotice(null);
    try {
      if (isNew) {
        const result = await signUpWithEmailPassword(userEmail, password, userName);
        if (!result.ok) {
          setPasswordError(result.error);
          return;
        }
        if (result.needsConfirmation) {
          setNotice(`We sent a confirmation link to ${userEmail}. Open it, then sign in here.`);
          setActiveTab('signin');
          setPassword('');
          setConfirmPassword('');
          return;
        }
      } else {
        const result = await signInWithEmailPassword(userEmail, password);
        if (!result.ok) {
          setPasswordError(result.error);
          return;
        }
      }
      onAuthenticate({ name: userName, email: userEmail.toLowerCase(), isNewUser: isNew });
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen bg-[#F6F2EC] flex flex-col justify-between p-4 sm:p-8 selection:bg-[#0D4F59] selection:text-white font-sans">
      {/* Top Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <BaalanceLogo size="sm" showTagline={false} animated={true} />

        <div className="flex items-center gap-2">
          {portalMode === 'individual' ? (
            <>
              <button
                type="button"
                onClick={scrollToSignIn}
                className="hidden sm:block px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={onStartDemo}
                className="px-4 py-1.5 rounded-full bg-[#0D4F59] hover:bg-[#0B434B] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
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
                <User className="w-3 h-3 text-[#0D4F59]" />
                <span>For you</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenEnterprise?.('apollo-health')}
                className="px-4 py-1.5 rounded-full bg-[#0D4F59] hover:bg-[#0B434B] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Open hospital sample</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-4xl mx-auto w-full py-6 sm:py-10 space-y-6 text-center">
        {/* Hero: the headline, the two ways in, then the science told once */}
        <div className="max-w-3xl mx-auto space-y-5">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Your next stress test is <span className="text-[#BF6F4E]">a haircut.</span>
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={onStartDemo}
              className="px-5 py-3 rounded-xl bg-[#0D4F59] hover:bg-[#0B434B] text-white font-extrabold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Try the demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('azure')}
              disabled={oauthPending !== null}
              className="px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 21 21"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
              <span>{oauthPending === 'azure' ? 'Opening Microsoft…' : 'Continue with Microsoft'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-500">No account needed for the demo. Research stage, not a diagnosis.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <HairScienceExplainer />
        </div>

        <p className="text-xs font-medium text-slate-500">
          Pilot planned with 150 resident doctors at AIIMS New Delhi
          {aiOnAzure ? ' · AI on Microsoft Azure' : ''}
        </p>

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
            <User className={`w-3.5 h-3.5 ${portalMode === 'individual' ? 'text-[#0D4F59]' : 'text-slate-400'}`} />
            <span>For you</span>
          </button>

          <button
            type="button"
            onClick={() => setPortalMode('enterprise')}
            className={`px-5 sm:px-7 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              portalMode === 'enterprise'
                ? 'bg-[#0D4F59] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${portalMode === 'enterprise' ? 'text-white' : 'text-slate-400'}`} />
            <span>For teams</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: INDIVIDUAL PORTAL                                */}
        {/* ======================================================== */}
        {portalMode === 'individual' && (
          <div id="sign-in" className="max-w-md mx-auto text-left animate-in fade-in duration-150">
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
                    Sign in
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
                    Create account
                  </button>
                </div>

                <h3 className="text-base font-bold text-[#000000]">
                  {activeTab === 'signin' ? 'Welcome back' : 'Create your account'}
                </h3>
                <p className="text-xs text-[#5F6368] mt-0.5">
                  {activeTab === 'signin'
                    ? 'See your hair results and calendar analysis.'
                    : 'Save your results and connect your calendar.'}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOAuth('azure')}
                  disabled={oauthPending !== null}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 21 21"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
                  <span>{oauthPending === 'azure' ? 'Opening Microsoft…' : 'Continue with Microsoft'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={oauthPending !== null}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
                  <span>{oauthPending === 'google' ? 'Opening Google…' : 'Continue with Google'}</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center leading-snug">
                  Microsoft sign-in also connects your Outlook and Teams calendar. With Google you can connect your calendar after signing in. You approve each change before anything moves.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or use email</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              </div>

              <form onSubmit={handleAuthSubmit} className="mt-3 space-y-3">
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
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D4F59] focus:outline-none bg-white text-black"
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
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D4F59] focus:outline-none bg-white text-black"
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
                      className="w-full pl-8 pr-9 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D4F59] focus:outline-none bg-white text-black"
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
                        className="w-full pl-8 pr-9 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#0D4F59] focus:outline-none bg-white text-black"
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

                {notice && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100" role="status">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{notice}</span>
                  </div>
                )}

                {passwordError && (
                  <div role="alert" className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0D4F59] hover:bg-blue-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer mt-2 disabled:opacity-60"
                >
                  <span>{isSubmitting ? 'Please wait…' : activeTab === 'signin' ? 'Sign in' : 'Create account'}</span>
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
          <div className="max-w-3xl mx-auto text-left space-y-5 animate-in fade-in duration-150">
            <div className="bg-[#0D4F59] text-white rounded-3xl p-6 sm:p-8 shadow-card">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#F0C9B5]">For hospitals, colleges and companies</div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">See burnout coming, team by team.</h2>
              <p className="text-sm text-white/80 mt-2 max-w-xl">
                An anonymous stress map of your organisation, built from hair cortisol. Employers see team averages only, never an
                individual result.
              </p>

              <form onSubmit={handleEnterpriseDomainSubmit} className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg">
                <label htmlFor="team-email" className="sr-only">Work or university email</label>
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-white/60 absolute left-3.5 top-3" />
                  <input
                    id="team-email"
                    type="email"
                    required
                    value={institutionEmail}
                    onChange={e => {
                      setInstitutionEmail(e.target.value);
                      setEnterpriseError(null);
                    }}
                    placeholder="name@yourhospital.org"
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-white/25 bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-white/60 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#FBF7F2] text-[#0D4F59] text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                >
                  <span>Open your workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
              {enterpriseError && <p className="text-xs text-rose-200 mt-1.5 font-medium">{enterpriseError}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/75">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Groups of 5 or more only
                </span>
                <span>No individual scores shown to leadership</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2.5 px-1">Or explore a sample organisation</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'apollo-health', icon: Stethoscope, tag: 'Hospital', name: 'Sunrise Multispeciality Hospital', text: 'ICU, emergency medicine, surgery and resident shifts.' },
                  { id: 'st-jude-academy', icon: GraduationCap, tag: 'School', name: 'Greenfield Public School', text: 'Grades 9 to 12, exam pressure. Parent consent required.' },
                  { id: 'nexus-tech', icon: Building2, tag: 'Company', name: 'Nimbus Tech', text: 'Engineering on-call load and late meetings across three cities.' },
                ].map(org => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => onOpenEnterprise?.(org.id)}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 text-left shadow-card hover:shadow-cardHover hover:border-[#0D4F59] transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0D4F59]/10 text-[#0D4F59] flex items-center justify-center">
                          <org.icon className="w-4 h-4" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{org.tag}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">{org.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{org.text}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0D4F59]">
                      <span>Open sample</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Social Proof & Origin Footer */}
      <footer className="w-full text-center py-4 border-t border-slate-200/80">
        <p className="text-xs font-medium text-slate-500">
          Built by a final-year medical student at <span className="font-semibold text-slate-700">AIIMS New Delhi</span>
          {' · '}
          <button type="button" onClick={() => openHelpPanel('helplines')} className="font-semibold text-rose-700 underline cursor-pointer">
            Need help now?
          </button>
          {' · '}
          <a href="/privacy" className="font-semibold text-slate-600 underline">Privacy</a>
          {' · '}
          <a href="/terms" className="font-semibold text-slate-600 underline">Terms</a>
        </p>
      </footer>
    </div>
  );
};
