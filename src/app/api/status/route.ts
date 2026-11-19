import { NextRequest, NextResponse } from 'next/server';
import { getAIStatus, azureIsPrimary } from '@/lib/ai';
import { getSafetyStatus } from '@/lib/contentSafety';
import { searchStatus, EVIDENCE } from '@/lib/evidence';
import { foundryStatus, probeFoundryAgent } from '@/lib/foundryAgent';
import { teamStatus, runTrichaTeam } from '@/lib/foundryTeam';
import { clientIp, rateLimit } from '@/lib/serverAuth';
import { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Which services this deployment is actually using. No secrets: only whether
 * each one is configured. The "Built on Microsoft Azure" page reads this, so
 * what it shows is always the real state of the running app.
 */
export async function GET(req: NextRequest) {
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

  const [foundry, search, team] = await Promise.all([foundryStatus(), searchStatus(), teamStatus()]);
  // ?probe=1 sends one short test turn through the Foundry agent (rate limited).
  const probing = req.nextUrl.searchParams.get('probe') === '1' && rateLimit(`status-probe:${clientIp(req)}`, 10, 60 * 60 * 1000);
  const probe = probing ? await probeFoundryAgent() : undefined;
  // ?probe=team runs one short question through the six-agent team.
  let teamProbe: { ok: boolean; team?: string[]; ms?: number } | undefined;
  if (req.nextUrl.searchParams.get('probe') === 'team' && rateLimit(`status-probe:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    const started = Date.now();
    const r = await runTrichaTeam({
      firstName: 'there',
      history: [],
      message: 'In one sentence: what does 1 cm of hair tell you about stress?',
      context: { segments: [], telemetry: [] },
    });
    teamProbe = r ? { ok: true, team: r.team, ms: Date.now() - started } : { ok: false, ms: Date.now() - started };
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    azureOpenAI: { on: ai.provider === 'azure', model: ai.provider === 'azure' ? ai.model : null },
    agent: { on: azureIsPrimary() || foundry.on, tools: 6 },
    foundryAgent: { on: foundry.on, configured: foundry.configured, name: foundry.on ? foundry.agent : null, version: foundry.version, lastReplyAt: foundry.lastReplyAt ?? null, error: foundry.error, probe },
    multiAgent: { on: team.on, agents: team.agents, probe: teamProbe },
    contentSafety: { on: safety.azureContentSafety },
    promptShields: { on: safety.promptShields },
    grounding: { on: true, backend: search.on ? 'azure-ai-search' : 'built-in', passages: EVIDENCE.length },
    azureSearch: { on: search.on, configured: search.configured, index: search.on ? search.index : null, ranking: search.mode },
    maps: { on: !!(process.env.AZURE_MAPS_KEY || '').trim() },
    entraSignIn: { on: !!signIn?.microsoft },
    graphCalendar: { on: !!signIn?.microsoft },
    mcp: { on: true, path: '/api/mcp' },
  });
}
