import { NextRequest } from 'next/server';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY } from './supabase';

export interface RequestUser {
  user: User;
  email: string;
  /** Supabase client acting as this user, so row-level security applies. */
  supabase: SupabaseClient;
}

function bearerToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Verifies the Supabase access token sent by the browser and returns the signed-in user.
 * Returns null for anonymous requests or invalid / expired tokens.
 */
export async function getRequestUser(req: NextRequest): Promise<RequestUser | null> {
  const token = bearerToken(req);
  if (!token) return null;

  const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.email) return null;
    return { user: data.user, email: data.user.email.toLowerCase(), supabase };
  } catch {
    return null;
  }
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Small in-memory rate limiter. On serverless hosting each instance keeps its own counts,
 * so this is a speed bump against abuse of the AI endpoints, not a hard quota.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/**
 * Allows signed-in users freely and anonymous demo visitors up to `anonLimit` calls per hour.
 * Returns the user (or null for an allowed anonymous call), or 'limited' when blocked.
 */
export async function userOrDemoQuota(
  req: NextRequest,
  routeKey: string,
  anonLimit = 20
): Promise<RequestUser | null | 'limited'> {
  const user = await getRequestUser(req);
  if (user) {
    return rateLimit(`${routeKey}:user:${user.user.id}`, 300, 60 * 60 * 1000) ? user : 'limited';
  }
  return rateLimit(`${routeKey}:ip:${clientIp(req)}`, anonLimit, 60 * 60 * 1000) ? null : 'limited';
}
