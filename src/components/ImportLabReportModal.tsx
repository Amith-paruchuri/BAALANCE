'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  Sparkles,
  FlaskConical,
  Scissors,
  Calendar,
  Building2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { HairCortisolSegment } from '@/lib/types';

interface ImportLabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSegments: HairCortisolSegment[];
  onImportReport: (data: {
    segments: HairCortisolSegment[];
    reportName: string;
    labPartner: string;
    testDate: string;
  }) => void;
}

export const ImportLabReportModal: React.FC<ImportLabReportModalProps> = ({
  isOpen,
  onClose,
  currentSegments,
  onImportReport,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'presets' | 'manual'>('upload');

  // Manual & Preset values state (July = id 1, August = id 2, September = id 3)
  const curM1 = currentSegments.find(s => s.id === 1)?.cortisolPgPerMg || 11.2;
  const curM2 = currentSegments.find(s => s.id === 2)?.cortisolPgPerMg || 28.4;
  const curM3 = currentSegments.find(s => s.id === 3)?.cortisolPgPerMg || 15.6;

  const [m1Val, setM1Val] = useState<number>(curM1);
  const [m2Val, setM2Val] = useState<number>(curM2);
  const [m3Val, setM3Val] = useState<number>(curM3);

  const [reportName, setReportName] = useState('Hair-Cortisol-ELISA-Report-9842.pdf');
  const [labPartner, setLabPartner] = useState('LAKME Salon & Delhi Diagnostic Laboratory');
  const [testDate, setTestDate] = useState('Sep 18, 2026');

  // File upload state
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedSummary, setExtractedSummary] = useState<string | null>(null);

  if (!isOpen) return null;

  // Genuine PDF/image file upload handler calling Gemini via /api/parse-lab-report
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReportName(file.name);
    setIsExtracting(true);
    setUploadSuccess(false);
    setUploadError(null);
    setExtractedSummary(null);

    try {
      // 1. Convert file to base64 Data URL
      const base64Data: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });

      // 2. Fetch user's local Gemini key if saved
      const localApiKey =
        typeof window !== 'undefined'
          ? localStorage.getItem('baalance_gemini_api_key')
          : null;

      // 3. Send file to Gemini document parsing engine
      const res = await fetch('/api/parse-lab-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64Data,
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          apiKey: localApiKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.isHairCortisolReport) {
        setIsExtracting(false);
        setUploadSuccess(false);
        setUploadError(
          data.rejectionReason ||
            `The uploaded file "${file.name}" could not be verified as a certified Scalp Hair Cortisol lab report. Please upload an authentic hair test report or select one of the real-world case scenarios below.`
        );
        return;
      }

      // Valid hair cortisol report analyzed successfully by Gemini
      setIsExtracting(false);
      setUploadError(null);
      setUploadSuccess(true);
      setReportName(file.name);

      if (data.month1?.cortisolPgPerMg) {
        setM1Val(Number(data.month1.cortisolPgPerMg));
      }
      if (data.month2?.cortisolPgPerMg) {
        setM2Val(Number(data.month2.cortisolPgPerMg));
      }
      if (data.month3?.cortisolPgPerMg) {
        setM3Val(Number(data.month3.cortisolPgPerMg));
      }
      if (data.salonOrLab) {
        setLabPartner(data.salonOrLab);
      }
      if (data.summary) {
        setExtractedSummary(data.summary);
      }
    } catch (err: any) {
      setIsExtracting(false);
      setUploadSuccess(false);
      setUploadError(
        `Failed to process document (${err.message || 'Network error'}). Please ensure the file is an authentic Scalp Hair Cortisol report.`
      );
    }
  };

  // Preset real-world case scenarios
  const handleSelectPreset = (presetType: 'recovery' | 'crunch' | 'baseline') => {
    setUploadError(null);
    if (presetType === 'recovery') {
      setReportName('Case-1-Full-Recovery.pdf');
      setM1Val(28.4); // Historical peak at tip (July)
      setM2Val(14.2); // Clearing (August)
      setM3Val(9.8);  // Optimal recovery at root (September)
      setTestDate('Nov 14, 2026');
      setExtractedSummary('Full recovery achieved: strictly logged off by 7 PM, 8+ hours restorative sleep, and normal healthy cortisol baseline.');
    } else if (presetType === 'crunch') {
      setReportName('Case-2-Deadline-Crunch.pdf');
      setM1Val(11.2); // Baseline at tip (July)
      setM2Val(28.4); // August spike
      setM3Val(32.4); // Acute severe spike at root (September)
      setTestDate('Sep 20, 2026');
      setExtractedSummary('High work crunch: 50+ hours of meetings, late-night calls past 9 PM, and <5h sleep driving severe cortisol surge into hair root.');
    } else {
      setReportName('Case-3-Lingering-Fatigue.pdf');
      setM1Val(11.2); // July (Hair Tip)
      setM2Val(28.4); // August (Mid-Shaft)
      setM3Val(15.6); // September (Scalp Root)
      setTestDate('Sep 18, 2026');
      setExtractedSummary('Slow recovery: major deadline over, but midnight screen habits and restless sleep kept stress hormones mildly elevated.');
    }
    setUploadSuccess(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const buildSegments: HairCortisolSegment[] = [
      {
        id: 1,
        segmentKey: 'month1',
        title: 'July',
        anatomicalRegion: 'Hair Tip (2.0–3.0 cm)',
        distanceCm: '2.0–3.0 cm',
        timeWindow: '60–90 Days Ago (July)',
        cortisolPgPerMg: m1Val,
        referenceBaseline: 11.0,
        status: m1Val > 20 ? 'acute_surge' : m1Val > 14 ? 'incomplete_recovery' : 'baseline',
        clinicalStatusLabel: m1Val > 20 ? 'Historical Spike' : m1Val > 14 ? 'Mild Strain' : 'Optimal Baseline',
        clinicalNote: m1Val <= 11.0
          ? 'Standard 25h weekly meetings, steady 7.5h sleep, and regular schedule kept stress in a healthy, balanced range.'
          : m1Val > 20
          ? 'Elevated historical stress baseline with heavy kickoff load.'
          : 'Mildly elevated baseline workload with early project sprints.',
      },
      {
        id: 2,
        segmentKey: 'month2',
        title: 'August',
        anatomicalRegion: 'Mid-Shaft (1.0–2.0 cm)',
        distanceCm: '1.0–2.0 cm',
        timeWindow: '30–60 Days Ago (August)',
        cortisolPgPerMg: m2Val,
        referenceBaseline: 11.0,
        status: m2Val > 20 ? 'acute_surge' : m2Val > 14 ? 'incomplete_recovery' : 'baseline',
        clinicalStatusLabel: m2Val > 20 ? 'Stress Spike (Peak)' : m2Val > 14 ? 'Elevated Strain' : 'Normal Baseline',
        clinicalNote: 'Peak workload crunch with 47.5h meeting weeks, 11 calls after 7 PM, and 4 flights cut restorative deep sleep down to 42 minutes.',
      },
      {
        id: 3,
        segmentKey: 'month3',
        title: 'September',
        anatomicalRegion: 'Scalp Root (0.0–1.0 cm)',
        distanceCm: '0.0–1.0 cm',
        timeWindow: 'Last 30 Days (September)',
        cortisolPgPerMg: m3Val,
        referenceBaseline: 11.0,
        status: m3Val > 20 ? 'acute_surge' : m3Val > 14 ? 'incomplete_recovery' : 'baseline',
        clinicalStatusLabel: m3Val > 20 ? 'Stress Spike' : m3Val > 14 ? 'Delayed Recovery' : 'Optimal Baseline',
        clinicalNote: m3Val <= 11.0
          ? 'Full stress clearance achieved with healthy restorative deep sleep.'
          : m3Val > 20
          ? 'Acute ongoing stress surge with evening call interference.'
          : 'Daytime meetings dropped by 32%, but taking 4 late calls/week after 7 PM kept sleep restless, delaying full recovery.',
      },
    ];

    onImportReport({
      segments: buildSegments,
      reportName,
      labPartner,
      testDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/70 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3186FF] text-white flex items-center justify-center shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-black tracking-tight">
                  Import Hair Cortisol Lab Report
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Auto-Refresh
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ingests ELISA test data to automatically recalculate your Burnout Score & timeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-black transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: File Upload / Case Scenarios / Manual Values */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 px-4 pt-2.5 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'upload'
                ? 'border-[#3186FF] text-[#3186FF] font-bold'
                : 'border-transparent text-slate-500 hover:text-black'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF / Scan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('presets')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'presets'
                ? 'border-[#3186FF] text-[#3186FF] font-bold'
                : 'border-transparent text-slate-500 hover:text-black'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Case Scenarios</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'manual'
                ? 'border-[#3186FF] text-[#3186FF] font-bold'
                : 'border-transparent text-slate-500 hover:text-black'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Enter Exact Values</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* MODE 1: FILE UPLOAD */}
          {activeMode === 'upload' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-blue-200 hover:border-[#3186FF] bg-blue-50/30 hover:bg-blue-50/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200 flex items-center justify-center text-[#3186FF] shadow-xs mb-2.5">
                  {isExtracting ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-[#3186FF]" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div className="font-bold text-xs sm:text-sm text-black">
                  {isExtracting ? 'Gemini Analyzing Document Authenticity...' : 'Drop your Hair Cortisol Report here'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Supports PDF or photo reports from partner salons (LAKME, etc.) or clinical diagnostic labs
                </p>

                <span className="mt-3 px-3 py-1 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-[#3186FF] shadow-2xs">
                  Browse Files
                </span>
              </label>

              {/* ERROR STATE: REJECTED DOCUMENT (E.G. STEP 1 SCORE REPORT) */}
              {uploadError && (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2.5 animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-rose-950">
                          Document Rejected • Not a Hair Cortisol Report
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                          Verification Error
                        </span>
                      </div>
                      <p className="text-xs text-rose-900/90 leading-relaxed font-sans">
                        {uploadError}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-200 flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="text-rose-800 text-[11px] font-medium">
                      Want to simulate your burnout timeline without an ELISA scan?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadError(null);
                        setActiveMode('presets');
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-xs"
                    >
                      Choose a Real-World Case Scenario →
                    </button>
                  </div>
                </div>
              )}

              {/* SUCCESS STATE: GENUINE HAIR CORTISOL REPORT EXTRACTED */}
              {uploadSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-900">{reportName}</div>
                      <div className="text-[10px] text-emerald-700 font-mono">
                        Extracted: M1={m1Val} pg/mg • M2={m2Val} pg/mg • M3={m3Val} pg/mg
                      </div>
                      {extractedSummary && (
                        <p className="text-[10px] text-emerald-800 font-sans mt-0.5">
                          {extractedSummary}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    Verified
                  </span>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: REAL-WORLD CASE SCENARIOS (SIMPLIFIED CASE 1, CASE 2, CASE 3) */}
          {activeMode === 'presets' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600 font-semibold mb-1">
                Choose a real-world scenario to see how your schedule and lifestyle change your burnout score:
              </div>

              {/* CASE 1: FULL RECOVERY & HEALTHY ROUTINE */}
              <div
                onClick={() => handleSelectPreset('recovery')}
                className="p-3.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 transition-all cursor-pointer space-y-1.5 shadow-2xs hover:border-emerald-300"
              >
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Case 1: Fully Rested & Balanced (Vacation / Healthy Routine)</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono">
                    Optimal • 9.8 pg/mg
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed pl-6 font-sans">
                  You took time off or strictly logged off work by 7 PM, got 8+ hours of deep restful sleep, and exercised regularly. Stress hormones dropped back into the healthy green zone.
                </p>
              </div>

              {/* CASE 2: HIGH WORK CRUNCH & DEADLINE PRESSURE */}
              <div
                onClick={() => handleSelectPreset('crunch')}
                className="p-3.5 rounded-2xl border-2 border-rose-200 bg-rose-50/60 hover:bg-rose-50 transition-all cursor-pointer space-y-1.5 shadow-2xs hover:border-rose-300"
              >
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-rose-950">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Case 2: Heavy Work Crunch & High Stress (Product Launch / Deadlines)</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-mono">
                    Severe Strain • 32.4 pg/mg
                  </span>
                </div>
                <p className="text-[11px] text-rose-900/90 leading-relaxed pl-6 font-sans">
                  Packed calendar with 50+ hours of meetings, answering urgent late-night calls past 9 PM, and sleeping under 5 hours. Stress peaked severely in your hair root.
                </p>
              </div>

              {/* CASE 3: LINGERING FATIGUE & SLOW RECOVERY */}
              <div
                onClick={() => handleSelectPreset('baseline')}
                className="p-3.5 rounded-2xl border-2 border-amber-200 bg-amber-50/60 hover:bg-amber-50 transition-all cursor-pointer space-y-1.5 shadow-2xs hover:border-amber-300"
              >
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-amber-950">
                    <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Case 3: Lingering Fatigue (Work Eased Up, But Body Still Tired)</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono">
                    Slow Recovery • 15.6 pg/mg
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/90 leading-relaxed pl-6 font-sans">
                  The big deadline is over, but late-night screen habits and restless sleep lingered. Work feels manageable, but your body is still carrying background burnout.
                </p>
              </div>
            </div>
          )}

          {/* MODE 3: MANUAL VALUES & PREVIEW */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-black border-b border-slate-200 pb-2">
              <span className="flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-[#3186FF]" />
                <span>Hair Segment Cortisol Values (pg/mg)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">
                Normal: 5.0 – 14.0 pg/mg
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* July (Tip) */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-black">July (Hair Tip)</span>
                  <span className="text-[9px] font-mono text-slate-400">2.0–3.0 cm</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="45.0"
                  value={m1Val}
                  onChange={e => setM1Val(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-extrabold font-mono text-black p-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3186FF]"
                />
                <div className={`text-[9px] font-bold ${
                  m1Val > 20 ? 'text-rose-600' : m1Val > 14 ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  {m1Val > 20 ? 'Historical Spike' : m1Val > 14 ? 'Mild Strain' : 'Optimal'}
                </div>
              </div>

              {/* August (Mid-Shaft) */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-black">August (Mid-Shaft)</span>
                  <span className="text-[9px] font-mono text-slate-400">1.0–2.0 cm</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="45.0"
                  value={m2Val}
                  onChange={e => setM2Val(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-extrabold font-mono text-black p-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3186FF]"
                />
                <div className={`text-[9px] font-bold ${
                  m2Val > 20 ? 'text-rose-600' : m2Val > 14 ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  {m2Val > 20 ? 'Peak Spike' : m2Val > 14 ? 'Elevated' : 'Optimal'}
                </div>
              </div>

              {/* September (Scalp Root) */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-black">September (Scalp Root)</span>
                  <span className="text-[9px] font-mono text-slate-400">0.0–1.0 cm</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="45.0"
                  value={m3Val}
                  onChange={e => setM3Val(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-extrabold font-mono text-black p-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3186FF]"
                />
                <div className={`text-[9px] font-bold ${
                  m3Val > 20 ? 'text-rose-600' : m3Val > 14 ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  {m3Val > 20 ? 'High Spike' : m3Val > 14 ? 'Delayed Recovery' : 'Optimal'}
                </div>
              </div>
            </div>
          </div>

          {/* Lab Specimen Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Partner Salon / Laboratory:
              </label>
              <input
                type="text"
                value={labPartner}
                onChange={e => setLabPartner(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#3186FF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Report Assay Date:
              </label>
              <input
                type="text"
                value={testDate}
                onChange={e => setTestDate(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#3186FF]"
              />
            </div>
          </div>
        </div>

        {/* Footer with Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Burnout Score auto-refreshes immediately upon import</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Import & Auto-Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
