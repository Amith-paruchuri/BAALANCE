import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, hasValidSupabaseCredentials } from '@/lib/supabase';
import { UserProfile, HairCortisolSegment, WeeklyTelemetry } from '@/lib/types';

import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), 'baalance_user_store.json');

function loadStoreFromFile(): Map<string, {
  profile: UserProfile;
  segments?: HairCortisolSegment[];
  telemetry?: WeeklyTelemetry[];
  updatedAt: string;
}> {
  const map = new Map<string, any>();
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      for (const [k, v] of Object.entries(parsed)) {
        map.set(k, v);
      }
    }
  } catch (e) {
    console.warn('[BAALANCE File Storage] Read notice:', e);
  }
  return map;
}

function saveStoreToFile(map: Map<string, any>) {
  try {
    const obj: Record<string, any> = {};
    map.forEach((v, k) => {
      obj[k] = v;
    });
    fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[BAALANCE File Storage] Write notice:', e);
  }
}

// In-memory server cache initialized from persistent file store
const serverProfileStore = loadStoreFromFile();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, segments, telemetry } = body;

    if (!profile || !profile.email) {
      return NextResponse.json({ error: 'Valid profile with email is required' }, { status: 400 });
    }

    const email = profile.email.toLowerCase().trim();
    const now = new Date().toISOString();

    // 1. Cache on server side and persist to file
    serverProfileStore.set(email, {
      profile,
      segments,
      telemetry,
      updatedAt: now,
    });
    saveStoreToFile(serverProfileStore);

    let supabasePersisted = false;
    let supabaseError: string | null = null;

    // 2. Persist to Supabase if valid credentials are configured
    if (hasValidSupabaseCredentials()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { error: profileError } = await supabase
            .from('baalance_profiles')
            .upsert({
              email,
              full_name: profile.name || 'User',
              role: profile.role,
              sector: profile.sector,
              is_custom_role: profile.isCustomRole || false,
              age: profile.age || 32,
              biological_sex: profile.biologicalSex || 'male',
              is_pregnant: profile.isPregnant || false,
              health_conditions: profile.healthConditions || ['none'],
              medications: profile.medications || ['none'],
              weekly_hours: profile.weeklyHours || 65,
              chronotype: profile.chronotype || 'morning_lark',
              nightly_sleep_hours: profile.nightlySleepHours || 6.0,
              sleep_quality: profile.sleepQuality || 'middle_night_awakenings',
              work_boundary_bleed: profile.workBoundaryBleed || 'always_on_bed',
              stress_drivers: profile.stressDrivers || ['evening_meetings', 'sleep_debt'],
              is_demo: profile.isDemo || false,
              updated_at: now,
            }, { onConflict: 'email' });

          if (profileError) {
            supabaseError = profileError.message;
          } else {
            supabasePersisted = true;

            // Upsert hair cortisol segments to Supabase
            if (segments && segments.length >= 3) {
              const seg1 = segments.find((s: any) => s.id === 1);
              const seg2 = segments.find((s: any) => s.id === 2);
              const seg3 = segments.find((s: any) => s.id === 3);
              await supabase
                .from('baalance_hair_cortisol')
                .upsert({
                  user_email: email,
                  month1_root_pg_mg: seg1?.cortisolPgPerMg || 15.6,
                  month2_mid_shaft_pg_mg: seg2?.cortisolPgPerMg || 28.4,
                  month3_tip_pg_mg: seg3?.cortisolPgPerMg || 11.2,
                  reference_baseline_pg_mg: 11.0,
                }, { onConflict: 'user_email' });
            }

            // Upsert calendar telemetry to Supabase
            if (telemetry && telemetry.length > 0) {
              const totalMeetings = telemetry.reduce((sum: number, item: any) => sum + item.meetingHours, 0);
              const totalCalls = telemetry.reduce((sum: number, item: any) => sum + item.eveningCalls, 0);
              const totalFlights = telemetry.reduce((sum: number, item: any) => sum + item.flightShifts, 0);
              await supabase
                .from('baalance_telemetry_sync')
                .upsert({
                  user_email: email,
                  calendar_email: email,
                  is_calendar_verified: true,
                  total_meeting_hours: totalMeetings,
                  evening_calls_count: totalCalls,
                  cross_timezone_flights: totalFlights,
                  updated_at: now,
                }, { onConflict: 'user_email' });
            }
          }
        } catch (dbErr: any) {
          supabaseError = dbErr?.message || 'Database write exception';
        }
      }
    }

    return NextResponse.json({
      success: true,
      email,
      storedAt: now,
      supabasePersisted,
      supabaseStatus: supabasePersisted
        ? 'Connected & Synchronized'
        : hasValidSupabaseCredentials()
        ? `Supabase write pending: ${supabaseError}`
        : 'Active (Local & Next.js Store)',
    });
  } catch (err: any) {
    console.error('[BAALANCE Storage API] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Try Supabase first if credentials exist
    if (hasValidSupabaseCredentials()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('baalance_profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (data && !error) {
          return NextResponse.json({
            found: true,
            source: 'supabase',
            profile: {
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
              isDemo: data.is_demo,
            },
          });
        }
      }
    }

    // Fallback to server cache
    if (serverProfileStore.has(email)) {
      const cached = serverProfileStore.get(email)!;
      return NextResponse.json({
        found: true,
        source: 'server_cache',
        profile: cached.profile,
        segments: cached.segments,
        telemetry: cached.telemetry,
        updatedAt: cached.updatedAt,
      });
    }

    return NextResponse.json({ found: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
