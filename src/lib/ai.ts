/**
 * The AI layer. Every AI feature in BAALANCE (lab report reading, biomarker
 * synthesis, the Tricha coach) calls generateText() or azureChatRaw(), and
 * both go to Azure OpenAI only:
 *
 *   AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT,
 *   optional AZURE_OPENAI_API_VERSION
 *
 * The Tricha agent can also run on Microsoft Foundry Agent Service
 * (src/lib/foundryAgent.ts). No other AI provider is used.
 */

export type AIProviderName = 'azure';

export interface AIMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface AIAttachment {
  mimeType: string;
  /** Base64 data without the data: prefix. */
  base64: string;
}

export interface AIRequest {
  system?: string;
  messages: AIMessage[];
  /** Ask the model to answer with a JSON object only. */
  json?: boolean;
  /** Images sent with the last user message (Azure OpenAI does not read PDFs). */
  attachments?: AIAttachment[];
  /** Ignored. Kept so older callers still compile; only Azure OpenAI is used. */
  geminiApiKey?: string;
  temperature?: number;
}

export interface AIResult {
  text: string;
  provider: AIProviderName;
  model: string;
}

const AZURE_DEFAULT_API_VERSION = '2024-10-21';

function azureConfig() {
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || '').trim().replace(/\/+$/, '');
  const apiKey = (process.env.AZURE_OPENAI_API_KEY || '').trim();
  const deployment = (process.env.AZURE_OPENAI_DEPLOYMENT || '').trim();
  if (!endpoint || !apiKey || !deployment) return null;
  return {
    endpoint,
    apiKey,
    deployment,
    apiVersion: (process.env.AZURE_OPENAI_API_VERSION || AZURE_DEFAULT_API_VERSION).trim(),
  };
}

export function getAIStatus() {
  const cfg = azureConfig();
  return { configured: !!cfg, provider: cfg ? ('azure' as const) : null, providers: cfg ? (['azure'] as AIProviderName[]) : [], model: cfg?.deployment || null };
}

async function callAzure(req: AIRequest): Promise<AIResult | null> {
  const cfg = azureConfig();
  if (!cfg) return null;

  // Azure OpenAI chat models accept images but not PDFs.
  const attachments = (req.attachments || []).filter(a => a.mimeType.startsWith('image/'));
  if (req.attachments?.length && attachments.length === 0) return null;

  const messages: any[] = [];
  if (req.system) messages.push({ role: 'system', content: req.system });
  req.messages.forEach((m, i) => {
    if (i === req.messages.length - 1 && attachments.length) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: m.text },
          ...attachments.map(a => ({ type: 'image_url', image_url: { url: `data:${a.mimeType};base64,${a.base64}` } })),
        ],
      });
    } else {
      messages.push({ role: m.role, content: m.text });
    }
  });

  const url = `${cfg.endpoint}/openai/deployments/${encodeURIComponent(cfg.deployment)}/chat/completions?api-version=${encodeURIComponent(cfg.apiVersion)}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': cfg.apiKey },
      body: JSON.stringify({
        messages,
        ...(req.json ? { response_format: { type: 'json_object' } } : {}),
        ...(typeof req.temperature === 'number' ? { temperature: req.temperature } : {}),
      }),
    });
    if (!res.ok) {
      console.warn('[BAALANCE AI] Azure OpenAI error:', res.status, (await res.text()).slice(0, 300));
      return null;
    }
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content || '';
    return text.trim() ? { text, provider: 'azure', model: cfg.deployment } : null;
  } catch (err: any) {
    console.warn('[BAALANCE AI] Azure OpenAI request failed:', err?.message || err);
    return null;
  }
}

/** True when Azure OpenAI is configured (needed for tool calling). */
export function azureIsPrimary(): boolean {
  return !!azureConfig();
}

/**
 * One raw Azure OpenAI chat-completions call, for callers that need features
 * beyond generateText() such as tool (function) calling. Returns the first
 * choice's message, or null on any failure.
 */
export async function azureChatRaw(body: Record<string, unknown>): Promise<{ message: any; model: string } | null> {
  const cfg = azureConfig();
  if (!cfg) return null;
  const url = `${cfg.endpoint}/openai/deployments/${encodeURIComponent(cfg.deployment)}/chat/completions?api-version=${encodeURIComponent(cfg.apiVersion)}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': cfg.apiKey },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn('[BAALANCE AI] Azure OpenAI error:', res.status, (await res.text()).slice(0, 300));
      return null;
    }
    const data = await res.json();
    const message = data?.choices?.[0]?.message;
    return message ? { message, model: cfg.deployment } : null;
  } catch (err: any) {
    console.warn('[BAALANCE AI] Azure OpenAI request failed:', err?.message || err);
    return null;
  }
}

/** Sends the request to Azure OpenAI. Returns null if it is not configured or fails. */
export async function generateText(req: AIRequest): Promise<AIResult | null> {
  return callAzure(req);
}

/** Parses a JSON object from model output, tolerating ```json fences. */
export function parseJsonObject<T = any>(raw: string): T | null {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {}
    }
    return null;
  }
}
