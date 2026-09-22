'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Play, Mail, Lock, User, Activity, Check, AlertCircle, Eye, EyeOff, Calendar } from 'lucide-react';
import { BaalanceLogo } from './BaalanceLogo';

interface AuthLandingPageProps {
  onStartDemo: () => void;
  onAuthenticate: (userData: { name: string; email: string; isNewUser?: boolean }) => void;
  onTryGoogleCalendar?: () => void;
  onOpenPitchMode?: () => void;
}

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({
  onStartDemo,
  onAuthenticate,
  onTryGoogleCalendar,
  onOpenPitchMode,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const authCardRef = React.useRef<HTMLDivElement>(null);

  // Switch to Sign Up mode and focus the name input to drive new account creation
  const switchToSignUp = () => {
    setActiveTab('signup');
    setPasswordError(null);
    setTimeout(() => {
      nameInputRef.current?.focus();
      authCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
    if (onTryGoogleCalendar) {
      onTryGoogleCalendar();
    }
  };
  
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

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex flex-col justify-between p-4 sm:p-8 selection:bg-[#3186FF] selection:text-white font-sans">
      {/* Top Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-3">
        <BaalanceLogo size="sm" showTagline={false} animated={true} />

        <div className="flex items-center gap-2">
          <button
            onClick={switchToSignUp}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#3186FF] to-[#4F46E5] hover:opacity-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Create an account to connect your personal Google Calendar"
          >
            <Calendar className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Try Integrating Your Google Calendar</span>
            <span className="sm:hidden">Integrate Calendar</span>
          </button>

          <button
            onClick={onStartDemo}
            className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
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
            <span>Powered by Gemini 3.6 Flash</span>
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

              <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-[11px] text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-[#3186FF] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700">Want to see your real schedule? </span>
                  <button
                    type="button"
                    onClick={switchToSignUp}
                    className="font-bold text-[#3186FF] hover:underline cursor-pointer inline"
                  >
                    Create an account to integrate your Google Calendar &rarr;
                  </button>
                </div>
              </div>
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
          <div ref={authCardRef} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between">
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

              {/* Callout: Try Integrating Your Google Calendar */}
              {activeTab === 'signin' ? (
                <div
                  onClick={switchToSignUp}
                  className="mt-3.5 p-2.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/90 flex items-center justify-between gap-2 cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all group"
                  title="Create an account to connect your personal Google Calendar"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Calendar className="w-4 h-4 text-[#3186FF]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-slate-800 leading-tight">
                        Try integrating your own Google Calendar
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        Curious about your real cortisol? Sign up to link your calendar
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#3186FF] group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-0.5">
                    <span>Sign Up</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              ) : (
                <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/40 border border-blue-200/80 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-[#3186FF]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      Curious how your real schedule drives your cortisol?
                    </p>
                    <p className="text-[11px] text-slate-600 leading-tight mt-1">
                      Create your account below. You will be able to connect your personal Google Calendar during intake to uncover curfew breaches and late-night meeting stress.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">

              {/* Sign Up only: Full Name */}
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      ref={nameInputRef}
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

            {/* Bottom prompt for sign-in tab */}
            {activeTab === 'signin' && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={switchToSignUp}
                  className="w-full text-center text-[11px] text-slate-500 hover:text-[#3186FF] transition-colors cursor-pointer flex items-center justify-center gap-1.5 py-1"
                >
                  <Calendar className="w-3 h-3 text-[#3186FF]" />
                  <span>Curious about your real cortisol? <span className="font-semibold text-[#3186FF] underline underline-offset-2">Create an account to integrate your Google Calendar</span></span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
