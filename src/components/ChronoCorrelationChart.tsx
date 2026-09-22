'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { WeeklyTelemetry } from '@/lib/types';
import { TrendingUp, Moon, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ChronoCorrelationChartProps {
  telemetry: WeeklyTelemetry[];
  activeSegmentId: 1 | 2 | 3;
  onSelectWeek?: (weekNumber: number) => void;
  onSelectSegment?: (id: 1 | 2 | 3) => void;
  isCalendarConnected?: boolean;
  calendarEmail?: string;
  userRole?: string;
}

export const ChronoCorrelationChart = React.memo<ChronoCorrelationChartProps>(({
  telemetry,
  activeSegmentId,
  onSelectWeek,
  onSelectSegment,
  isCalendarConnected = false,
  calendarEmail,
  userRole,
}) => {
  // Format telemetry so weekLabel is "Week 1", "Week 2", etc.
  const chartData = telemetry.map(item => ({
    ...item,
    fullWeekLabel: `Week ${item.weekNumber}`,
    shortWeekLabel: `Wk ${item.weekNumber}`,
  }));

  const totalMeetingHours = chartData.reduce((sum, d) => sum + (d.meetingHours || 0), 0);
  const augustCortisol = chartData.find(d => d.month === 2 && d.cortisolPgPerMg > 20)?.cortisolPgPerMg ?? 28.4;
  const isDiscordance = isCalendarConnected && totalMeetingHours <= 5 && augustCortisol > 16.0;

  const month1Label = telemetry.find(t => t.month === 1)?.monthLabel || 'July';
  const month2Label = telemetry.find(t => t.month === 2)?.monthLabel || 'August';
  const month3Label = telemetry.find(t => t.month === 3)?.monthLabel || 'September';

  // Dynamic Y-axis ceiling to accommodate peak cortisol (up to 38+ pg/mg) without clipping
  const maxTelemetryCortisol = Math.max(...chartData.map(d => d.cortisolPgPerMg || 0), 28);
  const yAxisMax = Math.max(35, Math.ceil((maxTelemetryCortisol + 4) / 5) * 5);

  // Active segment window (July: W1-W4, August: W5-W8, September: W9-W12)
  const activeWeekStart = activeSegmentId === 1 ? 1 : activeSegmentId === 2 ? 5 : 9;
  const activeWeekEnd = activeWeekStart + 3;

  const handleChartClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const clickedData: WeeklyTelemetry = state.activePayload[0].payload;
      if (onSelectWeek) onSelectWeek(clickedData.weekNumber);
      if (onSelectSegment) {
        const segId = (clickedData.weekNumber <= 4 ? 1 : clickedData.weekNumber <= 8 ? 2 : 3) as 1 | 2 | 3;
        onSelectSegment(segId);
      }
    }
  };

  // Integrated Week Inspector Tooltip Component (Compressed & positioned towards X-axis)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: WeeklyTelemetry = payload[0].payload;
      const isSpike = data.cortisolPgPerMg > 20;
      const isElevated = data.cortisolPgPerMg > 14;

      return (
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 shadow-lg text-xs w-[265px] sm:w-[280px] animate-fade-in pointer-events-none select-none z-50">
          {/* Header Line: Week label + Date Range + Cortisol Value & Badge (Month removed) */}
          <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-100">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#3186FF] shrink-0" />
              <span className="font-extrabold text-slate-900 text-[11px] font-sans truncate">
                {(data as any).fullWeekLabel || data.weekLabel || `Week ${data.weekNumber}`}
              </span>
              <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                ({data.dateRange})
              </span>
            </div>

            {/* Consolidated Cortisol Value & Level Badge */}
            <div className="flex items-center gap-1 shrink-0 font-mono">
              <span className="text-[11px] font-black text-slate-900">
                {data.cortisolPgPerMg}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">pg/mg</span>
              <span
                className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded leading-none ${
                  isSpike
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : isElevated
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isSpike ? 'Spike' : isElevated ? 'Elevated' : 'Normal'}
              </span>
            </div>
          </div>

          {/* Compressed Workload Row */}
          <div className="pt-1 text-[10px] font-mono">
            <div className="flex items-center justify-between bg-slate-50/90 px-2.5 py-1 rounded-lg border border-slate-100">
              <span className="text-slate-600 font-sans text-[10px] font-medium">Google Calendar Load:</span>
              <span className="font-bold text-slate-900 text-[11px]">
                {data.meetingHours}h{' '}
                {data.eveningCalls > 0 && (
                  <span className="text-rose-600 font-semibold text-[9.5px]">
                    ({data.eveningCalls} late past 7 PM)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Compact Trigger Line */}
          {data.triggerDetails && (
            <div className="mt-1 pt-1 border-t border-slate-100 text-[9px] text-slate-600 leading-tight font-sans line-clamp-2">
              <span className="font-bold text-slate-700">Trigger: </span>
              <span>
                {data.triggerDetails
                  .replace(/\s*\+\s*\d+%\s*deep\s*sleep\s*drop/gi, '')
                  .replace(/;\s*Deep\s*sleep\s*crashed\s*to\s*\d+\s*min\.?/gi, '.')
                  .replace(/,\s*stable\s*restorative\s*sleep/gi, ', balanced schedule')
                  .replace(/;\s*minor\s*sleep\s*friction/gi, '; minor schedule friction')
                  .replace(/;\s*initial\s*sleep\s*drop/gi, ' breaking recovery boundaries')
                  .replace(/\s*deep\s*sleep\s*/gi, ' recovery ')
                  .replace(/\s*sleep\s*/gi, ' recovery ')}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 sm:p-6 font-sans">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <TrendingUp className="w-5 h-5 text-[#3186FF]" />
            <h3 className="text-sm sm:text-base font-bold text-black tracking-tight">
              12-Week Cortisol & Workload Timeline
            </h3>
            {isCalendarConnected ? (
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Derived from Live Google Calendar {calendarEmail && !calendarEmail.includes('Demo') ? `(${calendarEmail})` : ''}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                Demo Benchmark Telemetry
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Tracking monthly stress hormone levels across 12 weeks against Google Calendar meeting volume
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#3186FF] rounded-full" />
            <span className="text-black font-semibold text-[11px]">Hair Cortisol</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#1F2937] rounded-xs" />
            <span className="text-black font-semibold text-[11px]">Meeting Hours</span>
          </div>
        </div>
      </div>

      {/* Biomarker-Calendar Discordance Banner */}
      {isDiscordance && (
        <div className="mt-3 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs flex items-start gap-2.5 text-amber-900 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold flex items-center gap-2 flex-wrap">
              <span>Biomarker-Calendar Discordance Active</span>
              <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">Inferences Withheld Pending Intake</span>
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              Hair cortisol peaked at {augustCortisol} pg/mg despite {totalMeetingHours === 0 ? '0' : totalMeetingHours} scheduled calendar meeting hours. Standard desk meeting conclusions are withheld. Chat with <strong>Tricha AI</strong> to log your clinical ward duties, study workload, and irregular shifts.
            </p>
          </div>
        </div>
      )}

      {/* Month Names at the Top of the Graph (Clickable to switch active segment) */}
      <div className="grid grid-cols-3 text-center text-xs sm:text-sm font-bold mt-4 mb-1 tracking-wider uppercase select-none px-6 sm:px-8">
        <button
          type="button"
          onClick={() => onSelectSegment && onSelectSegment(1)}
          className={`py-1 border-b-2 transition-all cursor-pointer font-bold ${
            activeSegmentId === 1
              ? 'border-[#3186FF] text-[#3186FF]'
              : 'border-slate-200 text-slate-500 hover:text-slate-800'
          }`}
        >
          {month1Label}
        </button>
        <button
          type="button"
          onClick={() => onSelectSegment && onSelectSegment(2)}
          className={`py-1 border-b-2 transition-all cursor-pointer font-bold ${
            activeSegmentId === 2
              ? 'border-rose-400 text-rose-700'
              : 'border-slate-200 text-slate-500 hover:text-slate-800'
          }`}
        >
          {month2Label}
        </button>
        <button
          type="button"
          onClick={() => onSelectSegment && onSelectSegment(3)}
          className={`py-1 border-b-2 transition-all cursor-pointer font-bold ${
            activeSegmentId === 3
              ? 'border-[#3186FF] text-[#3186FF]'
              : 'border-slate-200 text-slate-500 hover:text-slate-800'
          }`}
        >
          {month3Label}
        </button>
      </div>

      {/* Recharts Dual-Axis Chart with Integrated Interactive Week Inspector */}
      <div className="h-[280px] sm:h-[300px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            onClick={handleChartClick}
            margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="cortisolCurveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3186FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3186FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />

            {/* Active Segment Focal Window Highlight */}
            <ReferenceArea
              x1={`Week ${activeWeekStart}`}
              x2={`Week ${activeWeekEnd}`}
              yAxisId="left"
              fill="#3186FF"
              fillOpacity={0.05}
              stroke="#3186FF"
              strokeOpacity={0.3}
              strokeDasharray="3 3"
            />

            {/* Optimal Cortisol Baseline Reference Line (14.0 pg/mg) */}
            <ReferenceLine
              y={14.0}
              yAxisId="left"
              stroke="#10B981"
              strokeDasharray="4 4"
            />

            {/* X-Axis: Explicit "Week 1", "Week 2", etc. */}
            <XAxis
              dataKey="fullWeekLabel"
              tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 600 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />

            {/* Left Y-Axis: Cortisol (pg/mg) - Smoothly dynamic ceiling */}
            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[0, yAxisMax]}
              tick={{ fill: '#3186FF', fontSize: 10, fontWeight: 700 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              unit=" pg"
            />

            {/* Right Y-Axis: Calendar Meeting Hours */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 60]}
              tick={{ fill: '#1F2937', fontSize: 10, fontWeight: 600 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              unit="h"
            />

            {/* Integrated Week Inspector Tooltip (Positioned down towards X-axis) */}
            <Tooltip
              cursor={{ stroke: '#3186FF', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              content={<CustomTooltip />}
              position={{ y: 175 }}
              allowEscapeViewBox={{ x: false, y: true }}
              wrapperStyle={{ outline: 'none', zIndex: 50, pointerEvents: 'none' }}
            />

            {/* Secondary Axis: Google Calendar Meeting Load Bars (Instant 60fps responsiveness) */}
            <Bar
              yAxisId="right"
              dataKey="meetingHours"
              fill="#1F2937"
              radius={[4, 4, 0, 0]}
              barSize={16}
              opacity={0.85}
              isAnimationActive={false}
              cursor="pointer"
            />

            {/* Primary Axis: Continuous Cortisol Curve (Instant 60fps responsiveness without animation lag) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cortisolPgPerMg"
              stroke="#3186FF"
              strokeWidth={3}
              dot={{ r: 4, fill: '#3186FF', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#3186FF', stroke: '#FFFFFF', strokeWidth: 2 }}
              isAnimationActive={false}
              cursor="pointer"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
