import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser, rateLimit } from '@/lib/serverAuth';
import { CLIENT_AUDIT_ACTIONS, type AuditAction } from '@/lib/auditLog';
import { readAudit, writeAudit } from '@/lib/auditServer';

export const dynamic = 'force-dynamic';

/**
 * Activity log for the signed-in user: approvals, declines, calendar changes,
 * safety events and data-control actions. Demo visitors keep a local log in
 * their browser instead.
 */

export async function GET(req: NextRequest) {
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ available: false, entries: [] }, { status: 401 });
  const entries = await readAudit(auth);
  return NextResponse.json({ available: entries !== null, entries: entries || [] });
}

export async function POST(req: NextRequest) {
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ recorded: false }, { status: 401 });
  if (!rateLimit(`audit:user:${auth.user.id}`, 300, 60 * 60 * 1000)) {
    return NextResponse.json({ recorded: false }, { status: 429 });
  }

  try {
    const body = await req.json();
    const action = body?.action as AuditAction;
    if (!CLIENT_AUDIT_ACTIONS.includes(action)) {
      return NextResponse.json({ recorded: false, error: 'Unknown action.' }, { status: 400 });
    }
    const recorded = await writeAudit(auth, action, {
      provider: body.provider,
      eventRef: body.eventRef,
      detail: body.detail,
    });
    return NextResponse.json({ recorded });
  } catch {
    return NextResponse.json({ recorded: false }, { status: 400 });
  }
}
