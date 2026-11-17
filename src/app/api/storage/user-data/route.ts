import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRequestUser } from '@/lib/serverAuth';
import { SUPABASE_PROJECT_URL } from '@/lib/supabase';
import { AUDIT_TABLE, readAudit, writeAudit } from '@/lib/auditServer';

export const dynamic = 'force-dynamic';

/**
 * Data controls for the signed-in user.
 *   GET    exports everything BAALANCE stores about them as one JSON file.
 *   DELETE removes it. Row-level security limits both to the user's own rows.
 */

export async function GET(req: NextRequest) {
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Sign in to export your data.' }, { status: 401 });

  try {
    const [profile, hair, telemetry] = await Promise.all([
      auth.supabase.from('baalance_profiles').select('*').eq('email', auth.email).maybeSingle(),
      auth.supabase.from('baalance_hair_cortisol').select('*').eq('user_email', auth.email),
      auth.supabase.from('baalance_telemetry_sync').select('*').eq('user_email', auth.email),
    ]);
    await writeAudit(auth, 'data_exported');
    const activity = await readAudit(auth, 1000);

    const payload = {
      exportedAt: new Date().toISOString(),
      account: { email: auth.email, userId: auth.user.id },
      profile: profile.data || null,
      hairCortisolResults: hair.data || [],
      calendarSummaries: telemetry.data || [],
      activityLog: activity || [],
      note: 'This is everything BAALANCE stores about you on its servers. Calendar event titles and secret calendar links are never stored.',
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="baalance-data-${new Date().toISOString().slice(0, 10)}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('[BAALANCE Data] Export failed:', err?.message);
    return NextResponse.json({ error: 'Could not export your data.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Sign in to delete your data.' }, { status: 401 });

  const failures: string[] = [];
  const remove = async (table: string, column: string, value: string) => {
    try {
      const { error } = await auth.supabase.from(table).delete().eq(column, value);
      // A missing table (migration not run yet) is not a failure to delete data.
      if (error && !/does not exist|schema cache/i.test(error.message)) failures.push(table);
    } catch {
      failures.push(table);
    }
  };

  await remove('baalance_hair_cortisol', 'user_email', auth.email);
  await remove('baalance_telemetry_sync', 'user_email', auth.email);
  await remove(AUDIT_TABLE, 'user_id', auth.user.id);
  await remove('baalance_profiles', 'email', auth.email);

  if (failures.length > 0) {
    return NextResponse.json(
      { success: false, error: 'Some data could not be deleted. Please try again or write to us.', failed: failures },
      { status: 500 }
    );
  }

  // Remove the sign-in account as well when the server has the service role key.
  let accountDeleted = false;
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (serviceKey) {
    try {
      const admin = createClient(SUPABASE_PROJECT_URL, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await admin.auth.admin.deleteUser(auth.user.id);
      accountDeleted = !error;
    } catch {
      accountDeleted = false;
    }
  }

  return NextResponse.json({ success: true, accountDeleted });
}
