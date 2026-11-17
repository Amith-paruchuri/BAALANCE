import { NextRequest, NextResponse } from 'next/server';
import { getISTDateInfo } from '@/lib/istTime';
import { getSupabaseClient } from '@/lib/supabase';
import { clientIp, rateLimit } from '@/lib/serverAuth';

/**
 * Records a waitlist signup. Insert-only: entries can be read only from the
 * Supabase dashboard, never through this API.
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(`waitlist:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const { email, name, device, source } = await req.json();
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const now = new Date();
    const ist = getISTDateInfo(now);
    const timestampIST = `${ist.year}-${String(ist.monthNum).padStart(2, '0')}-${String(ist.date).padStart(2, '0')} ${ist.time12h} IST`;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Waitlist is unavailable right now.' }, { status: 503 });
    }

    const { error } = await supabase.from('baalance_leads').insert({
      email: cleanEmail,
      full_name: typeof name === 'string' ? name.trim().slice(0, 120) : cleanEmail.split('@')[0],
      source: typeof source === 'string' ? source.slice(0, 80) : 'wearable_waitlist',
      device_preference: typeof device === 'string' ? device.slice(0, 80) : null,
      submitted_at_ist: timestampIST,
    });

    // A duplicate email means they are already on the list, which is fine.
    if (error && !String(error.code).startsWith('23')) {
      console.error('[BAALANCE Waitlist] Insert failed:', error.message);
      return NextResponse.json({ error: 'Could not join the waitlist. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `You're on the waitlist for ${typeof device === 'string' && device ? device : 'wearables'}.`,
    });
  } catch {
    return NextResponse.json({ error: 'Could not join the waitlist.' }, { status: 500 });
  }
}
