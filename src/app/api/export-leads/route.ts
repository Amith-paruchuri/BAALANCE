import { NextRequest, NextResponse } from 'next/server';
import { getAllConsolidatedLeads } from '@/lib/leadsService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format');
  const leads = getAllConsolidatedLeads();
  const dateStamp = new Date().toISOString().split('T')[0];

  // If CSV format requested or downloaded directly
  if (format === 'csv') {
    const headers = ['Email', 'Full Name', 'Source / Intake Type', 'Device / Role Preference', 'Sector', 'Submitted At (IST)', 'Status'];
    const rows = leads.map(l => {
      const escape = (val?: string) => `"${(val || '').replace(/"/g, '""')}"`;
      return [
        escape(l.email),
        escape(l.name),
        escape(l.source),
        escape(l.deviceOrRole),
        escape(l.sector || 'General'),
        escape(l.submittedAtIST),
        escape(l.status),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="baalance_user_leads_${dateStamp}.csv"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  // If JSON format requested
  if (format === 'json') {
    return NextResponse.json({
      success: true,
      totalCount: leads.length,
      exportedAtIST: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
      leads,
    });
  }

  // Default: Render an executive, mobile-responsive HTML dashboard with direct 1-click Excel CSV download
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BAALANCE • Registered Users & Beta Waitlist</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-[#F8FAFC] text-slate-900 min-h-screen p-4 sm:p-8">
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header Card -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Live System Ledger</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-black tracking-tight">
          User Submissions & Wearables Beta Leads
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Consolidated database of all registered accounts, intake profiles, and wearable waitlist submissions.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <a href="/api/export-leads?format=csv" class="px-5 py-2.5 rounded-xl bg-[#3186FF] hover:bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>Download Excel (.CSV)</span>
        </a>
        <a href="/" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all">
          ← Back to App
        </a>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-xs font-semibold text-slate-400">Total User Records</span>
        <p class="text-2xl sm:text-3xl font-black text-black mt-1">${leads.length}</p>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-xs font-semibold text-slate-400">Database Status</span>
        <p class="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">Active</p>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
        <span class="text-xs font-semibold text-slate-400">Format Compatibility</span>
        <p class="text-base sm:text-lg font-bold text-slate-700 mt-2">Excel • Sheets • CSV</p>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-base font-bold text-black">All Submitted Leads (${leads.length})</h2>
        <span class="text-xs text-slate-400 font-mono">Updated in real-time</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-4">#</th>
              <th class="py-3.5 px-4">Email Address</th>
              <th class="py-3.5 px-4">Name / Account</th>
              <th class="py-3.5 px-4">Source / Type</th>
              <th class="py-3.5 px-4">Role / Device</th>
              <th class="py-3.5 px-4">Submitted At (IST)</th>
              <th class="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            ${leads.map((lead, idx) => `
              <tr class="hover:bg-blue-50/40 transition-colors">
                <td class="py-3 px-4 font-mono text-slate-400">${idx + 1}</td>
                <td class="py-3 px-4 font-bold text-black">${lead.email}</td>
                <td class="py-3 px-4">${lead.name}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    lead.source.includes('Waitlist') ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
                  }">
                    ${lead.source}
                  </span>
                </td>
                <td class="py-3 px-4 text-slate-600">${lead.deviceOrRole}</td>
                <td class="py-3 px-4 font-mono text-slate-500 text-[11px]">${lead.submittedAtIST}</td>
                <td class="py-3 px-4">
                  <span class="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ${lead.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
