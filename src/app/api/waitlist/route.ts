import { NextRequest, NextResponse } from 'next/server';
import { getISTDateInfo } from '@/lib/istTime';
import { getSupabaseClient, hasValidSupabaseCredentials } from '@/lib/supabase';
import { loadLeadsFromFile, saveLeadsToFile, LeadRecord } from '@/lib/leadsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, device, source, role, sector } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const now = new Date();
    const ist = getISTDateInfo(now);
    const timestampIST = `${ist.year}-${String(ist.monthNum).padStart(2, '0')}-${String(ist.date).padStart(2, '0')} ${ist.time12h} IST`;

    const leads = loadLeadsFromFile();
    const existingIndex = leads.findIndex(l => l.email.toLowerCase() === cleanEmail);

    const leadEntry: LeadRecord = {
      id: existingIndex >= 0 ? leads[existingIndex].id : `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: name?.trim() || (existingIndex >= 0 ? leads[existingIndex].name : cleanEmail.split('@')[0]),
      source: source || 'wearable_oauth_waitlist',
      device: device || (existingIndex >= 0 ? leads[existingIndex].device : 'Apple Watch'),
      role: role || (existingIndex >= 0 ? leads[existingIndex].role : undefined),
      sector: sector || (existingIndex >= 0 ? leads[existingIndex].sector : undefined),
      timestampIST,
      rawTimestamp: now.toISOString(),
    };

    if (existingIndex >= 0) {
      leads[existingIndex] = leadEntry;
    } else {
      leads.unshift(leadEntry);
    }

    saveLeadsToFile(leads);

    // Also persist to Supabase if configured
    if (hasValidSupabaseCredentials()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('baalance_leads').upsert({
            email: cleanEmail,
            full_name: leadEntry.name,
            source: leadEntry.source,
            device_preference: leadEntry.device,
            submitted_at_ist: timestampIST,
            updated_at: now.toISOString(),
          }, { onConflict: 'email' });
        } catch (_) {}
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully joined priority waitlist for ${leadEntry.device || 'wearables'}!`,
      lead: leadEntry,
      totalLeads: leads.length,
    });
  } catch (error: any) {
    console.error('[BAALANCE Waitlist] POST error:', error);
    return NextResponse.json({ error: 'Failed to record waitlist entry' }, { status: 500 });
  }
}

export async function GET() {
  const leads = loadLeadsFromFile();
  return NextResponse.json({
    success: true,
    total: leads.length,
    leads,
  });
}
