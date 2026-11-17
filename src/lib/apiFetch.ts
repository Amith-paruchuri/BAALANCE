import { getSupabaseClient } from './supabase';

/**
 * fetch() for the app's own /api routes. Attaches the signed-in user's Supabase
 * access token so the server can verify who is calling. Demo visitors have no
 * session and are sent without a token.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
  } catch {
    // No session available: send the request anonymously.
  }
  return fetch(input, { ...init, headers });
}
