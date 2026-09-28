'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Printer,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Scan,
  Calendar,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  Eye,
  Download,
} from 'lucide-react';
import Link from 'next/link';

export default function CollectionGuidePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 18;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-[#3186FF] selection:text-white print:bg-white print:text-black">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to App</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
              ✦ Gemini 3.6 Flash Edition
            </span>
            <span>Hair Collection Instruction Booklet (18 Pages)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Page Jump */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-bold text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to All Pages or Print */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Print entire 18-page booklet or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </header>

      {/* Main Booklet Content Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12 print:p-0 print:m-0 print:max-w-none">
        
        {/* ======================================================== */}
        {/* PAGE 1: COVER                                           */}
        {/* ======================================================== */}
        <section id="page-1" className="booklet-page bg-white text-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-200 min-h-[900px] flex flex-col justify-between relative overflow-hidden print:shadow-none print:border-none print:rounded-none print:m-0 print:min-h-screen">
          {/* Subtle Gemini Ambient Glow Background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />

          {/* Top Tagline */}
          <div className="text-center pt-8">
            <span className="text-[11px] font-mono font-extrabold tracking-[0.25em] text-slate-400 uppercase block">
              I N S T R U C T I O N &nbsp; B O O K L E T
            </span>
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
              <span className="text-blue-500 font-black">✦</span>
              <span>Enhanced with Google Gemini 3.6 Flash Multimodal Vision</span>
            </div>
          </div>

          {/* Center Circular Logo Hero */}
          <div className="flex flex-col items-center justify-center my-auto space-y-6 text-center">
            {/* Visual Logo Circle */}
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-slate-700 p-3 flex items-center justify-center relative shadow-lg bg-gradient-to-tr from-white via-slate-50 to-blue-50/30">
              <div className="w-full h-full rounded-full border border-slate-300 flex flex-col items-center justify-center relative p-6">
                
                {/* Hair Strand Graphics with Gemini Sparkle nodes */}
                <div className="relative mb-2">
                  <svg className="w-16 h-28" viewBox="0 0 60 120" fill="none">
                    <path
                      d="M 30 110 C 30 70, 45 40, 50 10"
                      stroke="#0F172A"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="30" cy="110" r="7" fill="#0F172A" />
                    {/* Gemini Sparkle Nodes at 1cm, 2cm, 3cm */}
                    <circle cx="33" cy="80" r="3.5" fill="#3186FF" className="animate-pulse" />
                    <circle cx="41" cy="45" r="3.5" fill="#3186FF" className="animate-pulse" />
                    <circle cx="49" cy="15" r="3.5" fill="#3186FF" className="animate-pulse" />
                  </svg>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
                  BAAL<span className="text-[#3186FF]">ANCE</span>
                </h1>
                <p className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase mt-1">
                  HAIR KEEPS THE RECEIPTS
                </p>
              </div>
            </div>

            {/* Guide Title */}
            <div className="space-y-2 pt-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Hair Collection Guide
              </h2>
              <p className="text-sm font-medium text-slate-600 max-w-md mx-auto">
                Three centimetres of hair. Three months of your story.
              </p>
            </div>
          </div>

          {/* Bottom Footer & Gemini Badge */}
          <div className="border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span className="font-mono text-[10px] tracking-wider uppercase">
              HOME KIT & PARTNER SALON EDITION · PROTOTYPE 2026
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="text-blue-600">✦</span>
              <span>Google Gemini AI Hackathon Edition</span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PAGE 2: WELCOME                                         */}
        {/* ======================================================== */}
        <section id="page-2" className="booklet-page bg-white text-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-200 min-h-[900px] flex flex-col justify-between print:shadow-none print:border-none print:rounded-none print:m-0 print:min-h-screen">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 tracking-wider">BAALANCE</span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">WELCOME</span>
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-orange-600 font-extrabold uppercase">
                YOUR HAIR KEEPS THE RECEIPTS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Stress leaves a record. <br />
                <span className="text-[#3186FF]">Gemini helps you read it.</span>
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Hair grows roughly 1 cm per month and captures circulating cortisol, the body’s primary endocrine stress biomarker. The 3 cm nearest your scalp holds a chronological 90-day biological record.
            </p>

            {/* 3-Month Hair Strand Diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-2">
                <span>Month 1 (Most Recent)</span>
                <span>Month 2 (Surge Phase)</span>
                <span>Month 3 (Baseline)</span>
              </div>

              {/* Graphic Hair Bar */}
              <div className="relative h-4 bg-slate-200 rounded-full flex items-center px-1">
                <div className="w-5 h-5 rounded-full bg-slate-900 -ml-1 flex items-center justify-center text-[8px] text-white font-bold" title="Follicular Root">
                  R
                </div>
                <div className="flex-1 flex justify-between px-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3186FF]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3186FF]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3186FF]" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
                <span>Root (0 to 1 cm)</span>
                <span>Mid-shaft (1 to 2 cm)</span>
                <span>Tip (2 to 3 cm)</span>
              </div>
            </div>

            {/* Gemini Multi-Modal Bio-Inference Callout */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <span>✦</span>
                <span>The Gemini 3.6 Flash Multi-Temporal Advantage</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Traditional blood or saliva tests only capture a 10-minute snapshot of acute stress. Gemini correlates your 3-centimetre chronological hair cortisol against 90 days of Google Calendar meeting density to isolate systemic burnout triggers.
              </p>
            </div>

            {/* Two easy ways to give a sample */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Two easy ways to give a sample
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold uppercase">
                    Home Collection
                  </span>
                  <p className="text-xs text-slate-600 mt-2">
                    Book in the BAALANCE app. A certified collector visits, takes the specimen in 60 seconds, and seals the tamper-evident pouch.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-mono font-bold uppercase">
                    Partner Salon
                  </span>
                  <p className="text-xs text-slate-600 mt-2">
                    Walk into any partner salon during your regular haircut. Your stylist collects the bundle and logs the handover digitally.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            <span>Hair Collection Guide</span>
            <span className="font-mono font-bold">02</span>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PAGE 3: WHAT'S IN THE BOX                               */}
        {/* ======================================================== */}
        <section id="page-3" className="booklet-page bg-white text-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-200 min-h-[900px] flex flex-col justify-between print:shadow-none print:border-none print:rounded-none print:m-0 print:min-h-screen">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 tracking-wider">BAALANCE</span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">INSIDE YOUR KIT</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                What's in the box
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Medical-grade collection tools engineered for follicle preservation and zero-friction harvesting.
              </p>
            </div>

            {/* 3x3 Grid of Tools */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-2xl block">✂️</span>
                <h4 className="text-xs font-bold text-slate-900">Precision scissors</h4>
                <p className="text-[10px] text-slate-500">Fine tips for a clean 0cm cut</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-2xl block">🪮</span>
                <h4 className="text-xs font-bold text-slate-900">Comb</h4>
                <p className="text-[10px] text-slate-500">Separates clean parallel strands</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-2xl block">📎</span>
                <h4 className="text-xs font-bold text-slate-900">Sectioning clip</h4>
                <p className="text-[10px] text-slate-500">Pins upper hair cleanly away</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-2xl block">🧵</span>
                <h4 className="text-xs font-bold text-slate-900">Cotton tie loop</h4>
                <p className="text-[10px] text-slate-500">Marks the scalp/root boundary</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-2xl block">📄</span>
                <h4 className="text-xs font-bold text-slate-900">Foil sample sleeve</h4>
                <p className="text-[10px] text-slate-500">Shields from moisture & UV rays</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-2xl block">🧼</span>
                <h4 className="text-xs font-bold text-slate-900">Sterile alcohol swab</h4>
                <p className="text-[10px] text-slate-500">Sterilizes tool blades before snip</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                <span className="text-2xl block">🏷️</span>
                <h4 className="text-xs font-bold text-blue-900">Gemini QR smart-tag</h4>
                <p className="text-[10px] text-blue-700">Optical scan links to app account</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-2xl block">✉️</span>
                <h4 className="text-xs font-bold text-slate-900">Return pouch</h4>
                <p className="text-[10px] text-slate-500">Keeps specimen dry in transit</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-2xl block">💌</span>
                <h4 className="text-xs font-bold text-slate-900">The hidden envelope</h4>
                <p className="text-[10px] text-slate-500">Restorative reset protocol</p>
              </div>
            </div>

            {/* Smart Camera Verification Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-3">
              <Camera className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-[11px] text-slate-700">
                <strong>Gemini Vision Pre-Check:</strong> You can point your phone camera at your laid-out kit in the BAALANCE app to automatically verify that all 9 components are present before starting.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            <span>Hair Collection Guide</span>
            <span className="font-mono font-bold">03</span>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PAGE 4: A QUICK CHECKLIST & CONFOUNDERS                 */}
        {/* ======================================================== */}
        <section id="page-4" className="booklet-page bg-white text-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-200 min-h-[900px] flex flex-col justify-between print:shadow-none print:border-none print:rounded-none print:m-0 print:min-h-screen">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 tracking-wider">BAALANCE</span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">BEFORE YOU BEGIN</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                A quick checklist
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                A few biological details alter cortisol retention. Telling Gemini about them allows the synthesis engine to calibrate your results fairly.
              </p>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                <span className="w-5 h-5 rounded-md border-2 border-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Hair length: At least 3 cm</h4>
                  <p className="text-[11px] text-slate-600">Hair at the posterior vertex (back of head) must be ≥ 3 cm to represent a full 90-day window.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                <span className="w-5 h-5 rounded-md border-2 border-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Hair is dry & un-oiled</h4>
                  <p className="text-[11px] text-slate-600">Avoid applying heavy hair oils on the day of collection. If oiled recently, log the date in the app.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                <span className="w-5 h-5 rounded-md border-2 border-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Dye, bleach, or chemical treatments</h4>
                  <p className="text-[11px] text-slate-600">Chemical peroxides can degrade hormone chains; Gemini applies a mathematical offset to normalize the reading.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                <span className="w-5 h-5 rounded-md border-2 border-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Prescription medications</h4>
                  <p className="text-[11px] text-slate-600">Note steroid inhalers, hydrocortisone creams, or oral contraceptives so Gemini can account for CBG binding.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                <span className="w-5 h-5 rounded-md border-2 border-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Clean hands & sterile blades</h4>
                  <p className="text-[11px] text-slate-600">Wash hands thoroughly and wipe scissors with the included isopropyl alcohol swab before the cut.</p>
                </div>
              </div>
            </div>

            {/* In-App Intake Note */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Fill in these details in the <strong>BAALANCE 4-Step Intake Wizard</strong> (powered by Gemini) before your appointment. Takes ~90 seconds.</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            <span>Hair Collection Guide</span>
            <span className="font-mono font-bold">04</span>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PAGES 5 TO 11: THE 7 STEPS PROTOCOL                    */}
        {/* ======================================================== */}
        <section id="page-5-11" className="booklet-page bg-white text-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-200 space-y-8 print:shadow-none print:border-none print:rounded-none">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-black text-slate-900 tracking-wider">BAALANCE</span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase ml-3">COLLECTION PROTOCOL</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              7-Step Laboratory Collection Protocol
            </h2>
            <p className="text-xs text-slate-500">
              Enhanced with Gemini Multimodal Camera Guidance at every step.
            </p>
          </div>

          {/* Step 1 to 7 Cards */}
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-black">
                  STEP 1 OF 7
                </span>
                <span className="text-xs font-bold text-slate-400">PREPARE</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Lay out tools & scan the ID label</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lay out the foil sleeve, clips, comb, scissors, cotton tie loop, and swab on a disinfected surface. Wipe scissor blades with the alcohol swab. Scan the unique ID label with the BAALANCE app to link the sample cryptographically to your account.
              </p>
              <div className="text-[11px] font-bold text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-200 inline-flex items-center gap-1.5">
                <span>✦ Gemini Feature:</span> Point camera at kit to auto-verify that scissor blades and foil are clean.
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-black">
                  STEP 2 OF 7
                </span>
                <span className="text-xs font-bold text-slate-400">PART THE HAIR</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Separate a 3 mm bundle at the posterior vertex</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clip upper hair out of the way just below the crown. Separate a small bundle roughly <strong>3 mm thick</strong> (half the width of a pencil). Comb the bundle so strands lie strictly parallel. Because this comes from underneath, the spot remains completely invisible.
              </p>
              <div className="text-[11px] font-bold text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-200 inline-flex items-center gap-1.5">
                <span>✦ Gemini Feature:</span> In-app camera overlays a real-time 3mm calibrated measuring reticle on your screen.
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-black">
                  STEP 3 OF 7
                </span>
                <span className="text-xs font-bold text-slate-400">TIE AT THE ROOT</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Thread the bundle and cinch cotton loop tight</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pass the combed bundle through the cotton loop. Slide the loop down to approximately 1 cm from the scalp and pull it tight. This permanent loop preserves strand orientation so the mass spectrometry lab knows exactly which end is the root.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-black">
                  STEP 4 OF 7
                </span>
                <span className="text-xs font-bold text-slate-400">CUT CLOSE TO SCALP</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Snip as close to the scalp as possible (0 mm)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hold the bundle firmly just below the cotton loop so hairs cannot slip. Cut as close to the skin as safely possible in one decisive snip.
              </p>
              <div className="text-[11px] font-bold text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 block">
                <strong>Why so close?</strong> The first centimetre contains your most recent 30-day cortisol history. Leaving it behind loses your most current month of biological data.
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-black">
                  STEP 5 OF 7
                </span>
                <span className="text-xs font-bold text-slate-400">ALIGN ON SLEEVE</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Line up root loop with SCALP END arrow</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lay the bundle flat on the open foil sleeve. Align the cotton loop directly with the printed <strong>SCALP END</strong> marker. If hair exceeds 6 cm in total length, trim excess tip hair with scissors.
              </p>
            </div>

            {/* Step 6 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-black">
                  STEP 6 OF 7
                </span>
                <span className="text-xs font-bold text-slate-400">FOLD & SEAL</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Fold sleeve over bundle without bending hair</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fold the long sides over the hair bundle, then fold both ends in so no strands can escape. Ensure the sleeve protects the hair straight — <strong>never crease or fold the hair strand itself</strong>.
              </p>
            </div>

            {/* Step 7 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-black">
                  STEP 7 OF 7
                </span>
                <span className="text-xs font-bold text-slate-400">LABEL & VERIFY</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Affix barcode & scan with Gemini Vision</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Affix the numeric ID barcode to the sealed foil sleeve and write today’s collection date. Scan the completed pouch with the BAALANCE app: Gemini Vision performs an automated 3-point pre-flight quality check and logs custody transfer.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PAGE 12: SIX THINGS THAT SPOIL A SAMPLE                  */}
        {/* ======================================================== */}
        <section id="page-12" className="booklet-page bg-white text-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-200 min-h-[900px] flex flex-col justify-between print:shadow-none print:border-none print:rounded-none print:m-0 print:min-h-screen">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 tracking-wider">BAALANCE</span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">SPECIMEN INTEGRITY</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Six things that spoil a sample
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Avoid these common collection errors to guarantee accurate 3-month chromatographic results.
              </p>
            </div>

            {/* 6 Mistake Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-center space-y-1">
                <span className="text-2xl block">❌</span>
                <h4 className="text-xs font-black text-rose-900">Folding the strand</h4>
                <p className="text-[10px] text-rose-700">Breaks the keratin matrix and bleeds monthly segments.</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-center space-y-1">
                <span className="text-2xl block">❌</span>
                <h4 className="text-xs font-black text-rose-900">Using paper clips</h4>
                <p className="text-[10px] text-rose-700">Crushes follicles; only use the provided cotton tie.</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-center space-y-1">
                <span className="text-2xl block">❌</span>
                <h4 className="text-xs font-black text-rose-900">Tape or glue</h4>
                <p className="text-[10px] text-rose-700">Adhesive chemicals contaminate mass spectrometry assays.</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-center space-y-1">
                <span className="text-2xl block">❌</span>
                <h4 className="text-xs font-black text-rose-900">Loose protruding hairs</h4>
                <p className="text-[10px] text-rose-700">Comb every hair neatly parallel into the bundle.</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-center space-y-1">
                <span className="text-2xl block">❌</span>
                <h4 className="text-xs font-black text-rose-900">Shifted root ends</h4>
                <p className="text-[10px] text-rose-700">Root ends must line up exactly flush to preserve dates.</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-center space-y-1">
                <span className="text-2xl block">❌</span>
                <h4 className="text-xs font-black text-rose-900">Too thin a bundle</h4>
                <p className="text-[10px] text-rose-700">Need at least 15–20 mg of hair (~3 mm bundle) for testing.</p>
              </div>
            </div>

            {/* Gemini Automated Specimen Check Feature */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-black text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Gemini Vision Pre-Flight Guarantee</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Before dropping your pouch in the mail or handing it to the collector, snap a photo in the app. <strong>Gemini 3.6 Flash Multimodal Vision</strong> inspects strand thickness, root orientation, and foil seal in real time. If anything is wrong, it alerts you immediately before transit.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            <span>Hair Collection Guide</span>
            <span className="font-mono font-bold">12</span>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PAGES 14 TO 16: GEMINI SYNTHESIS & YOUR APP EXPERIENCE   */}
        {/* ======================================================== */}
        <section id="page-14-16" className="booklet-page bg-white text-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-200 space-y-8 print:shadow-none print:border-none print:rounded-none">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-black text-slate-900 tracking-wider">BAALANCE</span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase ml-3">THE GEMINI ENGINE</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              From One Snip to Your Biological Timeline
            </h2>
            <p className="text-xs text-slate-500">
              How Google Gemini 3.6 Flash transforms follicular chemical records into proactive life defense.
            </p>
          </div>

          {/* 4 Pipeline Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-mono font-black text-slate-400">01</span>
              <h4 className="text-xs font-extrabold text-slate-900">Specimen Collected</h4>
              <p className="text-[11px] text-slate-500">Sealed, scanned & cryptographically assigned to your account.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-mono font-black text-slate-400">02</span>
              <h4 className="text-xs font-extrabold text-slate-900">LC-MS Lab Assay</h4>
              <p className="text-[11px] text-slate-500">CLIA certified mass-spectrometry measures cortisol month by month.</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
              <span className="text-xs font-mono font-black text-blue-500">03 ✦</span>
              <h4 className="text-xs font-extrabold text-blue-900">Gemini Synthesis</h4>
              <p className="text-[11px] text-blue-700">Correlates raw pg/mg data with 90 days of Google Calendar & sleep load.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-mono font-black text-slate-400">04</span>
              <h4 className="text-xs font-extrabold text-slate-900">Proactive Defense</h4>
              <p className="text-[11px] text-slate-500">Enforces automated 7 PM evening calendar curfews to protect sleep.</p>
            </div>
          </div>

          {/* Tricha AI Highlight */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-blue-500 text-white font-black text-xs">
                ✦
              </div>
              <h3 className="text-base font-extrabold">Tricha AI: Your Gemini-Powered Circadian Co-Pilot</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tricha isn’t a generic chatbot. Running natively on <strong>Gemini 3.6 Flash</strong> with a 1-million-token context window, Tricha reads your entire 12-week Google Calendar history, cross-references acute biometric spikes from WHOOP/Apple Watch, and directly proposes meeting reschedules when your biological curfew is violated.
            </p>
            <div className="pt-2 flex items-center gap-3 text-[11px] font-mono text-blue-300">
              <span>• Function Calling Enabled</span>
              <span>• Zero Medical Hallucinations</span>
              <span>• Google Calendar API Native</span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PAGE 17: COMMON QUESTIONS                                */}
        {/* ======================================================== */}
        <section id="page-17" className="booklet-page bg-white text-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-200 min-h-[900px] flex flex-col justify-between print:shadow-none print:border-none print:rounded-none print:m-0 print:min-h-screen">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 tracking-wider">BAALANCE</span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">FAQS</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div>
                <h4 className="font-extrabold text-slate-900">Will it leave a visible bald patch?</h4>
                <p className="mt-0.5">No. The bundle is taken from underneath the top layer at the back of the head. When hair is released, it is completely hidden.</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900">Does it hurt?</h4>
                <p className="mt-0.5">Not at all. The hair is snipped cleanly with scissors at the scalp surface, never plucked or pulled from the follicle.</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900">How does Gemini ensure data privacy?</h4>
                <p className="mt-0.5">Your biological sample carries only a random numeric barcode. No names appear on sleeves or lab tubes. Gemini processes your calendar locally and in HIPAA/GDPR-compliant encrypted enclaves with zero training on personal health records.</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900">Does hair washing or coloring change my results?</h4>
                <p className="mt-0.5">Frequent washing or chemical dyes can alter raw hormone levels. Because you log your hair wash frequency in the BAALANCE intake wizard, Gemini’s calibration model normalizes these confounders for true biological equity.</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900">How often should I test?</h4>
                <p className="mt-0.5">Every 90 days. Testing quarterly aligns perfectly with regular haircuts and allows Gemini to build a long-term retrospective endocrine trajectory.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            <span>Hair Collection Guide</span>
            <span className="font-mono font-bold">17</span>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PAGE 18: BACK COVER WITH GOOGLE GEMINI SIGNATURE         */}
        {/* ======================================================== */}
        <section id="page-18" className="booklet-page bg-white text-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-200 min-h-[900px] flex flex-col justify-between text-center relative overflow-hidden print:shadow-none print:border-none print:rounded-none print:m-0 print:min-h-screen">
          <div className="pt-8">
            <span className="text-[11px] font-mono tracking-[0.25em] text-slate-400 uppercase">
              HAIR KEEPS THE RECEIPTS
            </span>
          </div>

          <div className="my-auto space-y-6 flex flex-col items-center">
            {/* BAALANCE Brand Logo */}
            <div className="w-20 h-20 rounded-full border-2 border-slate-800 p-2 flex items-center justify-center bg-slate-50">
              <span className="text-3xl">🧬</span>
            </div>

            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              BAAL<span className="text-[#3186FF]">ANCE</span>
            </h2>

            <p className="text-xs text-slate-500 max-w-sm">
              Scan to schedule home collection, integrate your Google Calendar, or inspect your 90-day biological cortisol scrubber.
            </p>

            {/* Gemini Hackathon Signature Badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 max-w-md w-full space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg">✦</span>
                <span className="text-xs font-black text-blue-900">
                  Google Gemini Developer Challenge 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Architected with <strong>Google Gemini 3.6 Flash</strong>, Google Calendar API, and Google Cloud HIPAA Enclaves. Designed to bridge clinical endocrinology with daily workplace workflow automation.
              </p>
              <div className="pt-1 text-[10px] font-mono text-slate-400">
                AI Architect: Amith Paruchuri • amithparuchuri@baalance.in
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 text-[10px] text-slate-400 space-y-1">
            <p>
              BAALANCE provides biological wellness insights based on hair cortisol. It is not a diagnostic test and does not replace medical advice. Prototype edition, 2026.
            </p>
            <p className="font-mono text-slate-300">
              ✦ Built for the Google DeepMind & Gemini API Global Hackathon
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
