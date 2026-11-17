import { createClient, SupabaseClient } from '@supabase/supabase-js';

// The anon key is a public, browser-safe key. Data is protected by row-level security
// policies in Supabase (see supabase/migrations), not by keeping this key secret.
export const SUPABASE_PROJECT_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nyxivqlpikoffdopfmei.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eGl2cWxwaWtvZmZkb3BmbWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3OTg1ODIsImV4cCI6MjEwNDM3NDU4Mn0.ahMzFVHLBN67T3PaTyabfASXbimJQQMuU_dudXkj24o';

let supabaseInstance: SupabaseClient | null = null;

export function getEffectiveSupabaseAnonKey(): string {
  return SUPABASE_ANON_KEY;
}

export function hasValidSupabaseCredentials(): boolean {
  return Boolean(SUPABASE_PROJECT_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: typeof window !== 'undefined',
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.warn('[BAALANCE Supabase] Initialization warning:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export type OAuthProvider = 'google' | 'azure';

/** Calendar scopes requested at sign-in so the app can read meetings and propose reschedules. */
const PROVIDER_SCOPES: Record<OAuthProvider, string> = {
  google: 'https://www.googleapis.com/auth/calendar.events',
  azure: 'openid email profile offline_access User.Read Calendars.ReadWrite',
};

/**
 * Starts a real OAuth sign-in through Supabase with Google or Microsoft (Entra ID / Outlook).
 * The browser is redirected to the provider and returns to the app with a session.
 */
export async function signInWithProvider(
  provider: OAuthProvider,
  redirectTo?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Sign-in service could not be initialised.' };

  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('baalance_oauth_in_flight', 'true');
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/` : undefined),
        scopes: PROVIDER_SCOPES[provider],
        queryParams:
          provider === 'google'
            ? { access_type: 'offline', prompt: 'consent select_account' }
            : { prompt: 'select_account' },
      },
    });
    if (error) {
      if (typeof window !== 'undefined') sessionStorage.removeItem('baalance_oauth_in_flight');
      return { success: false, error: error.message };
    }
    if (data?.url && typeof window !== 'undefined') {
      window.location.href = data.url;
    }
    return { success: true };
  } catch (err: any) {
    if (typeof window !== 'undefined') sessionStorage.removeItem('baalance_oauth_in_flight');
    return { success: false, error: err?.message || 'Could not start sign-in.' };
  }
}

/** Kept for existing callers. */
export function signInWithGoogle(redirectTo?: string) {
  return signInWithProvider('google', redirectTo);
}

export function signInWithMicrosoft(redirectTo?: string) {
  return signInWithProvider('azure', redirectTo);
}

/** Email and password sign-in, verified by Supabase Auth. */
export async function signInWithEmailPassword(email: string, password: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false as const, error: 'Sign-in service could not be initialised.' };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return { ok: false as const, error: error?.message === 'Invalid login credentials'
      ? 'Wrong email or password.'
      : error?.message || 'Could not sign in.' };
  }
  return { ok: true as const, session: data.session };
}

/**
 * Email and password sign-up. If the Supabase project requires email confirmation,
 * no session is returned and the user must confirm from their inbox first.
 */
export async function signUpWithEmailPassword(email: string, password: string, fullName: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false as const, error: 'Sign-up service could not be initialised.' };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
    },
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, session: data.session, needsConfirmation: !data.session };
}

/**
 * The calendar access token issued by Google or Microsoft at sign-in, if any.
 * Supabase exposes it only on the session created right after the OAuth redirect.
 */
export async function getProviderCalendarToken(): Promise<{ provider: OAuthProvider; token: string } | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  const providerName = session?.user?.app_metadata?.provider as string | undefined;
  const token = session?.provider_token;
  if (session && token && (providerName === 'google' || providerName === 'azure')) {
    try {
      sessionStorage.setItem('baalance_provider_token', JSON.stringify({ provider: providerName, token, at: Date.now() }));
    } catch {}
    return { provider: providerName, token };
  }
  try {
    const cached = JSON.parse(sessionStorage.getItem('baalance_provider_token') || 'null');
    // Provider access tokens last about an hour.
    if (cached?.token && Date.now() - cached.at < 55 * 60 * 1000) {
      return { provider: cached.provider, token: cached.token };
    }
  } catch {}
  return null;
}

/** Signs the user out of Supabase and clears this browser's session data. */
export async function signOutUser(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('baalance_active_user_email');
    sessionStorage.clear();
  }
}

export const isDemoEvaluationMode = (): boolean => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('baalance_demo_bypass');
    if (stored !== null) return stored === 'true';
  }
  return true;
};

export const setDemoEvaluationMode = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('baalance_demo_bypass', String(enabled));
  }
};
