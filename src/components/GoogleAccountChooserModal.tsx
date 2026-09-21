'use client';

import React, { useState } from 'react';
import { User, X, ChevronDown, CheckCircle2 } from 'lucide-react';

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
}

const PRESET_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'PARUCHURI SAI AMITH',
    email: 'p.v.saiamith@gmail.com',
    avatarText: 'P',
    avatarBg: 'bg-emerald-700',
  },
  {
    name: 'PARUCHURI VENKATA SAI',
    email: 'paruchuri.3833@aiims.edu',
    avatarText: 'P',
    avatarBg: 'bg-slate-700',
    isSignedOut: true,
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
}) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

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
    }, 650);
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
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-[560px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Top Progress Loading Bar (if authenticating) */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 overflow-hidden z-20">
            <div className="h-full bg-[#1a73e8] w-1/3 animate-pulse" style={{ animationDuration: '0.8s' }} />
          </div>
        )}

        {/* Modal Top Bar */}
        <div className="px-7 pt-6 pb-2 flex items-center justify-between">
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
              Sign in with Google
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

        {/* Main Content Area */}
        <div className="px-7 pt-4 pb-6">
          <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
            Choose an account
          </h2>
          <p className="text-xs sm:text-sm text-[#202124] mt-1.5 font-normal">
            to continue to{' '}
            <span className="text-[#0b57d0] hover:underline font-medium cursor-pointer">
              {targetDomain}
            </span>
          </p>

          {/* Account Selection List */}
          <div className="mt-6 border-t border-slate-200/80 divide-y divide-slate-200/80">
            {!isCustomMode ? (
              <>
                {PRESET_ACCOUNTS.map((account) => {
                  const isThisLoading = isLoading && selectedEmail === account.email;
                  return (
                    <button
                      key={account.email}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleAccountClick(account)}
                      className={`w-full text-left py-3.5 px-2.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors rounded-xl ${
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

                      {/* Right Indicator: Signed Out or Spinner */}
                      <div className="shrink-0 ml-3">
                        {isThisLoading ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : account.isSignedOut ? (
                          <span className="text-[11px] text-slate-500 font-normal">
                            Signed out
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}

                {/* Option: Use another account */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setIsCustomMode(true)}
                  className="w-full text-left py-3.5 px-2.5 flex items-center gap-3.5 hover:bg-[#F8F9FA] transition-colors rounded-xl"
                >
                  <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#202124]">
                    Use another account
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
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Full Name"
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
                    {isLoading ? 'Connecting...' : 'Next'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer (Matches Google Auth Footer) */}
        <div className="px-7 py-3 bg-[#F8F9FA] border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-600">
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
