/**
 * Safety screening for the Tricha coach. Two layers:
 *
 *   1. A built-in rule check for crisis language (always on, needs no key).
 *   2. Azure AI Content Safety as a second check, when
 *      AZURE_CONTENT_SAFETY_ENDPOINT and AZURE_CONTENT_SAFETY_KEY are set.
 *
 * A crisis message is never sent to the coach model: the user gets help and
 * emergency guidance instead. Model replies are screened before they are shown.
 */

export type SafetyCategory = 'SelfHarm' | 'Violence' | 'Hate' | 'Sexual' | 'PromptAttack';

export interface SafetyVerdict {
  /** The user may be in distress: show help and emergency guidance. */
  crisis: boolean;
  /** The text should not be shown or answered as-is. */
  blocked: boolean;
  categories: SafetyCategory[];
  checkedBy: Array<'rules' | 'azure' | 'prompt-shields'>;
}

export interface CrisisResource {
  label: string;
  detail: string;
  phone?: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  { label: 'Emergency (India)', detail: 'If you or someone else is in immediate danger, call 112 now.', phone: '112' },
  { label: 'Tele-MANAS', detail: 'Free government mental health helpline, 24x7, in many languages.', phone: '14416' },
  { label: 'Tele-MANAS (toll-free)', detail: 'The same service on a toll-free number.', phone: '18008914416' },
  { label: 'Outside India', detail: 'Call your local emergency number, or go to the nearest emergency department.' },
];

export const CRISIS_REPLY =
  'I am really glad you told me. What you are feeling matters more than any stress score, and you do not have to carry it alone.\n\n' +
  'I am an AI coach, not a doctor or an emergency service, so I am not the right help for this. Please talk to a person now:\n' +
  '• In immediate danger: call 112 (India) or your local emergency number.\n' +
  '• Tele-MANAS: call 14416, free, 24x7.\n' +
  '• Tele-MANAS toll-free: call 1800-891-4416.\n\n' +
  'If you can, reach out to someone you trust and stay with them. I am still here if you want to talk about your results afterwards.';

export const BLOCKED_INPUT_REPLY =
  'I cannot help with that. I can explain your hair cortisol results, your calendar load, and what to change before your next test.';

export const BLOCKED_OUTPUT_REPLY =
  'I could not give a safe answer to that. Please rephrase your question, or speak to a doctor if it is about your health.';

const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid(e|al)\b/i,
  /\bkill(ing)?\s+(myself|my\s*self)\b/i,
  /\bend(ing)?\s+(my|this)\s+life\b/i,
  /\btake\s+my\s+(own\s+)?life\b/i,
  /\b(want|wish|going|plan(ning)?)\s+to\s+die\b/i,
  /\bwish\s+i\s+(was|were)\s+dead\b/i,
  /\b(don'?t|do\s+not|no\s+longer)\s+want\s+to\s+(live|be\s+alive|exist|wake\s+up)\b/i,
  /\b(better\s+off|be\s+better)\s+(dead|without\s+me)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(live|living|go(ing)?\s+on)\b/i,
  /\b(can'?t|cannot)\s+go\s+on\b/i,
  /\bself[\s-]?harm(ing)?\b/i,
  /\b(hurt|harm|cut|cutting)\s+(myself|my\s*self)\b/i,
  /\boverdos(e|ing)\b/i,
  /\bhang(ing)?\s+myself\b/i,
  /\bjump(ing)?\s+off\b/i,
  // Hindi and Hinglish
  /\b(mar\s*jana|marna)\s+chah/i,
  /\bjeena\s+nahi/i,
  /\b(khud\s*kushi|khudkhushi|aatmahatya|atmahatya)\b/i,
  /आत्महत्या|मरना चाहत|जीना नहीं/,
];

/** Rule-based crisis check. Works with no network and no key. */
export function crisisKeywordCheck(text: string): boolean {
  const t = (text || '').normalize('NFKC');
  return CRISIS_PATTERNS.some(p => p.test(t));
}

function azureSafetyConfig() {
  const endpoint = (process.env.AZURE_CONTENT_SAFETY_ENDPOINT || '').trim().replace(/\/+$/, '');
  const key = (process.env.AZURE_CONTENT_SAFETY_KEY || '').trim();
  if (!endpoint || !key) return null;
  return {
    endpoint,
    key,
    apiVersion: (process.env.AZURE_CONTENT_SAFETY_API_VERSION || '2024-09-01').trim(),
  };
}

export function getSafetyStatus() {
  const on = !!azureSafetyConfig();
  return { rules: true, azureContentSafety: on, promptShields: on };
}

/**
 * Azure AI Content Safety text analysis. Returns severities (0, 2, 4 or 6) per
 * category, or null when the service is not configured or fails.
 */
async function azureAnalyze(text: string): Promise<Partial<Record<SafetyCategory, number>> | null> {
  const cfg = azureSafetyConfig();
  if (!cfg) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${cfg.endpoint}/contentsafety/text:analyze?api-version=${encodeURIComponent(cfg.apiVersion)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': cfg.key },
      body: JSON.stringify({
        text: text.slice(0, 10000),
        categories: ['Hate', 'SelfHarm', 'Sexual', 'Violence'],
        outputType: 'FourSeverityLevels',
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn('[BAALANCE Safety] Azure AI Content Safety error:', res.status);
      return null;
    }
    const data = await res.json();
    const out: Partial<Record<SafetyCategory, number>> = {};
    for (const item of data?.categoriesAnalysis || []) {
      if (item?.category) out[item.category as SafetyCategory] = Number(item.severity) || 0;
    }
    return out;
  } catch (err: any) {
    console.warn('[BAALANCE Safety] Azure AI Content Safety request failed:', err?.message || err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Azure AI Content Safety Prompt Shields: detects attempts to override the
 * coach's instructions ("jailbreaks"). Returns null when not configured or on
 * any failure, so a problem with the check never blocks a normal message.
 */
async function azureShieldPrompt(text: string): Promise<boolean | null> {
  const cfg = azureSafetyConfig();
  if (!cfg) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${cfg.endpoint}/contentsafety/text:shieldPrompt?api-version=${encodeURIComponent(cfg.apiVersion)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': cfg.key },
      body: JSON.stringify({ userPrompt: text.slice(0, 10000), documents: [] }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn('[BAALANCE Safety] Prompt Shields error:', res.status);
      return null;
    }
    const data = await res.json();
    return typeof data?.userPromptAnalysis?.attackDetected === 'boolean' ? data.userPromptAnalysis.attackDetected : null;
  } catch (err: any) {
    console.warn('[BAALANCE Safety] Prompt Shields request failed:', err?.message || err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Screens a piece of text. `kind` is 'input' for what the user typed and
 * 'output' for what the model wrote.
 */
export async function screenText(text: string, kind: 'input' | 'output'): Promise<SafetyVerdict> {
  const verdict: SafetyVerdict = { crisis: false, blocked: false, categories: [], checkedBy: ['rules'] };
  if (!text || !text.trim()) return verdict;

  if (kind === 'input' && crisisKeywordCheck(text)) {
    verdict.crisis = true;
    verdict.categories.push('SelfHarm');
  }

  const [severities, attack] = await Promise.all([azureAnalyze(text), kind === 'input' ? azureShieldPrompt(text) : Promise.resolve(null)]);
  if (attack !== null) {
    verdict.checkedBy.push('prompt-shields');
    // A crisis message always gets help first, whatever else it contains.
    if (attack && !verdict.crisis) {
      verdict.blocked = true;
      verdict.categories.push('PromptAttack');
    }
  }
  if (severities) {
    verdict.checkedBy.push('azure');
    for (const [category, severity] of Object.entries(severities) as Array<[SafetyCategory, number]>) {
      if (severity >= 2 && !verdict.categories.includes(category)) verdict.categories.push(category);
      if (category === 'SelfHarm') {
        // Any self-harm signal from the user is treated as a possible crisis.
        if (kind === 'input' && severity >= 2) verdict.crisis = true;
        if (kind === 'output' && severity >= 2) verdict.blocked = true;
      } else if (severity >= 4) {
        verdict.blocked = true;
      }
    }
  }
  return verdict;
}
