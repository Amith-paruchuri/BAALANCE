import {
  MAX_STEPS,
  TOOLS,
  TRICHA_INSTRUCTIONS,
  executeAgentTool,
  finishRun,
  newRunState,
  type AgentContext,
  type AgentResult,
} from './trichaAgent';

/**
 * Tricha on Microsoft Foundry Agent Service.
 *
 * The agent (name, model, instructions, six function tools) lives in the
 * Foundry project and is created or updated from this file the first time a
 * server instance needs it, so the code is the single source of truth. Each
 * chat turn is a Responses call to that agent. When it asks for a tool, the
 * tool runs here, on our server, against the user's own data, and the result
 * is sent back. Foundry never gets database access; it only sees what a tool
 * returns for that turn.
 *
 * Needs (Vercel env, server only):
 *   FOUNDRY_PROJECT_ENDPOINT   https://<resource>.services.ai.azure.com/api/projects/<project>
 *   AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET
 *                              an Entra app (service principal) with the
 *                              Azure AI User role on the Foundry project
 *   FOUNDRY_AGENT_NAME         optional, default "tricha"
 *   FOUNDRY_MODEL_DEPLOYMENT   optional, default AZURE_OPENAI_DEPLOYMENT or gpt-4.1-mini
 *
 * If anything is missing or a call fails, runFoundryAgent returns null and the
 * chat falls back to the direct Azure OpenAI agent.
 */

const TIMEOUT_MS = 20_000;

function config() {
  const endpoint = (process.env.FOUNDRY_PROJECT_ENDPOINT || '').trim().replace(/\/+$/, '');
  const tenant = (process.env.AZURE_TENANT_ID || '').trim();
  const clientId = (process.env.AZURE_CLIENT_ID || '').trim();
  const secret = (process.env.AZURE_CLIENT_SECRET || '').trim();
  const agentName = (process.env.FOUNDRY_AGENT_NAME || 'tricha').trim();
  const model = (process.env.FOUNDRY_MODEL_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-mini').trim();
  return { endpoint, tenant, clientId, secret, agentName, model };
}

export function foundryConfigured(): boolean {
  const c = config();
  return !!(c.endpoint && c.tenant && c.clientId && c.secret);
}

// ---- Entra ID token (client credentials), cached per server instance ----

let token: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt) return token.value;
  const c = config();
  const res = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(c.tenant)}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: c.clientId,
      client_secret: c.secret,
      scope: 'https://ai.azure.com/.default',
    }).toString(),
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || !data?.access_token) {
    throw new Error(`Entra token request failed (${res.status}${data?.error ? `: ${data.error}` : ''})`);
  }
  token = { value: data.access_token, expiresAt: Date.now() + (Number(data.expires_in || 3600) - 120) * 1000 };
  return token.value;
}

async function foundryFetch(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST') {
  const c = config();
  const res = await fetch(`${c.endpoint}${path}`, {
    method,
    headers: { authorization: `Bearer ${await getToken()}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}
  return { ok: res.ok, status: res.status, data, text };
}

// ---- The agent definition, kept in step with the code ----

function agentDefinition() {
  return {
    kind: 'prompt',
    model: config().model,
    instructions: TRICHA_INSTRUCTIONS,
    tools: TOOLS.map(t => ({
      type: 'function',
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    })),
  };
}

let ready: { at: number; version: string | null } | null = null;
let lastError: string | null = null;
const READY_FOR_MS = 10 * 60 * 1000;

function versionOf(data: any): string | null {
  const v = data?.version ?? data?.versions?.latest?.version ?? data?.latest_version ?? null;
  return v === null || v === undefined ? null : String(v);
}

/**
 * Makes sure the agent exists in the Foundry project with the current
 * definition. Updating with an unchanged definition does not add a version.
 */
export async function ensureFoundryAgent(): Promise<{ ok: boolean; version: string | null; error: string | null }> {
  if (!foundryConfigured()) return { ok: false, version: null, error: 'not configured' };
  if (ready && Date.now() - ready.at < READY_FOR_MS) return { ok: true, version: ready.version, error: null };
  try {
    const name = encodeURIComponent(config().agentName);
    const definition = agentDefinition();
    const description = 'Tricha, the BAALANCE stress coach. Reads hair cortisol and calendar load through read-only tools.';
    let res = await foundryFetch(`/agents/${name}?api-version=v1`, { definition, description });
    if (res.status === 404) {
      res = await foundryFetch(`/agents?api-version=v1`, { name: config().agentName, definition, description });
    }
    if (!res.ok) throw new Error(`agent setup failed (${res.status}): ${String(res.data?.error?.message || res.text).slice(0, 200)}`);
    ready = { at: Date.now(), version: versionOf(res.data) };
    lastError = null;
    return { ok: true, version: ready.version, error: null };
  } catch (err: any) {
    ready = null;
    lastError = String(err?.message || err).slice(0, 300);
    console.warn('[BAALANCE Foundry]', lastError);
    return { ok: false, version: null, error: lastError };
  }
}

// ---- One chat turn ----

/** The docs show both keys for naming the agent; use whichever the service accepts. */
let referenceKey: 'agent' | 'agent_reference' = 'agent';

function textFrom(output: any[]): string {
  return output
    .filter(item => item?.type === 'message')
    .flatMap(item => (Array.isArray(item.content) ? item.content : []))
    .filter((part: any) => part?.type === 'output_text' && typeof part.text === 'string')
    .map((part: any) => part.text)
    .join('\n')
    .trim();
}

export async function runFoundryAgent(opts: {
  firstName: string;
  history: Array<{ role: 'user' | 'assistant'; text: string }>;
  message: string;
  context: AgentContext;
}): Promise<(AgentResult & { agentName: string; agentVersion: string | null }) | null> {
  if (!foundryConfigured()) return null;
  const setup = await ensureFoundryAgent();
  if (!setup.ok) return null;

  const c = config();
  const run = newRunState();
  const input: any[] = [
    { role: 'developer', content: `You are talking with ${opts.firstName}.` },
    ...opts.history.map(h => ({ role: h.role, content: h.text })),
    { role: 'user', content: opts.message },
  ];

  const call = async (items: any[], toolChoice: 'auto' | 'none') => {
    const body = (key: typeof referenceKey) => ({ [key]: { type: 'agent_reference', name: c.agentName }, input: items, tool_choice: toolChoice });
    let res = await foundryFetch('/openai/v1/responses', body(referenceKey));
    if (res.status === 400 && /agent/i.test(String(res.data?.error?.message || res.text))) {
      const other = referenceKey === 'agent' ? 'agent_reference' : 'agent';
      const retry = await foundryFetch('/openai/v1/responses', body(other));
      if (retry.ok) referenceKey = other;
      res = retry;
    }
    if (!res.ok) throw new Error(`response failed (${res.status}): ${String(res.data?.error?.message || res.text).slice(0, 200)}`);
    return res.data;
  };

  try {
    let model = c.model;
    for (let step = 0; step <= MAX_STEPS; step++) {
      const response = await call(input, step === MAX_STEPS ? 'none' : 'auto');
      if (typeof response?.model === 'string') model = response.model;
      const output: any[] = Array.isArray(response?.output) ? response.output : [];
      const calls = output.filter(item => item?.type === 'function_call');

      if (calls.length === 0) {
        const text = textFrom(output);
        if (!text) return null;
        return { ...finishRun(run, text, model), agentName: c.agentName, agentVersion: setup.version };
      }

      // Send the whole turn back with the tool results, so no server-side
      // conversation state is needed.
      input.push(...output);
      for (const fc of calls.slice(0, 6)) {
        let args: any = {};
        try {
          args = JSON.parse(fc.arguments || '{}');
        } catch {}
        const name = String(fc.name || '');
        const result = await executeAgentTool(name, args, opts.context, run, opts.message);
        if (name) run.tools.push(name);
        input.push({ type: 'function_call_output', call_id: fc.call_id, output: JSON.stringify(result) });
      }
    }
    return null;
  } catch (err: any) {
    lastError = String(err?.message || err).slice(0, 300);
    console.warn('[BAALANCE Foundry]', lastError);
    return null;
  }
}

/** For the status page. No secrets. */
export async function foundryStatus() {
  const c = config();
  if (!foundryConfigured()) return { on: false, configured: false, agent: c.agentName, version: null, error: null as string | null };
  const setup = await ensureFoundryAgent();
  return { on: setup.ok, configured: true, agent: c.agentName, version: setup.version, error: setup.ok ? null : lastError ? 'Agent not reachable' : null };
}
