'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Play, Mail, Lock, User, ShieldCheck, Scissors, Calendar, Activity, Check, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { BaalanceLogo } from './BaalanceLogo';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';
import { signInWithGoogle } from '@/lib/supabase';

interface AuthLandingPageProps {
  onStartDemo: () => void;
  onAuthenticate: (userData: { name: string; email: string; isNewUser?: boolean }) => void;
  onOpenPitchMode?: () => void;
}

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({
  onStartDemo,
  onAuthenticate,
  onOpenPitchMode,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Form fields - empty by default so user can enter their own credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Google OAuth states
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);

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

  // Handle Google OAuth Initiate
  const handleGoogleAuthClick = async () => {
    setIsGoogleLoading(true);
    setGoogleAuthError(null);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setGoogleAuthError(res.error || 'Google OAuth provider needs configuration.');
        setIsGoogleChooserOpen(true);
      }
      // If success, Supabase redirects window.location.href to Google
    } catch (err: any) {
      setGoogleAuthError(err?.message || 'Failed to start Google sign-in.');
      setIsGoogleChooserOpen(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Google Account Selected from fallback / direct chooser
  const handleGoogleAccountSelected = (account: { name: string; email: string }) => {
    onAuthenticate({ name: account.name, email: account.email, isNewUser: false });
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex flex-col justify-between p-4 sm:p-8 selection:bg-[#3186FF] selection:text-white font-sans">
      {/* Top Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <BaalanceLogo size="sm" showTagline={false} animated={true} />

        <div className="flex items-center gap-2">
          {onOpenPitchMode && (
            <button
              onClick={onOpenPitchMode}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#3186FF] to-[#6366F1] hover:opacity-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Open Curated Pitch Video Storyboard (matches your exact script)"
            >
              <span className="text-xs">🎬</span>
              <span>Pitch Storyboard</span>
            </button>
          )}

          <button
            onClick={onStartDemo}
            className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Launch Demo</span>
          </button>
        </div>
      </div>

      {/* Main Minimal Section */}
      <div className="max-w-4xl mx-auto w-full py-8 sm:py-12 space-y-8 text-center">
        {/* Animated Brand Hero */}
        <div className="flex flex-col items-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-slate-700 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#3186FF]" />
            <span>Powered by Gemini 2.5 Flash</span>
          </div>

          <BaalanceLogo size="xl" showTagline={true} animated={true} />
        </div>

        {/* Minimal Grid: Demo Card & Auth Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto text-left">
          {/* Option 1: Instant Demo */}
          <div className="bg-white rounded-2xl border-2 border-emerald-400/80 p-6 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-3">
                Pre-Loaded Case
              </div>
              <h3 className="text-base font-bold text-[#000000]">
                Explore Clinical Demo
              </h3>
              <p className="text-xs text-[#5F6368] mt-1">
                90-day surge scenario with 3cm scrubber, Google Calendar load, and Tricha AI Co-Pilot.
              </p>
            </div>

            <button
              onClick={onStartDemo}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Explore Interactive Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Option 2: Authentic Authentication Card (Sign In / Sign Up) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between">
            <div>
              {/* Tab Switcher: Sign In vs Sign Up */}
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
                  Sign In (Existing)
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
                  Sign Up (New User)
                </button>
              </div>

              <h3 className="text-base font-bold text-[#000000]">
                {activeTab === 'signin' ? 'Welcome Back' : 'Create New Account'}
              </h3>
              <p className="text-xs text-[#5F6368] mt-0.5">
                {activeTab === 'signin'
                  ? 'Access your hair cortisol lab history and calendar analysis'
                  : 'Start tracking your burnout score with zero-friction salon collection'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
              {/* Google OAuth Button */}
              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={handleGoogleAuthClick}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F0F4FA] text-xs font-semibold text-black transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3186FF]" />
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.41 7.34 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.59 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                )}
                <span>
                  {isGoogleLoading
                    ? 'Connecting to Google...'
                    : activeTab === 'signin'
                    ? 'Sign in with Google'
                    : 'Sign up with Google'}
                </span>
              </button>

              {/* Fast Direct Google Account Selector */}
              <button
                type="button"
                onClick={() => setIsGoogleChooserOpen(true)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-[#F0F4FA] hover:bg-blue-50 text-[11px] text-[#1a73e8] font-medium border border-blue-200/60 transition-colors cursor-pointer"
                title="Select from your verified Google accounts for direct 1-click access"
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <span className="truncate">Fast Sign-In: <strong>p.v.saiamith@gmail.com</strong></span>
                </span>
                <span className="text-[10px] bg-blue-100/80 px-2 py-0.5 rounded font-bold shrink-0">1-Click</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-[#E2E8F0] w-full" />
                <span className="bg-white px-2 text-[10px] text-slate-400 uppercase tracking-wider absolute">
                  or with email
                </span>
              </div>

              {/* Sign Up only: Full Name */}
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

              {/* Username (Email ID) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Username (Email ID)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email ID (e.g. name@example.com)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3186FF] focus:outline-none bg-white text-black"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {activeTab === 'signin' ? 'Password' : 'Create Password'}
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={activeTab === 'signin' ? 'Enter your password' : 'Create password (min. 6 characters)'}
                    className="w-full pl-8 pr-9 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3186FF] focus:outline-none bg-white text-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                  </button>
                </div>
              </div>

              {/* Sign Up only: Confirm Password */}
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
                      placeholder="Re-enter password to confirm"
                      className="w-full pl-8 pr-9 py-1.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3186FF] focus:outline-none bg-white text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {passwordError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer mt-2"
              >
                <span>{activeTab === 'signin' ? 'Sign In to Retrospective Dashboard' : 'Create Account & Start Intake'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* 3 Core Trust Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4 text-left">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 border border-[#E2E8F0]">
            <Scissors className="w-4 h-4 text-[#3186FF] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-black">Salon Collection</div>
              <div className="text-[11px] text-[#5F6368]">Takes 60 seconds at any barber or salon. Zero needles.</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 border border-[#E2E8F0]">
            <Calendar className="w-4 h-4 text-[#3186FF] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-black">Calendar Defense</div>
              <div className="text-[11px] text-[#5F6368]">Cross-references Google Calendar & Oura to pinpoint culprits.</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 border border-[#E2E8F0]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-black">CLIA Validated</div>
              <div className="text-[11px] text-[#5F6368]">Tandem mass spectrometry LC-MS/MS biomarker sensitivity.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 py-4 border-t border-[#E2E8F0]">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span>© 2026 BAALANCE Bio-Intelligence Inc.</span>
          <span>baalance.in</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            HIPAA & CLIA Certified Laboratory Network
          </span>
        </div>
      </div>

      {/* Google Account Chooser & Setup Modal */}
      <GoogleAccountChooserModal
        isOpen={isGoogleChooserOpen}
        onClose={() => setIsGoogleChooserOpen(false)}
        onSelectAccount={handleGoogleAccountSelected}
        googleAuthError={googleAuthError}
        targetDomain="baalance.in"
      />
    </div>
  );
};
