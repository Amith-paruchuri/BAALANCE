import { NextResponse } from 'next/server';
import { getAIStatus, azureIsPrimary } from '@/lib/ai';
import { getSafetyStatus } from '@/lib/contentSafety';
import { evidenceBackend, EVIDENCE } from '@/lib/evidence';
import { foundryStatus } from '@/lib/foundryAgent';
import { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Which services this deployment is actually using. No secrets: only whether
 * each one is configured. The "Built on Microsoft Azure" page reads this, so
 * what it shows is always the real state of the running app.
 */
export async function GET() {
  const ai = getAIStatus();
  const safety = getSafetyStatus();

  let signIn: { microsoft: boolean; google: boolean; email: boolean } | null = null;
  try {
    const res = await fetch(`${SUPABASE_PROJECT_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY }, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      signIn = { microsoft: !!data?.external?.azure, google: !!data?.external?.google, email: !!data?.external?.email };
    }
  } catch {}

  const foundry = await foundryStatus();

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    azureOpenAI: { on: ai.provider === 'azure', model: ai.provider === 'azure' ? ai.model : null },
    agent: { on: azureIsPrimary() || foundry.on, tools: 6 },
    foundryAgent: { on: foundry.on, configured: foundry.configured, name: foundry.on ? foundry.agent : null, version: foundry.version },
    contentSafety: { on: safety.azureContentSafety },
    promptShields: { on: safety.promptShields },
    grounding: { on: true, backend: evidenceBackend(), passages: EVIDENCE.length },
    maps: { on: !!(process.env.AZURE_MAPS_KEY || '').trim() },
    entraSignIn: { on: !!signIn?.microsoft },
    graphCalendar: { on: !!signIn?.microsoft },
    mcp: { on: true, path: '/api/mcp' },
  });
}
