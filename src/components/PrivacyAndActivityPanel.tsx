'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Download, Trash2, History, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';
import { AUDIT_LABEL, clearLocalAudit, loadAudit, recordAudit, type AuditEntry } from '@/lib/auditLog';
import type { HairCortisolSegment, UserProfile, WeeklyTelemetry } from '@/lib/types';

interface PrivacyAndActivityPanelProps {
  userProfile: UserProfile;
  segments: HairCortisolSegment[];
  telemetry: WeeklyTelemetry[];
  /** Called after the user's data has been deleted, to sign out and reset the app. */
  onDataDeleted: () => void;
}

function downloadJson(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Removes everything BAALANCE keeps in this browser. */
function clearBrowserData() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.toLowerCase().startsWith('baalance')) keys.push(key);
    }
    keys.forEach(k => localStorage.removeItem(k));
  } catch {}
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function describeDetail(entry: AuditEntry): string {
  const d = entry.detail || {};
  const parts: string[] = [];
  if (entry.provider) parts.push(entry.provider === 'microsoft' ? 'Outlook' : entry.provider === 'google' ? 'Google Calendar' : entry.provider);
  if (typeof d.count === 'number') parts.push(`${d.count} meeting${d.count === 1 ? '' : 's'}`);
  if (typeof d.newStart === 'string') {
    const when = formatWhen(d.newStart);
    if (when) parts.push(`new time ${when}`);
  }
  if (typeof d.score === 'number') parts.push(`score ${d.score} of 40`);
  if (typeof d.error === 'string') parts.push(d.error);
  return parts.join(' · ');
}

export const PrivacyAndActivityPanel: React.FC<PrivacyAndActivityPanelProps> = ({
  userProfile,
  segments,
  telemetry,
  onDataDeleted,
}) => {
  const isDemo = !!userProfile.isDemo;
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [logSource, setLogSource] = useState<'server' | 'local'>('local');
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const refresh = useCallback(() => {
    loadAudit().then(result => {
      setEntries(result.entries);
      setLogSource(result.source);
    });
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('baalance-audit-updated', refresh);
    return () => window.removeEventListener('baalance-audit-updated', refresh);
  }, [refresh]);

  const handleExport = async () => {
    setBusy('export');
    setMessage(null);
    const filename = `baalance-data-${new Date().toISOString().slice(0, 10)}.json`;
    try {
      let text: string | null = null;
      if (!isDemo) {
        const res = await apiFetch('/api/storage/user-data');
        if (res.ok) text = await res.text();
      }
      if (!text) {
        // Demo visitors, or the server copy could not be read: export what this browser holds.
        const { calendarIcalUrl: _omit, ...profile } = userProfile;
        text = JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            source: isDemo ? 'Sample case (fictional demo data)' : 'This browser',
            profile,
            hairCortisolSegments: segments,
            weeklySummaries: telemetry,
            activityLog: entries,
          },
          null,
          2
        );
      }
      downloadJson(filename, text);
      recordAudit('data_exported');
      setMessage({ type: 'ok', text: `Saved as ${filename}.` });
    } catch {
      setMessage({ type: 'error', text: 'Could not export your data. Please try again.' });
    } finally {
      setBusy(null);
      refresh();
    }
  };

  const handleDelete = async () => {
    setBusy('delete');
    setMessage(null);
    try {
      if (!isDemo) {
        const res = await apiFetch('/api/storage/user-data', { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setMessage({ type: 'error', text: data.error || 'Could not delete your data. Please try again.' });
          setBusy(null);
          return;
        }
      }
      clearLocalAudit();
      clearBrowserData();
      setConfirmDelete(false);
      setBusy(null);
      onDataDeleted();
    } catch {
      setMessage({ type: 'error', text: 'Could not delete your data. Please try again.' });
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7 space-y-5" data-testid="privacy-panel">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF6F4E]">Your data belongs to you</div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">Your data and activity</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Export it or delete it at any time. Nothing in your calendar changes without your approval.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={busy !== null}
          className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{busy === 'export' ? 'Preparing...' : 'Export my data'}</span>
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={busy !== null}
          className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete my data</span>
        </button>
      </div>

      {confirmDelete && (
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3" role="alertdialog" aria-label="Confirm delete">
          <p className="text-xs font-semibold text-rose-900">
            {isDemo
              ? 'This clears the sample case data saved in this browser and returns you to the home page.'
              : 'This permanently deletes your profile, hair cortisol results, calendar summaries and activity log from BAALANCE, clears this browser, and signs you out. It cannot be undone.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy !== null}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {busy === 'delete' ? 'Deleting...' : 'Yes, delete everything'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={busy !== null}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className={`text-xs font-semibold ${message.type === 'ok' ? 'text-emerald-700' : 'text-rose-600'}`} role="status">
          {message.text}
        </p>
      )}

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
            <History className="w-4 h-4 text-[#0D4F59]" />
            <span>Activity log</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500">
            {logSource === 'server' ? 'Saved to your account' : 'Saved in this browser'}
          </span>
        </div>

        {entries.length === 0 ? (
          <p className="text-xs text-slate-500 font-medium p-3 rounded-xl bg-slate-50 border border-slate-200">
            Nothing yet. Every approval, decline and calendar change will be listed here.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 max-h-64 overflow-y-auto">
            {entries.slice(0, 50).map(entry => {
              const detail = describeDetail(entry);
              return (
                <li key={entry.id} className="px-3.5 py-2.5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 block">{AUDIT_LABEL[entry.action] || entry.action}</span>
                    {detail && <span className="text-[11px] text-slate-500 block truncate">{detail}</span>}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{formatWhen(entry.createdAt)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
