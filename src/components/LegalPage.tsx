import React from 'react';
import Link from 'next/link';

/** Shared frame for the privacy policy and terms pages. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F2EC] font-sans">
      <header className="border-b border-[#E7E1D8] bg-[#FBF7F2]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="text-lg font-black tracking-tight text-[#0D4F59]">
            BAA<span className="text-[#BF6F4E]">L</span>ANCE
          </Link>
          <nav className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/azure" className="hidden sm:inline hover:text-slate-900">Built on Azure</Link>
            <Link href="/" className="px-3 py-1.5 rounded-lg bg-[#0D4F59] text-white hover:bg-[#0B434B]">Open the app</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <article className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 sm:p-10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">Last updated {updated}</div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">{title}</h1>
          <div className="mt-6 space-y-6 text-sm text-slate-700 leading-relaxed [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[#0D4F59] [&_a]:font-semibold [&_a]:underline [&_table]:w-full [&_td]:align-top [&_td]:py-2 [&_td]:pr-3 [&_td]:border-t [&_td]:border-slate-100 [&_th]:text-left [&_th]:text-xs [&_th]:text-slate-500 [&_th]:pb-2 [&_th]:pr-3">
            {children}
          </div>
        </article>
      </main>
    </div>
  );
}
