/**
 * Care triage: the first check on every message, before any agent runs.
 *
 * Tricha is a stress coach, not an emergency service. If a message describes a
 * possible medical emergency (chest pain, trouble breathing, fainting, stroke
 * signs, and similar), the pipeline stops here and the person is told to get
 * urgent care, with emergency numbers and the nearest-hospital finder. No model
 * is asked, so this cannot be talked out of it and it answers instantly.
 *
 * Suicide and self-harm language is handled one step earlier by the crisis check
 * in contentSafety.ts. Benchmarked by scripts/benchmark-triage.mjs.
 *
 * Levels:
 *   emergency   stop, show emergency guidance
 *   see_doctor  continue, but the Care agent must be consulted and a doctor suggested
 *   routine     continue normally
 */

export type TriageLevel = 'emergency' | 'see_doctor' | 'routine';

export interface TriageResult {
  level: TriageLevel;
  /** Plain-language reasons, for the agent trace. */
  reasons: string[];
}

interface Rule {
  reason: string;
  pattern: RegExp;
}

const EMERGENCY: Rule[] = [
  { reason: 'chest pain or pressure', pattern: /\bchest\s+(pain|pains|tightness|pressure|heaviness|discomfort)\b|\b(pain|tightness|pressure|heaviness)\s+(in|on|across)\s+(my\s+|the\s+)?chest\b|\bchest\s+(is|feels)\s+(tight|heavy|crushing)\b|\bcrushing\s+chest\b/i },
  { reason: 'trouble breathing', pattern: /\b(can'?t|cannot|can\s+not|struggling\s+to|hard\s+to|unable\s+to)\s+(breathe|catch\s+my\s+breath)\b|\bshort(ness)?\s+of\s+breath\b|\bbreathless(ness)?\b|\bgasping\s+for\s+(air|breath)\b/i },
  { reason: 'fainting or collapse', pattern: /\b(fainted|fainting|passed\s+out|passing\s+out|blacked\s+out|lost\s+consciousness|unconscious)\b|\b(i|he|she|they|someone|somebody|colleague|friend|father|mother|dad|mum|mom|wife|husband|son|daughter|person|patient|man|woman)\s+(just\s+|has\s+|have\s+|suddenly\s+)?collapsed\b/i },
  { reason: 'possible stroke signs', pattern: /\b(face|mouth)\s+(is\s+)?droop(ing|s|y)?\b|\bslurred\s+speech\b|\b(numb(ness)?|weak(ness)?)\s+(on|in)\s+one\s+side\b|\bone\s+side\s+of\s+(my|the)\s+(body|face)\b|\bcan'?t\s+(move|feel)\s+(my\s+)?(arm|leg|face)\b/i },
  { reason: 'sudden severe headache', pattern: /\b(worst|sudden|thunderclap)\s+(severe\s+)?headache\b|\bheadache\s+(is\s+)?the\s+worst\b/i },
  { reason: 'seizure', pattern: /\b(seizure|seizures|convulsion|convulsing|fit\s+just\s+now)\b/i },
  { reason: 'heart racing with dizziness or pain', pattern: /\b(heart|pulse)\s+(is\s+)?(racing|pounding|beating\s+(really\s+)?fast)\b.*\b(dizz|faint|pain|breath)/i },
  { reason: 'coughing or vomiting blood', pattern: /\b(cough(ing|ed)?|vomit(ing|ed)?|throw(ing)?\s+up)\s+(up\s+)?blood\b/i },
  { reason: 'severe allergic reaction', pattern: /\b(throat|tongue|lips?)\s+(is\s+|are\s+)?(swelling|swollen|closing)\b|\banaphyla/i },
  // Hindi and Hinglish
  { reason: 'chest pain (Hindi)', pattern: /\bseene\s+(mein|me)\s+dard\b|\bchhati\s+(mein|me)\s+dard\b|सीने\s*में\s*दर्द|छाती\s*में\s*दर्द/i },
  { reason: 'trouble breathing (Hindi)', pattern: /\bsaans\s+(nahi|nahin|lene\s+mein)\b|सांस\s*(नहीं|लेने\s*में)/i },
];

const SEE_DOCTOR: Rule[] = [
  { reason: 'heart symptoms', pattern: /\bpalpitation|\b(heart|pulse)\s+(is\s+)?(racing|pounding|skipping|irregular)\b/i },
  { reason: 'long-term sleep problems', pattern: /\b(insomnia|can'?t\s+sleep|haven'?t\s+slept|not\s+sleeping)\b/i },
  { reason: 'medicine or dose question', pattern: /\b(medicine|medication|tablet|pill|dose|dosage|prescri|steroid|antidepressant|ssri|melatonin|sleeping\s+pill)s?\b/i },
  { reason: 'feeling unable to cope', pattern: /\b(can'?t|cannot)\s+cope\b|\bbreaking\s+down\b|\bpanic\s+attack|\bburn(ed|t)?\s*out\s+completely\b|\bfalling\s+apart\b/i },
  { reason: 'physical symptoms', pattern: /\b(dizz(y|iness)|hair\s+(is\s+)?falling\s+out|bald\s+patch|weight\s+(loss|gain)|losing\s+weight|blood\s+pressure|bp\s+is|chest\s+feels)\b/i },
  { reason: 'pregnancy', pattern: /\bpregnan(t|cy)\b/i },
  { reason: 'asks about a doctor', pattern: /\b(see|visit|consult|find|need)\s+(a\s+)?(doctor|physician|psychiatrist|psychologist|therapist|specialist|gp)\b/i },
];

/** "No chest pain", "never fainted", "without shortness of breath": a denial is not a symptom. */
function negated(text: string, index: number): boolean {
  const before = text.slice(Math.max(0, index - 30), index).toLowerCase();
  return /\b(no|not|never|without|don'?t\s+have|do\s+not\s+have|haven'?t\s+had|no\s+more|denies|free\s+of)\s+(any\s+)?([a-z]+\s+){0,2}$/.test(before);
}

function matches(rules: Rule[], text: string): string[] {
  const reasons: string[] = [];
  for (const rule of rules) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : rule.pattern.flags + 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (!negated(text, m.index)) {
        reasons.push(rule.reason);
        break;
      }
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  return reasons;
}

export function triageMessage(message: string): TriageResult {
  const text = (message || '').normalize('NFKC');
  const emergency = matches(EMERGENCY, text);
  if (emergency.length) return { level: 'emergency', reasons: emergency };
  const doctor = matches(SEE_DOCTOR, text);
  if (doctor.length) return { level: 'see_doctor', reasons: doctor };
  return { level: 'routine', reasons: [] };
}

export const EMERGENCY_REPLY =
  'What you describe can be a medical emergency, so I have stopped the stress analysis.\n\n' +
  'Please get urgent help now:\n' +
  '• India: call 112, or go to the nearest emergency department.\n' +
  '• UAE: call 998 for an ambulance, or 999.\n' +
  '• Anywhere else: call your local emergency number.\n\n' +
  'If you are with someone, tell them now. "Find a doctor near me" below lists the nearest hospitals with directions. ' +
  'I am a stress coach, not a doctor, and cannot assess symptoms like these. We can look at your results once you are safe.';
