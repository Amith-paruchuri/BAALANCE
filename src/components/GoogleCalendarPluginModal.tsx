'use client';

import React, { useState, useRef } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Moon,
  Plane,
  X,
  RefreshCw,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Upload,
  FileText,
  Search,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { WeeklyTelemetry } from '@/lib/types';
import { WEEKLY_12_WEEK_TELEMETRY } from '@/lib/mockData';
import { parseIcsContent } from '@/lib/icalParser';

interface GoogleCalendarPluginModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onApplyTelemetry?: (
    newTelemetry: WeeklyTelemetry[],
    providerEmail?: string,
    icalUrl?: string,
    events?: any[]
  ) => void;
}

export const GoogleCalendarPluginModal: React.FC<GoogleCalendarPluginModalProps> = ({
  isOpen,
  onClose,
  userEmail = '',
  onApplyTelemetry,
}) => {
  const [icalUrlInput, setIcalUrlInput] = useState('');
  const [stage, setStage] = useState<'idle' | 'verifying' | 'verified' | 'demo_success' | 'error'>('idle');
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSecretHelp, setShowSecretHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLoadDemoTelemetry = () => {
    if (onApplyTelemetry) {
      onApplyTelemetry(WEEKLY_12_WEEK_TELEMETRY, 'Demo Benchmark');
    }
    setVerifiedData({
      source: 'Demo',
      email: 'Demo Benchmark',
      totalEvents: 148,
      totalMeetingHours: 396,
      eveningCalls: 23,
      flights: 4,
    });
    setStage('demo_success');
  };

  const handleSyncIcalUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = icalUrlInput.trim();
    if (!cleanUrl) return;

    if (cleanUrl.includes('@') && !cleanUrl.startsWith('http')) {
      setErrorMessage(`"${cleanUrl}" is an email address. Live sync requires the "Secret address in iCal format" from Google Calendar Settings, or upload your .ics export directly below.`);
      setStage('error');
      return;
    }

    setStage('verifying');
    setErrorMessage('');

    const effectiveEmail = (userEmail && !userEmail.includes('Demo'))
      ? userEmail
      : (typeof window !== 'undefined' ? localStorage.getItem('baalance_active_user_email') || '' : '');

    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icalUrl: cleanUrl, email: effectiveEmail }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to sync calendar');
      }

      setVerifiedData(data);
      setStage('verified');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sync calendar');
      setStage('error');
    }
  };

  const processFile = async (file: File) => {
    setStage('verifying');
    setErrorMessage('');

    try {
      const text = await file.text();
      const parsed = parseIcsContent(text);

      if (parsed.totalEvents > 0) {
        setVerifiedData({
          provider: 'Exported .ics File',
          email: file.name,
          totalEvents: parsed.totalEvents,
          totalMeetingHours: parsed.totalMeetingHours,
          flights: parsed.totalFlights,
          curfewBreachPct: parsed.curfewBreachPct,
          busiestDay: parsed.busiestDay,
          avgLateTimeRange: parsed.avgLateTimeRange,
          weeklyTelemetry: parsed.weeklyTelemetry,
          events: parsed.events,
        });
        setStage('verified');
      } else {
        throw new Error('No events found in this .ics file');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse file');
      setStage('error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.ics') || file.type.includes('calendar'))) {
      processFile(file);
    }
  };

  const handleApplyToDashboard = () => {
    if (verifiedData && onApplyTelemetry && verifiedData.weeklyTelemetry) {
      onApplyTelemetry(
        verifiedData.weeklyTelemetry,
        verifiedData.email || userEmail,
        verifiedData.icalUrl || icalUrlInput.trim(),
        verifiedData.events
      );
    }
    onClose();
  };

  const isInputAnEmail = icalUrlInput.trim().includes('@') && !icalUrlInput.trim().startsWith('http');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transition-all">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3186FF]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black">Google Calendar</h3>
              <p className="text-[11px] text-slate-500">Sync meeting load & curfew calls</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* STAGE: IDLE */}
          {stage === 'idle' && (
            <div className="space-y-4">
              {/* Option 1: Direct .ics Upload (Works 100% for personal & university/hospital accounts) */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2 ${
                  isDragOver
                    ? 'border-[#3186FF] bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#3186FF] mx-auto shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-black">Upload .ics Calendar File</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Click to browse or drop file here (works with all accounts including @aiims.edu)
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ics,text/calendar"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-[#E2E8F0] w-full" />
                <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  or sync live link
                </span>
                <div className="border-t border-[#E2E8F0] w-full" />
              </div>

              <div className="p-4 rounded-2xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <Lock className="w-3.5 h-3.5 text-[#3186FF]" />
                    <span>Secret address in iCal format</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSecretHelp(!showSecretHelp)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#3186FF] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white text-[11px] font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ring-2 ring-blue-400/30"
                  >
                    <Search className="w-3.5 h-3.5 text-white" />
                    <span>{showSecretHelp ? '✕ HIDE GUIDE' : 'FIND MY SECRET LINK'}</span>
                  </button>
                </div>

                {showSecretHelp && (
                  <div className="p-4 rounded-2xl bg-white border-2 border-blue-200 text-xs text-slate-700 space-y-3.5 animate-fade-in shadow-md">
                    {/* Direct Link Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 border border-blue-200">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#3186FF]" />
                          <span>Direct Google Calendar Shortcut</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Click to open your Google Calendar Settings directly in a new tab:
                        </p>
                      </div>

                      <a
                        href="https://calendar.google.com/calendar/u/0/r/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 shrink-0 group active:scale-95 cursor-pointer ring-2 ring-blue-300/40"
                      >
                        <span>Open Calendar Settings</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>

                    {/* 3 Step Visual Cards */}
                    <div className="space-y-2">
                      <p className="font-bold text-black text-xs">Follow these 3 quick steps to copy your private link:</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px]">1</div>
                          <p className="text-[11px] font-bold text-slate-900">Select Calendar</p>
                          <p className="text-[10px] text-slate-600 leading-snug">
                            On left sidebar under <strong>&ldquo;Settings for my calendars&rdquo;</strong>, click your main calendar.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px]">2</div>
                          <p className="text-[11px] font-bold text-slate-900">Integrate Calendar</p>
                          <p className="text-[10px] text-slate-600 leading-snug">
                            Click <strong>&ldquo;Integrate calendar&rdquo;</strong> in the left sub-menu.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                          <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">3</div>
                          <p className="text-[11px] font-bold text-slate-900">Copy Secret Address</p>
                          <p className="text-[10px] text-slate-600 leading-snug">
                            Scroll to <strong>&ldquo;Secret address in iCal format&rdquo;</strong>, click the <strong>Copy icon</strong>, and paste it below.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Format hint & Privacy notice */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600 overflow-hidden">
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">Format:</span>
                        <span className="font-mono text-[10px] text-slate-700 truncate">https://calendar.google.com/calendar/ical/.../basic.ics</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-amber-700">⚠️ Do not copy Public URL</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                          <Lock className="w-3 h-3 inline" /> 256-bit Encrypted
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSyncIcalUrl} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={icalUrlInput}
                    onChange={e => setIcalUrlInput(e.target.value)}
                    placeholder="Paste Secret iCal URL or Secret Code..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#3186FF]"
                  />
                  <button
                    type="submit"
                    disabled={!icalUrlInput.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    Sync Live
                  </button>
                </form>

                {isInputAnEmail && (
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                    You typed an email. Live sync requires the secret iCal link from Google Calendar Settings &gt; Integrate Calendar, or click <strong>Upload .ics File</strong> above.
                  </div>
                )}
              </div>

              {/* Option 3: Demo Data */}
              <div className="p-3 rounded-2xl border border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-700">Preview with Demo Data</span>
                </div>

                <button
                  type="button"
                  onClick={handleLoadDemoTelemetry}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  Load Demo
                </button>
              </div>
            </div>
          )}

          {/* STAGE: VERIFYING */}
          {stage === 'verifying' && (
            <div className="py-8 space-y-3 text-center">
              <RefreshCw className="w-8 h-8 text-[#3186FF] animate-spin mx-auto" />
              <p className="text-xs font-bold text-black">Parsing calendar telemetry...</p>
            </div>
          )}

          {/* STAGE: DEMO SUCCESS */}
          {stage === 'demo_success' && verifiedData && (
            <div className="py-2 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Demo Calendar Telemetry Ingested</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Total Load</div>
                  <div className="text-base font-bold text-black font-mono mt-0.5">{verifiedData.totalMeetingHours} hrs</div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                  <div className="text-[10px] text-rose-700">Post-7 PM</div>
                  <div className="text-base font-bold text-rose-700 font-mono mt-0.5">{verifiedData.eveningCalls} calls</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Flights</div>
                  <div className="text-base font-bold text-black font-mono mt-0.5">{verifiedData.flights}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STAGE: VERIFIED REAL CALENDAR */}
          {stage === 'verified' && verifiedData && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Calendar Ingested ({verifiedData.totalEvents} Events)</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-700 truncate max-w-[150px]">
                  {verifiedData.email || 'Verified'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Total Load</div>
                  <div className="text-base font-bold text-black font-mono mt-0.5">{verifiedData.totalMeetingHours} hrs</div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                  <div className="text-[10px] text-rose-700">Post-7 PM</div>
                  <div className="text-base font-bold text-rose-700 font-mono mt-0.5">{verifiedData.eveningCalls} calls</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">{verifiedData.flights > 0 ? 'Flights' : 'Curfew Ratio'}</div>
                  <div className="text-base font-bold text-black font-mono mt-0.5">
                    {verifiedData.flights > 0 ? `${verifiedData.flights}` : `${verifiedData.curfewBreachPct || Math.round(((verifiedData.eveningCalls || 0) / (verifiedData.totalEvents || 1)) * 100)}%`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStage('idle')}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-black cursor-pointer"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleApplyToDashboard}
                  className="flex-1 py-2 px-4 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Apply Telemetry to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE: ERROR */}
          {stage === 'error' && (
            <div className="py-4 space-y-3 text-center">
              <AlertCircle className="w-7 h-7 text-rose-600 mx-auto" />
              <p className="text-xs text-rose-600 font-medium px-4">{errorMessage}</p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStage('idle')}
                  className="py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={handleLoadDemoTelemetry}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Load Demo Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
