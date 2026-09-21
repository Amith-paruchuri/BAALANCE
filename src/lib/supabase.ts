import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nyxivqlpikoffdopfmei.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getEffectiveSupabaseAnonKey(): string {
  if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY !== 'demo-placeholder-anon-key') {
    return SUPABASE_ANON_KEY;
  }
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('baalance_supabase_anon_key');
    if (local && local.length > 20) return local;
  }
  return '';
}

export function hasValidSupabaseCredentials(): boolean {
  const key = getEffectiveSupabaseAnonKey();
  return Boolean(key && key.length > 20 && key !== 'demo-placeholder-anon-key');
}

export function getSupabaseClient(): SupabaseClient | null {
  const effectiveKey = getEffectiveSupabaseAnonKey();
  const anonKey = effectiveKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(SUPABASE_PROJECT_URL, anonKey, {
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

/**
 * Initiates actual Google OAuth authentication via Supabase.
 * If credentials and provider are active, redirects the browser to accounts.google.com.
 */
export async function signInWithGoogle(redirectTo?: string): Promise<{
  success: boolean;
  error?: string;
  url?: string;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client could not be initialized.' };
  }

  try {
    const targetRedirect = redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/` : undefined);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetRedirect,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.url && typeof window !== 'undefined') {
      // Browser navigation to Google OAuth provider endpoint
      window.location.href = data.url;
      return { success: true, url: data.url };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to initialize Google authentication.' };
  }
}

/**
 * Cleanly signs out the user from Supabase and active local session.
 */
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
