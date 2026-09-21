'use client';

import React, { useState } from 'react';
import { Calendar, Activity, Moon, Clock, Plane, HeartPulse, RefreshCw, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { WeeklyTelemetry } from '@/lib/types';

interface SyncIntegrationsPanelProps {
  telemetry: WeeklyTelemetry[];
  onRefreshTelemetry?: () => void;
  onOpenCalendarModal?: () => void;
  verifiedEmail?: string;
  activeSegmentId?: 1 | 2 | 3;
  onSelectSegment?: (id: 1 | 2 | 3) => void;
}

export const SyncIntegrationsPanel: React.FC<SyncIntegrationsPanelProps> = ({
  telemetry,
  onOpenCalendarModal,
  verifiedEmail = 'Verified Google Workspace',
  activeSegmentId,
  onSelectSegment,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<'all' | 1 | 2 | 3>(
    activeSegmentId ? (activeSegmentId as 1 | 2 | 3) : 'all'
  );

  // Sync with external activeSegmentId changes if any
  React.useEffect(() => {
    if (activeSegmentId && activeSegmentId !== selectedMonthFilter) {
      setSelectedMonthFilter(activeSegmentId);
    }
  }, [activeSegmentId]);

  const handleSelectMonth = (filter: 'all' | 1 | 2 | 3) => {
    setSelectedMonthFilter(filter);
    if (filter !== 'all' && onSelectSegment) {
      onSelectSegment(filter);
    }
  };

  // Filter telemetry based on selected month (Month 1 = July W1-W4, Month 2 = August W5-W8, Month 3 = September W9-W12)
  const filteredTelemetry = selectedMonthFilter === 'all'
    ? telemetry
    : telemetry.filter(t => t.month === selectedMonthFilter);

  // Compute aggregates for active filter
  const totalMeetingHours = filteredTelemetry.reduce((sum, item) => sum + item.meetingHours, 0);
  const totalEveningCalls = filteredTelemetry.reduce((sum, item) => sum + item.eveningCalls, 0);
  const totalFlights = filteredTelemetry.reduce((sum, item) => sum + item.flightShifts, 0);

  const avgDeepSleep = filteredTelemetry.length > 0
    ? (filteredTelemetry.reduce((sum, item) => sum + item.deepSleepHours, 0) / filteredTelemetry.length).toFixed(2)
    : '0.00';
  const avgRHR = filteredTelemetry.length > 0
    ? Math.round(filteredTelemetry.reduce((sum, item) => sum + item.restingHeartRate, 0) / filteredTelemetry.length)
    : 0;
  const avgHRV = filteredTelemetry.length > 0
    ? Math.round(filteredTelemetry.reduce((sum, item) => sum + item.hrvRmssd, 0) / filteredTelemetry.length)
    : 0;

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Interactive Month Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white px-4 py-2.5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">Telemetry Window:</span>
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => handleSelectMonth('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedMonthFilter === 'all'
                  ? 'bg-white text-[#3186FF] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              All 90 Days
            </button>
            <button
              onClick={() => handleSelectMonth(1)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedMonthFilter === 1
                  ? 'bg-white text-[#3186FF] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              July (Weeks 1–4)
            </button>
            <button
              onClick={() => handleSelectMonth(2)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedMonthFilter === 2
                  ? 'bg-rose-50 text-rose-700 font-bold shadow-xs border border-rose-200'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              August (Weeks 5–8)
            </button>
            <button
              onClick={() => handleSelectMonth(3)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedMonthFilter === 3
                  ? 'bg-emerald-50 text-emerald-700 font-bold shadow-xs border border-emerald-200'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              September (Weeks 9–12)
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 hidden sm:block">
          {selectedMonthFilter === 'all' && 'Aggregated 12-week workload vs sleep correlation'}
          {selectedMonthFilter === 1 && 'July: Weeks 1–4 (Baseline regulation: 25h meetings, 1 call/wk)'}
          {selectedMonthFilter === 2 && 'August: Weeks 5–8 (Peak crunch: 47.5h meetings, 11 calls >7 PM)'}
          {selectedMonthFilter === 3 && 'September: Weeks 9–12 (Post-surge taper, 4 evening calls/wk)'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Google Calendar Sync Panel */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3186FF]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-black">Google Calendar Telemetry</h3>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-[#5F6368] font-mono mt-0.5 truncate max-w-[200px] sm:max-w-xs">
                {verifiedEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCalendarModal && (
              <button
                type="button"
                onClick={onOpenCalendarModal}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#3186FF] hover:bg-blue-600 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Integrate Demo or Connect Google Calendar"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Integrate Calendar</span>
              </button>
            )}

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="p-1.5 rounded-lg text-[#5F6368] hover:text-black hover:bg-[#F0F4FA] transition-colors"
              title="Refresh Google Calendar"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#3186FF]' : ''}`} />
            </button>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2.5 my-3.5">
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-1 text-[11px] text-[#5F6368] mb-1">
              <Clock className="w-3.5 h-3.5 text-[#3186FF]" />
              <span>Meeting Load</span>
            </div>
            <div className="text-lg font-bold text-black font-mono">
              {Math.round(totalMeetingHours)} <span className="text-xs font-normal text-slate-500">hrs</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200">
            <div className="flex items-center gap-1 text-[11px] text-rose-700 mb-1">
              <Moon className="w-3.5 h-3.5 text-rose-500" />
              <span>Post-7 PM</span>
            </div>
            <div className="text-lg font-bold text-rose-700 font-mono">
              {totalEveningCalls} <span className="text-xs font-normal text-rose-500">calls</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-1 text-[11px] text-[#5F6368] mb-1">
              <Plane className="w-3.5 h-3.5 text-amber-500" />
              <span>Timezone</span>
            </div>
            <div className="text-lg font-bold text-black font-mono">
              {totalFlights} <span className="text-xs font-normal text-slate-500">flights</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E2E8F0]/70 mt-1">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>90-Day Telemetry Synced</span>
          </div>
          {onOpenCalendarModal && (
            <button
              type="button"
              onClick={onOpenCalendarModal}
              className="text-xs font-bold text-[#3186FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Switch / Re-sync Calendar →</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Wearable Biometric Sync Panel */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-black">Wearable Biometrics</h3>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-100">
                  <CheckCircle2 className="w-3 h-3" />
                  Whoop 4.0
                </span>
              </div>
              <p className="text-[11px] text-[#5F6368] font-mono mt-0.5">
                Nocturnal HRV & Sleep Stage
              </p>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-1.5 rounded-lg text-[#5F6368] hover:text-black hover:bg-[#F0F4FA] transition-colors"
            title="Refresh Wearable biometrics"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2.5 my-3.5">
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-1 text-[11px] text-[#5F6368] mb-1">
              <Moon className="w-3.5 h-3.5 text-purple-600" />
              <span>Deep Sleep</span>
            </div>
            <div className="text-lg font-bold text-black font-mono">
              {avgDeepSleep} <span className="text-xs font-normal text-slate-500">hrs</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-1 text-[11px] text-[#5F6368] mb-1">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              <span>Resting HR</span>
            </div>
            <div className="text-lg font-bold text-black font-mono">
              {avgRHR} <span className="text-xs font-normal text-slate-500">bpm</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-1 text-[11px] text-[#5F6368] mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>HRV (rMSSD)</span>
            </div>
            <div className="text-lg font-bold text-black font-mono">
              {avgHRV} <span className="text-xs font-normal text-slate-500">ms</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-[#5F6368]">Continuous Biometrics</span>
          <span className="font-semibold text-rose-600">Floor Deficit: &lt;45m</span>
        </div>
      </div>
    </div>
  </div>
  );
};
