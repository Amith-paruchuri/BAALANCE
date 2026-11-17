import type { RequestUser } from './serverAuth';
import type { AuditAction, AuditEntry } from './auditLog';

export const AUDIT_TABLE = 'baalance_audit_log';

function cleanDetail(detail: unknown): Record<string, string | number | boolean | null> | null {
  if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return null;
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(detail as Record<string, unknown>).slice(0, 12)) {
    if (value === null || typeof value === 'number' || typeof value === 'boolean') out[key.slice(0, 40)] = value;
    else if (typeof value === 'string') out[key.slice(0, 40)] = value.slice(0, 200);
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Appends one row to the signed-in user's activity log. Row-level security
 * limits each user to their own rows. Never throws: a logging failure (for
 * example the table has not been created yet) must not break the action.
 */
export async function writeAudit(
  auth: RequestUser,
  action: AuditAction,
  opts: { provider?: string | null; eventRef?: string | null; detail?: unknown } = {}
): Promise<boolean> {
  try {
    const { error } = await auth.supabase.from(AUDIT_TABLE).insert({
      user_id: auth.user.id,
      user_email: auth.email,
      action,
      provider: opts.provider ? String(opts.provider).slice(0, 40) : null,
      event_ref: opts.eventRef ? String(opts.eventRef).slice(0, 300) : null,
      detail: cleanDetail(opts.detail),
    });
    if (error) {
      console.warn('[BAALANCE Audit] Could not write audit row:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[BAALANCE Audit] Could not write audit row:', err?.message || err);
    return false;
  }
}

/** Latest rows for the signed-in user, or null when the table is not available. */
export async function readAudit(auth: RequestUser, limit = 100): Promise<AuditEntry[] | null> {
  try {
    const { data, error } = await auth.supabase
      .from(AUDIT_TABLE)
      .select('id, action, provider, event_ref, detail, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return null;
    return data.map((row: any) => ({
      id: row.id,
      action: row.action,
      provider: row.provider,
      eventRef: row.event_ref,
      detail: row.detail,
      createdAt: row.created_at,
      source: 'server' as const,
    }));
  } catch {
    return null;
  }
}
