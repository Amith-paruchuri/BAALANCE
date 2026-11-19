'use client';

import React, { useEffect, useState } from 'react';
import { LegalPage } from '@/components/LegalPage';

interface Status {
  checkedAt: string;
  azureOpenAI: { on: boolean; model: string | null };
  agent: { on: boolean; tools: number };
  multiAgent?: { on: boolean; agents: Array<{ name: string; role: string; version: string | null }> };
  foundryAgent?: { on: boolean; configured: boolean; name: string | null; version: string | null };
  contentSafety: { on: boolean };
  promptShields: { on: boolean };
  grounding: { on: boolean; backend: string; passages: number };
  azureSearch?: { on: boolean; configured: boolean; index: string | null; ranking: string | null };
  maps: { on: boolean };
  entraSignIn: { on: boolean };
  graphCalendar: { on: boolean };
  mcp: { on: boolean; path: string };
}

/**
 * How BAALANCE uses Microsoft Azure, with the live state of each service read
 * from the running app. A service shows as on only when it really is.
 */
export default function AzurePage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setStatus)
      .catch(() => setFailed(true));
  }, []);

  const rows: Array<{ name: string; on: boolean | undefined; what: string; detail?: string }> = [
    {
      name: 'Azure OpenAI in Microsoft Foundry',
      on: status?.azureOpenAI.on,
      what: 'The model behind Tricha, the AI coach, and the reader for uploaded lab reports.',
      detail: status?.azureOpenAI.model ? `Deployment: ${status.azureOpenAI.model}` : undefined,
    },
    {
      name: 'Microsoft Foundry Agent Service',
      on: status?.foundryAgent?.on,
      what: 'Tricha is a hosted agent in our Foundry project. Foundry runs the conversation and decides when to call her tools; each tool runs on our server against your own data, and nothing is written by the agent.',
      detail: status?.foundryAgent?.on
        ? `Agent: ${status.foundryAgent.name}${status.foundryAgent.version ? `, version ${status.foundryAgent.version}` : ''}`
        : status?.foundryAgent?.configured
          ? 'Configured but not reachable right now; replies use the direct Azure OpenAI agent'
          : undefined,
    },
    {
      name: 'Multi-agent workflow on Foundry',
      on: status?.multiAgent?.on,
      what: 'Six agents answer each question together. A lead agent talks to you and consults four specialists (biomarker, calendar, evidence and care) in parallel, and a reviewer agent checks every reply against their briefs and the safety rules before you see it.',
      detail: status?.multiAgent?.on ? status.multiAgent.agents.map(a => a.role).join(', ') : undefined,
    },
    {
      name: 'Tool-using agent (function calling)',
      on: status?.agent.on,
      what: 'Tricha decides which tools to call: your hair results, your calendar load, a single week, the evidence library, helplines, or a hand-off to a screen in the app. Every tool is read-only.',
      detail: status ? `${status.agent.tools} tools` : undefined,
    },
    {
      name: 'Grounded answers (retrieval-augmented generation)',
      on: status?.grounding.on,
      what: 'Claims about the science come from a library of published studies and method notes, and replies list their sources.',
      detail: status ? `${status.grounding.passages} passages, retrieved with ${status.grounding.backend === 'azure-ai-search' ? 'Azure AI Search' : 'the built-in search (Azure AI Search ready)'}` : undefined,
    },
    {
      name: 'Azure AI Search',
      on: status?.azureSearch?.on,
      what: 'Holds the evidence library and finds the passages that answer each question, so Tricha\'s claims about the science come from published sources. The app builds and refreshes the index itself.',
      detail: status?.azureSearch?.on
        ? `Index: ${status.azureSearch.index}${status.azureSearch.ranking ? `, ${status.azureSearch.ranking === 'semantic' ? 'semantic ranking' : 'keyword ranking'}` : ''}`
        : status?.azureSearch?.configured
          ? 'Configured but not reachable right now; the built-in search is used'
          : undefined,
    },
    {
      name: 'Azure AI Content Safety',
      on: status?.contentSafety.on,
      what: 'Screens every message and every reply. A message that suggests crisis gets helpline and emergency information instead of coaching.',
    },
    {
      name: 'Prompt Shields',
      on: status?.promptShields.on,
      what: 'Detects attempts to override the coach\'s instructions before the message reaches the model.',
    },
    {
      name: 'Microsoft Entra ID',
      on: status?.entraSignIn.on,
      what: 'Sign in with any Microsoft account.',
    },
    {
      name: 'Microsoft Graph',
      on: status?.graphCalendar.on,
      what: 'Reads 90 days of Outlook and Teams meetings, and moves a meeting only after you approve that change.',
    },
    {
      name: 'Azure Maps',
      on: status?.maps.on,
      what: 'Lists doctors near you in the Get help panel, after you agree to share your location for that search.',
    },
    {
      name: 'Model Context Protocol (MCP) server',
      on: status?.mcp.on,
      what: 'Other agents, such as one built in Microsoft Foundry, can call BAALANCE\'s public tools: the evidence library and the helpline directory. No personal data is exposed.',
      detail: status ? `Endpoint: ${status.mcp.path}` : undefined,
    },
  ];

  return (
    <LegalPage title="Built on Microsoft Azure" updated="live status below">
      <section>
        <p>
          This page shows which Microsoft services BAALANCE is using right now. Each line is read from the running app, so a service
          is marked on only when it is configured and in use.
        </p>
      </section>

      <section>
        <ul className="!list-none !pl-0 space-y-3">
          {rows.map(row => (
            <li key={row.name} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
              <span
                className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                  row.on === undefined ? 'bg-slate-300 animate-pulse' : row.on ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-sm font-extrabold text-slate-900">{row.name}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      row.on === undefined
                        ? 'bg-white text-slate-500 border-slate-200'
                        : row.on
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {row.on === undefined ? (failed ? 'Unknown' : 'Checking') : row.on ? 'On' : 'Not set up yet'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{row.what}</p>
                {row.detail && <p className="text-[11px] text-slate-500 mt-1">{row.detail}</p>}
              </div>
            </li>
          ))}
        </ul>
        {status && <p className="text-[11px] text-slate-500 mt-3">Checked {new Date(status.checkedAt).toLocaleString('en-IN')}.</p>}
      </section>

      <section>
        <h2>How a message to Tricha is handled</h2>
        <ul>
          <li>Safety first: a built-in crisis check, Azure AI Content Safety and Prompt Shields screen the message.</li>
          <li>The agent on Azure OpenAI looks up your results, your calendar and the evidence library with its tools.</li>
          <li>The reply is screened again before you see it, and its sources are listed under it.</li>
          <li>If the agent suggests a calendar change, it can only offer a button. Nothing moves until you approve it.</li>
        </ul>
      </section>

      <section>
        <h2>Also used</h2>
        <p>Supabase (database and sign-in, with row-level security) and Vercel (hosting).</p>
      </section>
    </LegalPage>
  );
}
