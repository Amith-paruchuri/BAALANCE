import { apiFetch } from './apiFetch';

/**
 * Activity log: every approval, decline and calendar change, plus safety and
 * data-control events. Signed-in users get a server-side record in Supabase
 * (table baalance_audit_log, own rows only). Demo visitors get a local record
 * in their browser so the log is still visible in the guest demo.
 */

export type AuditAction =
  | 'reschedule_approved'
  | 'reschedule_declined'
  | 'organizer_email_prepared'
  | 'calendar_moved'
  | 'calendar_move_failed'
  | 'calendar_connected'
  | 'pss10_completed'
  | 'crisis_escalation'
  | 'content_blocked'
  | 'data_exported'
  | 'data_deleted';

/** Actions the browser may report. Calendar moves and safety events are written by the server only. */
export const CLIENT_AUDIT_ACTIONS: AuditAction[] = [
  'reschedule_approved',
  'reschedule_declined',
  'organizer_email_prepared',
  'calendar_connected',
  'pss10_completed',
];

export interface AuditEntry {
  id: string;
  action: AuditAction;
  provider?: string | null;
  /** Calendar event id, when the action is about one meeting. Titles are not stored. */
  eventRef?: string | null;
  detail?: Record<string, string | number | boolean | null> | null;
  createdAt: string;
  source: 'server' | 'local';
}

export const AUDIT_LABEL: Record<AuditAction, string> = {
  reschedule_approved: 'You approved a suggested change',
  reschedule_declined: 'You declined the suggested changes',
  organizer_email_prepared: 'Request to the organiser prepared',
  calendar_moved: 'Meeting moved in your calendar',
  calendar_move_failed: 'Calendar change failed',
  calendar_connected: 'Calendar connected',
  pss10_completed: 'PSS-10 questionnaire completed',
  crisis_escalation: 'Safety check showed help guidance',
  content_blocked: 'Safety check blocked a message',
  data_exported: 'You exported your data',
  data_deleted: 'You deleted your data',
};

const LOCAL_KEY = 'baalance_audit_log';
const MAX_LOCAL = 200;

function readLocal(): AuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearLocalAudit() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {}
}

/** Records an action locally and, for signed-in users, on the server. Never throws. */
export function recordAudit(
  action: AuditAction,
  opts: { provider?: string; eventRef?: string; detail?: AuditEntry['detail'] } = {}
): void {
  if (typeof window === 'undefined') return;
  const entry: AuditEntry = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    provider: opts.provider || null,
    eventRef: opts.eventRef || null,
    detail: opts.detail || null,
    createdAt: new Date().toISOString(),
    source: 'local',
  };
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([entry, ...readLocal()].slice(0, MAX_LOCAL)));
    window.dispatchEvent(new Event('baalance-audit-updated'));
  } catch {}

  if (CLIENT_AUDIT_ACTIONS.includes(action)) {
    apiFetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, provider: entry.provider, eventRef: entry.eventRef, detail: entry.detail }),
    }).catch(() => {});
  }
}

/** Server log for signed-in users, otherwise the local log. */
export async function loadAudit(): Promise<{ entries: AuditEntry[]; source: 'server' | 'local' }> {
  try {
    const res = await apiFetch('/api/audit');
    if (res.ok) {
      const data = await res.json();
      if (data?.available && Array.isArray(data.entries)) {
        return { entries: data.entries as AuditEntry[], source: 'server' };
      }
    }
  } catch {}
  return { entries: readLocal(), source: 'local' };
}
