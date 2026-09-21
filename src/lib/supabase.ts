import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nyxivqlpikoffdopfmei.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function hasValidSupabaseCredentials(): boolean {
  return Boolean(SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY !== 'demo-placeholder-anon-key');
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseInstance) {
    // Only initialize with real credentials to avoid invalid HTTP error storms
    const anonKey = hasValidSupabaseCredentials() ? SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';
    try {
      supabaseInstance = createClient(SUPABASE_PROJECT_URL, anonKey, {
        auth: {
          persistSession: typeof window !== 'undefined',
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('[BAALANCE Supabase] Initialization warning:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export const isDemoEvaluationMode = (): boolean => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('baalance_demo_bypass');
    if (stored !== null) return stored === 'true';
  }
  return true; // Default to seamless demo evaluation bypass
};

export const setDemoEvaluationMode = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('baalance_demo_bypass', String(enabled));
  }
};
