import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/serverAuth';

/**
 * Per-user storage for profile, hair cortisol segments and calendar telemetry.
 * Requires a signed-in user. The email always comes from the verified session,
 * never from the request, and Supabase row-level security limits each user to
 * their own rows.
 */

export async function POST(req: NextRequest) {
  const auth = await getRequestUser(req);
  if (!auth) {
    return NextResponse.json({ error: 'Sign in to save your data.' }, { status: 401 });
  }

  try {
    const { profile, segments, telemetry } = await req.json();
    if (!profile || typeof profile !== 'object') {
      return NextResponse.json({ error: 'Profile is required.' }, { status: 400 });
    }

    const email = auth.email;
    const now = new Date().toISOString();
    // Never store a calendar secret link on the server.
    const { calendarIcalUrl: _omit, ...safeProfile } = profile;
    const cleanProfile = { ...safeProfile, email, isDemo: false };

    const { error: profileError } = await auth.supabase.from('baalance_profiles').upsert(
      {
        email,
        user_id: auth.user.id,
        full_name: cleanProfile.name || email.split('@')[0],
        role: cleanProfile.role,
        sector: cleanProfile.sector,
        is_custom_role: cleanProfile.isCustomRole || false,
        age: cleanProfile.age ?? null,
        biological_sex: cleanProfile.biologicalSex || null,
        is_pregnant: cleanProfile.isPregnant || false,
        health_conditions: cleanProfile.healthConditions || ['none'],
        medications: cleanProfile.medications || ['none'],
        weekly_hours: cleanProfile.weeklyHours ?? null,
        chronotype: cleanProfile.chronotype || null,
        nightly_sleep_hours: cleanProfile.nightlySleepHours ?? null,
        sleep_quality: cleanProfile.sleepQuality || null,
        work_boundary_bleed: cleanProfile.workBoundaryBleed || null,
        stress_drivers: cleanProfile.stressDrivers || [],
        is_demo: false,
        bundle: { profile: cleanProfile, segments: segments || null, telemetry: telemetry || null },
        updated_at: now,
      },
      { onConflict: 'email' }
    );

    if (profileError) {
      console.error('[BAALANCE Storage] Profile write failed:', profileError.message);
      return NextResponse.json({ success: false, error: 'Could not save your data. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, email, storedAt: now, supabasePersisted: true });
  } catch (err: any) {
    console.error('[BAALANCE Storage] Error:', err?.message);
    return NextResponse.json({ error: 'Could not save your data.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await getRequestUser(req);
  if (!auth) {
    return NextResponse.json({ error: 'Sign in to load your data.' }, { status: 401 });
  }

  try {
    const { data, error } = await auth.supabase
      .from('baalance_profiles')
      .select('*')
      .eq('email', auth.email)
      .maybeSingle();

    if (error || !data) return NextResponse.json({ found: false });

    const bundle = data.bundle || {};
    const profile = bundle.profile || {
      name: data.full_name,
      email: data.email,
      role: data.role,
      sector: data.sector,
      isCustomRole: data.is_custom_role,
      age: data.age,
      biologicalSex: data.biological_sex,
      isPregnant: data.is_pregnant,
      healthConditions: data.health_conditions,
      medications: data.medications,
      weeklyHours: data.weekly_hours,
      chronotype: data.chronotype,
      nightlySleepHours: data.nightly_sleep_hours,
      sleepQuality: data.sleep_quality,
      workBoundaryBleed: data.work_boundary_bleed,
      stressDrivers: data.stress_drivers,
      isDemo: false,
    };

    return NextResponse.json({
      found: true,
      source: 'supabase',
      profile: { ...profile, email: auth.email },
      segments: bundle.segments || undefined,
      telemetry: bundle.telemetry || undefined,
      updatedAt: data.updated_at,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Could not load your data.' }, { status: 500 });
  }
}
