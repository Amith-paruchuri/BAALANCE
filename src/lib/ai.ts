import { GoogleGenAI } from '@google/genai';

/**
 * Model-agnostic AI layer. Every AI feature in BAALANCE (lab report parsing,
 * biomarker synthesis, the Tricha coach) calls generateText(), and the provider
 * is chosen by configuration:
 *
 *   AI_PROVIDER=gemini   Google Gemini (GEMINI_API_KEY, optional GEMINI_MODEL)
 *   AI_PROVIDER=azure    Azure OpenAI  (AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY,
 *                                       AZURE_OPENAI_DEPLOYMENT, optional AZURE_OPENAI_API_VERSION)
 *   AI_PROVIDER=auto     (default) the first configured provider, the other as fallback
 */

export type AIProviderName = 'gemini' | 'azure';

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
  /** Images (or PDFs, Gemini only) sent with the last user message. */
  attachments?: AIAttachment[];
  /** A visitor's own Gemini key ("bring your own key"). Never stored on the server. */
  geminiApiKey?: string;
  temperature?: number;
}

export interface AIResult {
  text: string;
  provider: AIProviderName;
  model: string;
}

const GEMINI_DEFAULT_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];
const AZURE_DEFAULT_API_VERSION = '2024-10-21';

function geminiKey(override?: string): string | null {
  const key = (override || process.env.GEMINI_API_KEY || '').trim();
  return key.length > 10 ? key : null;
}

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

function providerOrder(geminiOverride?: string): AIProviderName[] {
  const configured: AIProviderName[] = [];
  if (geminiKey(geminiOverride)) configured.push('gemini');
  if (azureConfig()) configured.push('azure');

  const preferred = (process.env.AI_PROVIDER || 'auto').toLowerCase();
  if (preferred === 'azure' || preferred === 'gemini') {
    return [
      ...configured.filter(p => p === preferred),
      ...configured.filter(p => p !== preferred),
    ];
  }
  return configured;
}

export function getAIStatus() {
  const order = providerOrder();
  const primary = order[0];
  return {
    configured: order.length > 0,
    provider: primary || null,
    providers: order,
    model:
      primary === 'azure'
        ? azureConfig()?.deployment || null
        : primary === 'gemini'
        ? process.env.GEMINI_MODEL || GEMINI_DEFAULT_MODELS[0]
        : null,
  };
}

async function callGemini(req: AIRequest): Promise<AIResult | null> {
  const key = geminiKey(req.geminiApiKey);
  if (!key) return null;
  const ai = new GoogleGenAI({ apiKey: key });
  const models = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL, ...GEMINI_DEFAULT_MODELS] : GEMINI_DEFAULT_MODELS;

  const contents = req.messages.map((m, i) => {
    const parts: any[] = [{ text: m.text }];
    if (i === req.messages.length - 1 && req.attachments?.length) {
      for (const a of req.attachments) parts.push({ inlineData: { mimeType: a.mimeType, data: a.base64 } });
    }
    return { role: m.role === 'assistant' ? 'model' : 'user', parts };
  });

  for (const model of Array.from(new Set(models))) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          ...(req.system ? { systemInstruction: req.system } : {}),
          ...(req.json ? { responseMimeType: 'application/json' } : {}),
          ...(typeof req.temperature === 'number' ? { temperature: req.temperature } : {}),
        },
      });
      const text = response.text || '';
      if (text.trim()) return { text, provider: 'gemini', model };
    } catch (err: any) {
      console.warn(`[BAALANCE AI] Gemini ${model} failed:`, err?.message || err);
    }
  }
  return null;
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

/** Sends the request to the configured provider, falling back to the other one if it fails. */
export async function generateText(req: AIRequest): Promise<AIResult | null> {
  for (const provider of providerOrder(req.geminiApiKey)) {
    const result = provider === 'gemini' ? await callGemini(req) : await callAzure(req);
    if (result) return result;
  }
  return null;
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
