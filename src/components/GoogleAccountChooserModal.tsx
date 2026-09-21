'use client';

import React, { useState } from 'react';
import { User, X, ChevronDown, Key, AlertCircle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { signInWithGoogle, getEffectiveSupabaseAnonKey } from '@/lib/supabase';

export interface GoogleAccount {
  name: string;
  email: string;
  avatarText?: string;
  avatarBg?: string;
  avatarUrl?: string;
  isSignedOut?: boolean;
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { name: string; email: string }) => void;
  targetDomain?: string;
  googleAuthError?: string | null;
}

const PRESET_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'PARUCHURI VENKATA SAI',
    email: 'paruchuri.3833@aiims.edu',
    avatarText: 'P',
    avatarBg: 'bg-slate-700',
  },
  {
    name: 'PARUCHURI SAI AMITH',
    email: 'p.v.saiamith@gmail.com',
    avatarText: 'P',
    avatarBg: 'bg-emerald-700',
  },
  {
    name: 'Amith Paruchuri',
    email: 'choticopy33@gmail.com',
    avatarText: 'A',
    avatarBg: 'bg-[#5B89A6]',
  },
];

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  targetDomain = 'nyxivqlpikoffdopfmei.supabase.co',
  googleAuthError,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isRetryingNative, setIsRetryingNative] = useState(false);
  const [nativeError, setNativeError] = useState<string | null>(googleAuthError || null);

  // Supabase Anon Key configuration helper
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [anonKeyInput, setAnonKeyInput] = useState('');
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleAccountClick = (account: GoogleAccount) => {
    setSelectedEmail(account.email);
    setIsLoading(true);

    setTimeout(() => {
      onSelectAccount({
        name: account.name,
        email: account.email,
      });
      setIsLoading(false);
      onClose();
    }, 500);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      onSelectAccount({
        name: customName.trim() || customEmail.split('@')[0],
        email: customEmail.trim(),
      });
      setIsLoading(false);
      onClose();
    }, 500);
  };

  const handleRetryNativeOAuth = async () => {
    setIsRetryingNative(true);
    setNativeError(null);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setNativeError(res.error || 'Failed to start Google OAuth redirect.');
      }
    } catch (err: any) {
      setNativeError(err?.message || 'Google OAuth error occurred.');
    } finally {
      setIsRetryingNative(false);
    }
  };

  const handleSaveAnonKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = anonKeyInput.trim();
    if (cleanKey && typeof window !== 'undefined') {
      localStorage.setItem('baalance_supabase_anon_key', cleanKey);
      setKeySavedMessage(true);
      setTimeout(() => {
        setKeySavedMessage(false);
        setShowKeyConfig(false);
        handleRetryNativeOAuth();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-[560px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Progress Loading Bar (if authenticating) */}
        {(isLoading || isRetryingNative) && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 overflow-hidden z-20">
            <div className="h-full bg-[#1a73e8] w-1/3 animate-pulse" style={{ animationDuration: '0.8s' }} />
          </div>
        )}

        {/* Modal Top Bar */}
        <div className="px-7 pt-6 pb-2 flex items-center justify-between shrink-0">
          {/* Google G Logo & Label */}
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.41 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.59 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Google Workspace Authentication
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="px-7 pt-2 pb-6 overflow-y-auto">
          {/* Informative Provider Notice if native redirect was pending configuration */}
          {nativeError && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Supabase Google Provider Notice:</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {nativeError.includes('Unsupported provider') || nativeError.includes('provider is not enabled')
                      ? 'Google OAuth provider is not toggled ON in your Supabase dashboard yet. Go to Supabase → Authentication → Providers → Google to enable it with your Google Client ID & Secret.'
                      : nativeError}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRetryNativeOAuth}
                  disabled={isRetryingNative}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${isRetryingNative ? 'animate-spin' : ''}`} />
                  <span>Retry Native Google Redirect</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-medium rounded-lg text-[11px] flex items-center gap-1"
                >
                  <Key className="w-3 h-3 text-amber-700" />
                  <span>Configure Anon Key</span>
                </button>
              </div>
            </div>
          )}

          {/* Optional inline Anon Key config */}
          {showKeyConfig && (
            <form onSubmit={handleSaveAnonKey} className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Supabase Anon Public Key (starts with eyJ...):
              </label>
              <input
                type="text"
                required
                value={anonKeyInput}
                onChange={(e) => setAnonKeyInput(e.target.value)}
                placeholder="Paste your NEXT_PUBLIC_SUPABASE_ANON_KEY"
                className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {keySavedMessage ? '✓ Key saved to browser cache!' : 'Will persist for your current browser session'}
                </span>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          )}

          <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
            Choose an account
          </h2>
          <p className="text-xs sm:text-sm text-[#202124] mt-1.5 font-normal">
            to continue to{' '}
            <span className="text-[#0b57d0] hover:underline font-medium">
              BAALANCE ({targetDomain})
            </span>
          </p>

          {/* Account Selection List */}
          <div className="mt-5 border-t border-slate-200/80 divide-y divide-slate-200/80">
            {!isCustomMode ? (
              <>
                {PRESET_ACCOUNTS.map((account) => {
                  const isThisLoading = isLoading && selectedEmail === account.email;
                  return (
                    <button
                      key={account.email}
                      type="button"
                      disabled={isLoading || isRetryingNative}
                      onClick={() => handleAccountClick(account)}
                      className={`w-full text-left py-3 px-2.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors rounded-xl ${
                        isThisLoading ? 'bg-blue-50/60 ring-1 ring-blue-300' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Circular Avatar */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0 shadow-xs ${
                            account.avatarBg || 'bg-slate-600'
                          }`}
                        >
                          {account.avatarText || account.name.charAt(0)}
                        </div>

                        {/* Account Name & Email */}
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-[#202124] truncate">
                            {account.name}
                          </div>
                          <div className="text-[11px] sm:text-xs text-slate-500 truncate">
                            {account.email}
                          </div>
                        </div>
                      </div>

                      {/* Right Indicator */}
                      <div className="shrink-0 ml-3">
                        {isThisLoading ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="text-[11px] text-blue-600 font-semibold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                            1-Click Sign In
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Option: Use another account */}
                <button
                  type="button"
                  disabled={isLoading || isRetryingNative}
                  onClick={() => setIsCustomMode(true)}
                  className="w-full text-left py-3 px-2.5 flex items-center gap-3.5 hover:bg-[#F8F9FA] transition-colors rounded-xl"
                >
                  <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#202124]">
                    Use another Google account
                  </span>
                </button>
              </>
            ) : (
              /* Custom Account Input Form */
              <form onSubmit={handleCustomSubmit} className="pt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Account Email
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. name@gmail.com"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Dr. Amith Paruchuri"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="text-xs text-slate-600 hover:text-black"
                  >
                    ← Back to account list
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 rounded-xl bg-[#1a73e8] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                  >
                    {isLoading ? 'Connecting...' : 'Sign In with Google'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer (Matches Google Auth Footer) */}
        <div className="px-7 py-3 bg-[#F8F9FA] border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-600 shrink-0">
          <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800">
            <span>English (United States)</span>
            <ChevronDown className="w-3 h-3" />
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="cursor-pointer hover:underline">Help</span>
            <span className="cursor-pointer hover:underline">Privacy</span>
            <span className="cursor-pointer hover:underline">Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
