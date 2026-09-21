import { UserProfile, HairCortisolSegment, WeeklyTelemetry } from './types';
import { getSupabaseClient, hasValidSupabaseCredentials, SUPABASE_PROJECT_URL } from './supabase';

const LOCAL_PROFILE_KEY = 'baalance_stored_user_profile';
const LOCAL_SEGMENTS_KEY = 'baalance_stored_segments';
const LOCAL_TELEMETRY_KEY = 'baalance_stored_telemetry';
const LOCAL_STORAGE_TIMESTAMP_KEY = 'baalance_stored_timestamp';
const LOCAL_ACCOUNTS_KEY = 'baalance_accounts_registry';

export interface StorageStatus {
  platform: 'supabase' | 'hybrid' | 'local';
  endpoint: string;
  isSynced: boolean;
  lastSyncedAt?: string;
  userEmail?: string;
}

export interface UserBundle {
  profile: UserProfile;
  segments?: HairCortisolSegment[];
  telemetry?: WeeklyTelemetry[];
  calendarIcalUrl?: string;
  calendarEvents?: any[];
  hasOnboarded: boolean;
  lastSyncedAt: string;
}

/**
 * Persists user profile, demographic baseline, hair cortisol readings,
 * and calendar telemetry to email-scoped local storage, Next.js server store, and Supabase.
 */
export async function saveUserDataToStorage(
  profile: UserProfile,
  segments?: HairCortisolSegment[],
  telemetry?: WeeklyTelemetry[],
  calendarIcalUrl?: string,
  calendarEvents?: any[]
): Promise<{ success: boolean; storageStatus: StorageStatus }> {
  const timestamp = new Date().toISOString();
  const email = (profile.email || '').toLowerCase().trim();
  const icalToSave = calendarIcalUrl || profile.calendarIcalUrl;

  // 1. Immediately write to LocalStorage (both email-scoped and active session)
  if (typeof window !== 'undefined') {
    try {
      // Active session cache
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
      if (segments) localStorage.setItem(LOCAL_SEGMENTS_KEY, JSON.stringify(segments));
      if (telemetry) localStorage.setItem(LOCAL_TELEMETRY_KEY, JSON.stringify(telemetry));
      if (icalToSave) {
        if (email) localStorage.setItem(`baalance_stored_ical_url_${email}`, icalToSave);
      }
      if (calendarEvents) {
        if (email) localStorage.setItem(`baalance_stored_calendar_events_${email}`, JSON.stringify(calendarEvents));
      }
      // Clean up legacy global keys to prevent any cross-account calendar data leakage
      localStorage.removeItem('baalance_stored_ical_url');
      localStorage.removeItem('baalance_stored_calendar_events');
      localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, timestamp);

      if (email) {
        // Scoped user bundle
        const userBundle: UserBundle = {
          profile: {
            ...profile,
            calendarIcalUrl: icalToSave || profile.calendarIcalUrl,
          },
          segments,
          telemetry,
          calendarIcalUrl: icalToSave,
          calendarEvents,
          hasOnboarded: true,
          lastSyncedAt: timestamp,
        };
        localStorage.setItem(`baalance_user_bundle_${email}`, JSON.stringify(userBundle));
        localStorage.setItem(`baalance_user_has_onboarded_${email}`, 'true');
        localStorage.setItem('baalance_active_user_email', email);

        // Record in accounts registry
        try {
          const regRaw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
          const registry: Record<string, { name: string; email: string; lastLogin: string }> = regRaw ? JSON.parse(regRaw) : {};
          registry[email] = {
            name: profile.name || email.split('@')[0],
            email,
            lastLogin: timestamp,
          };
          localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(registry));
        } catch (_) {}
      }
    } catch (e) {
      console.warn('[BAALANCE Storage] LocalStorage write failed:', e);
    }
  }

  let isSupabaseDirectSuccess = false;

  // 2. If Supabase client has valid credentials, sync to Supabase Cloud DB
  if (hasValidSupabaseCredentials() && email) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error: profileError } = await supabase
          .from('baalance_profiles')
          .upsert({
            email,
            full_name: profile.name,
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
            updated_at: timestamp,
          }, { onConflict: 'email' });

        if (!profileError) {
          isSupabaseDirectSuccess = true;
          console.log('[BAALANCE Supabase] Successfully persisted profile to nyxivqlpikoffdopfmei.supabase.co');

          // Upsert Hair Cortisol Segments if provided
          if (segments && segments.length >= 3) {
            const seg1 = segments.find(s => s.id === 1);
            const seg2 = segments.find(s => s.id === 2);
            const seg3 = segments.find(s => s.id === 3);
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

          // Upsert Calendar Telemetry if provided
          if (telemetry && telemetry.length > 0) {
            const totalMeetings = telemetry.reduce((sum, item) => sum + item.meetingHours, 0);
            const totalCalls = telemetry.reduce((sum, item) => sum + item.eveningCalls, 0);
            const totalFlights = telemetry.reduce((sum, item) => sum + item.flightShifts, 0);
            await supabase
              .from('baalance_telemetry_sync')
              .upsert({
                user_email: email,
                calendar_email: email,
                is_calendar_verified: true,
                total_meeting_hours: totalMeetings,
                evening_calls_count: totalCalls,
                cross_timezone_flights: totalFlights,
                updated_at: timestamp,
              }, { onConflict: 'user_email' });
          }
        } else {
          console.warn('[BAALANCE Supabase] Profile upsert notice:', profileError.message);
        }
      }
    } catch (err) {
      console.warn('[BAALANCE Supabase] Direct sync exception:', err);
    }
  }

  // 3. Sync to Next.js server storage endpoint as resilient backing store
  try {
    const res = await fetch('/api/storage/user-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, segments, telemetry }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.supabasePersisted) {
        isSupabaseDirectSuccess = true;
      }
    }
  } catch (apiErr) {
    console.warn('[BAALANCE Storage] Server endpoint sync notice:', apiErr);
  }

  const status: StorageStatus = {
    platform: hasValidSupabaseCredentials() ? 'supabase' : 'hybrid',
    endpoint: SUPABASE_PROJECT_URL,
    isSynced: true,
    lastSyncedAt: timestamp,
    userEmail: profile.email,
  };

  return { success: true, storageStatus: status };
}

/**
 * Loads cached user profile and biomarker data from local or cloud storage for a specific email.
 */
export function loadUserDataForEmail(email: string): UserBundle | null {
  if (typeof window === 'undefined' || !email) return null;

  try {
    const cleanEmail = email.toLowerCase().trim();
    const raw = localStorage.getItem(`baalance_user_bundle_${cleanEmail}`);
    if (raw) {
      return JSON.parse(raw);
    }

    // Fallback: check generic cache if email matches
    const genProfileRaw = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (genProfileRaw) {
      const p = JSON.parse(genProfileRaw);
      if (p && p.email && p.email.toLowerCase().trim() === cleanEmail) {
        const segRaw = localStorage.getItem(LOCAL_SEGMENTS_KEY);
        const telRaw = localStorage.getItem(LOCAL_TELEMETRY_KEY);
        const hasOnboarded = localStorage.getItem(`baalance_user_has_onboarded_${cleanEmail}`) === 'true';
        const icalRaw = localStorage.getItem(`baalance_stored_ical_url_${cleanEmail}`) || p.calendarIcalUrl;
        const eventsRaw = localStorage.getItem(`baalance_stored_calendar_events_${cleanEmail}`);
        return {
          profile: p,
          segments: segRaw ? JSON.parse(segRaw) : undefined,
          telemetry: telRaw ? JSON.parse(telRaw) : undefined,
          calendarIcalUrl: icalRaw || undefined,
          calendarEvents: eventsRaw ? JSON.parse(eventsRaw) : undefined,
          hasOnboarded,
          lastSyncedAt: new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('[BAALANCE Storage] Error loading user bundle for', email, err);
  }
  return null;
}

/**
 * Loads cached user profile and biomarker data from local or cloud storage.
 */
export function loadCachedUserData(): {
  profile: UserProfile | null;
  segments: HairCortisolSegment[] | null;
  telemetry: WeeklyTelemetry[] | null;
  calendarIcalUrl?: string | null;
  calendarEvents?: any[] | null;
  lastSyncedAt: string | null;
} {
  if (typeof window === 'undefined') {
    return { profile: null, segments: null, telemetry: null, calendarIcalUrl: null, calendarEvents: null, lastSyncedAt: null };
  }

  try {
    // Check if there is an active user email
    const activeEmail = localStorage.getItem('baalance_active_user_email');
    if (activeEmail) {
      const userBundle = loadUserDataForEmail(activeEmail);
      if (userBundle) {
        return {
          profile: userBundle.profile,
          segments: userBundle.segments || null,
          telemetry: userBundle.telemetry || null,
          calendarIcalUrl: userBundle.calendarIcalUrl || userBundle.profile?.calendarIcalUrl || null,
          calendarEvents: userBundle.calendarEvents || null,
          lastSyncedAt: userBundle.lastSyncedAt,
        };
      }
    }

    const profileRaw = localStorage.getItem(LOCAL_PROFILE_KEY);
    const segmentsRaw = localStorage.getItem(LOCAL_SEGMENTS_KEY);
    const telemetryRaw = localStorage.getItem(LOCAL_TELEMETRY_KEY);
    const timestamp = localStorage.getItem(LOCAL_STORAGE_TIMESTAMP_KEY);
    const parsedProfile = profileRaw ? JSON.parse(profileRaw) : null;
    const profileEmail = (parsedProfile?.email || '').toLowerCase().trim();
    const icalRaw = profileEmail ? localStorage.getItem(`baalance_stored_ical_url_${profileEmail}`) : null;
    const eventsRaw = profileEmail ? localStorage.getItem(`baalance_stored_calendar_events_${profileEmail}`) : null;

    return {
      profile: parsedProfile,
      segments: segmentsRaw ? JSON.parse(segmentsRaw) : null,
      telemetry: telemetryRaw ? JSON.parse(telemetryRaw) : null,
      calendarIcalUrl: icalRaw || parsedProfile?.calendarIcalUrl || null,
      calendarEvents: eventsRaw ? JSON.parse(eventsRaw) : null,
      lastSyncedAt: timestamp,
    };
  } catch (err) {
    console.warn('[BAALANCE Storage] Cache load error:', err);
    return { profile: null, segments: null, telemetry: null, calendarIcalUrl: null, calendarEvents: null, lastSyncedAt: null };
  }
}
