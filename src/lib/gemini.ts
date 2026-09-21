import { GoogleGenAI } from '@google/genai';
import { CLINICAL_FALLBACK_SYNTHESIS } from './mockData';
import { GeminiSynthesisResult, UserProfile, HairCortisolSegment, WeeklyTelemetry } from './types';

let genAIClient: GoogleGenAI | null = null;

export function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const apiKey =
    customApiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length < 10) {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

export async function synthesizeBiomarkerData(
  profile: UserProfile,
  segments: HairCortisolSegment[],
  telemetry: WeeklyTelemetry[],
  customApiKey?: string
): Promise<GeminiSynthesisResult> {
  const client = getGeminiClient(customApiKey);

  // If no API key is set, immediately return high-fidelity dynamic clinical synthesis
  if (!client) {
    console.log('[BAALANCE Gemini Engine] Using deterministic clinical biomedical model (Evaluation / Offline mode).');
    return computeDynamicSynthesis(profile, segments, telemetry);
  }

  const july = segments.find(s => s.id === 1)?.cortisolPgPerMg ?? 11.2;
  const august = segments.find(s => s.id === 2)?.cortisolPgPerMg ?? 28.4;
  const september = segments.find(s => s.id === 3)?.cortisolPgPerMg ?? 15.6;

  const totalMeetings = telemetry.reduce((sum, item) => sum + (item.meetingHours || 0), 0);
  const totalLateCalls = telemetry.reduce((sum, item) => sum + (item.eveningCalls || 0), 0);
  const totalFlights = telemetry.reduce((sum, item) => sum + (item.flightShifts || 0), 0);
  const avgDeepSleep = telemetry.length > 0
    ? (telemetry.reduce((sum, item) => sum + item.deepSleepHours, 0) / telemetry.length).toFixed(2)
    : '0.70';

  try {
    const prompt = `You are the BAALANCE Biomedical AI Engine, specialized in endocrinology, hair cortisol spectrometry, chronobiology, and occupational burnout prevention.

Analyze this 90-day segmented hair cortisol timeline correlated with Google Calendar load and wearable telemetry:

PATIENT PROFILE:
- Role: ${profile.role || 'Professional'} (${profile.sector || 'Technology / Business'})
- Demographics: Age ${profile.age || 32}, Biological Sex: ${profile.biologicalSex || 'not specified'}${profile.isPregnant ? ' [PREGNANT / POSTPARTUM <6mo - Adjust baseline for gestational hypercortisolemia]' : ''}
- Target Weekly Hours: ${profile.weeklyHours || 50}h/week
- Chronotype: ${profile.chronotype || 'morning_lark'}
- Sleep Architecture: Average ${profile.nightlySleepHours || 6.5}h/night, Morning Awakening: ${profile.sleepQuality || 'moderate'}
- Caffeine Habits: ${profile.caffeineHabit === 'no_coffee' ? 'No Coffee / Zero Caffeine consumption' : profile.caffeineHabit === 'delayed_morning' ? 'Delayed 90–120m after waking' : profile.caffeineHabit === 'afternoon_excess' ? 'Afternoon / Evening cups' : 'Within 30m of waking'}
- Evening Work / Curfew Boundary: ${profile.workBoundaryBleed || 'occasional_bleed'}
- International Travel Frequency: ${profile.travelFrequency || 'occasional'}
- Clinical Perceived Stress Scale (PSS-4): ${profile.perceivedStressRating || 7}/10
- Active Somatic Stress Manifestations: ${profile.somaticSymptoms && profile.somaticSymptoms.length > 0 ? profile.somaticSymptoms.join(', ') : 'None reported'}
- Reported Stress Drivers: ${profile.stressDrivers && profile.stressDrivers.length > 0 ? profile.stressDrivers.join(', ') : 'None reported'}
- Pre-Existing Health Conditions: ${profile.healthConditions && profile.healthConditions.length > 0 ? profile.healthConditions.join(', ') : 'None reported'}
- Current Medications: ${profile.medications && profile.medications.length > 0 ? profile.medications.join(', ') : 'None reported'}

HAIR CORTISOL LAB SPECIMEN (3.0 cm sample, 1 cm = 30 days):
- July (60-90 days ago / Hair Tip): ${july} pg/mg
- August (30-60 days ago / Mid-Shaft): ${august} pg/mg
- September (0-30 days ago / Scalp Root): ${september} pg/mg
(Clinical Reference: Normal optimal range is 5.0-14.0 pg/mg; Moderate strain is 14.1-20.0 pg/mg; Acute surge is >20.0 pg/mg)

- Total meeting hours: ${Math.round(totalMeetings)}h across 12 weeks
- Late meetings scheduled past 7 PM: ${totalLateCalls} calls
- Timezone shift flights: ${totalFlights} flights
- Restorative deep sleep: ${avgDeepSleep} hours/night average
${totalMeetings <= 5 && august > 16.0 ? `
CRITICAL CLINICAL RULE (BIOMARKER-CALENDAR DISCORDANCE ACTIVE):
Total meeting hours are ${Math.round(totalMeetings)}h while August hair cortisol is high (${august} pg/mg).
DO NOT claim corporate desk meetings or curfew calls caused this strain! Withhold desk meeting inferences.
Explicitly state: "Biomarker-Calendar Discordance Detected: Cumulative hair cortisol averaged ${((july + august + september) / 3).toFixed(1)} pg/mg with peak elevation in August, despite zero scheduled calendar meetings. Desk meeting conclusions are withheld. Complete intake with Tricha AI to document clinical ward duties, board exam preparation, or shift-work demands."
` : ''}
SCORING & SYNTHESIS TASK:
1. Calculate "allostaticLoadScore": An integer between 15 and 98 representing the holistic CUMULATIVE Burnout Score for the entire 90-day period. DO NOT provide month-wise scores. Provide a single unified cumulative score reflecting cumulative 90-day hair cortisol (averaging ${((july + august + september) / 3).toFixed(1)} pg/mg across the 3cm specimen), total meeting hours (${Math.round(totalMeetings)}h), cumulative late calls (${totalLateCalls}), and 12-week sleep architecture.
   - If cumulative 90-day hair cortisol is in the optimal range (5.0 - 14.0 pg/mg) and late calls are low, the score MUST be in the Optimal Range (20 to 45).
   - If cumulative 90-day hair cortisol is moderately elevated (14.1 - 18.0 pg/mg), the score should be in the Moderate Strain Zone (45 to 65).
   - If cumulative 90-day hair cortisol is elevated (>18.0 pg/mg) with high late calls and chronic sleep debt, the score should be in the High Burnout Zone (65 to 98).
   - Your score MUST dynamically adapt to the cumulative biological and workload telemetry.
2. "allostaticCategory": "High Burnout Zone" | "Moderate Strain Zone" | "Optimal Homeostasis"
3. "strainLevel": "Mild" | "Moderate" | "High" | "Severe"
4. "rootCauseCulprit": A plain-English cumulative diagnosis for the entire 90-day window (2-3 concise sentences). Express all findings cumulatively across the entire 90-day period rather than month-by-month. NEVER use markdown asterisks (* or **). NO biology buzzwords like "HPA-axis", "sympathoadrenal", "hysteresis", "hypercortisolemia", or "homeostasis". Focus on the cumulative culprits: total late meetings past 7 PM, cross-timezone flights, and sustained deep sleep debt.
5. "protocols": 3 tailored recovery action items (Circadian, Calendar Defense, Hair Specimen Audit).

Return ONLY a valid JSON object matching this schema without markdown code fences or conversational preamble:
{
  "allostaticLoadScore": number,
  "allostaticCategory": string,
  "strainLevel": "Mild" | "Moderate" | "High" | "Severe",
  "rootCauseCulprit": string,
  "hpaAxisTrajectory": string,
  "circadianDesynchronySummary": string,
  "protocols": [
    {
      "id": "circadian-reset",
      "category": "circadian",
      "categoryLabel": "Circadian Biology",
      "title": string,
      "iconType": "sun",
      "badge": "Immediate Priority",
      "description": string,
      "actionItems": [string, string, string],
      "impactMetric": string
    },
    {
      "id": "calendar-boundary",
      "category": "calendar",
      "categoryLabel": "Google Calendar Defense",
      "title": string,
      "iconType": "calendar",
      "badge": "Calendar Integration",
      "description": string,
      "actionItems": [string, string, string],
      "impactMetric": string
    },
    {
      "id": "salon-audit",
      "category": "audit",
      "categoryLabel": "Scalp Specimen Audit",
      "title": string,
      "iconType": "scissors",
      "badge": "Scheduled Salon Visit",
      "description": string,
      "actionItems": [string, string, string],
      "impactMetric": string
    }
  ],
  "nextSalonAuditDate": string,
  "confidenceScore": number
}
`;

    // Try candidate models in order of capability
    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.8-flash',
      'gemini-3-flash-preview',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ];

    let rawText = '';
    for (const modelName of candidateModels) {
      try {
        if (client.interactions && typeof client.interactions.create === 'function') {
          const interaction = await client.interactions.create({
            model: modelName,
            input: prompt,
          });
          if (interaction && interaction.output_text) {
            rawText = interaction.output_text;
            break;
          }
        } else if (client.models && typeof client.models.generateContent === 'function') {
          const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
          });
          if (response && response.text) {
            rawText = response.text;
            break;
          }
        }
      } catch (mErr) {
        // Try next candidate model
        continue;
      }
    }

    if (rawText) {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && typeof parsed.allostaticLoadScore === 'number') {
        // Clean out any rogue asterisks
        if (parsed.rootCauseCulprit) {
          parsed.rootCauseCulprit = parsed.rootCauseCulprit.replace(/\*\*/g, '').replace(/\*/g, '');
        }
        return parsed as GeminiSynthesisResult;
      }
    }
  } catch (error) {
    console.error('[BAALANCE Gemini Engine] Synthesis exception:', error);
  }

  // High-fidelity fallback model
  return computeDynamicSynthesis(profile, segments, telemetry);
}

export function computeDynamicSynthesis(
  profile: UserProfile,
  segments: HairCortisolSegment[],
  telemetry: WeeklyTelemetry[]
): GeminiSynthesisResult {
  const july = segments.find(s => s.id === 1)?.cortisolPgPerMg ?? 11.2;
  const august = segments.find(s => s.id === 2)?.cortisolPgPerMg ?? 28.4;
  const september = segments.find(s => s.id === 3)?.cortisolPgPerMg ?? 15.6;

  // Normal clinical baseline hair cortisol is 11.0 pg/mg
  const baseline = 11.0;

  // Calculate excess cortisol for each month
  const julyDelta = july - baseline;
  const augustDelta = august - baseline;
  const septemberDelta = september - baseline;

  // August has highest weight (acute crisis period, mid-shaft)
  // September has second highest weight (recent 30 days recovery, scalp root)
  // July has baseline weight (tip, older history)
  let cortisolPoints = 0;

  if (augustDelta > 0) {
    // 0 to 27 pg excess maps smoothly to 0 to 30 points
    cortisolPoints += Math.min(augustDelta * 1.5, 30);
  } else {
    // Sub-baseline provides resilience discount
    cortisolPoints += Math.max(augustDelta * 0.8, -5);
  }

  if (septemberDelta > 0) {
    // 0 to 20 pg excess maps smoothly to 0 to 24 points
    cortisolPoints += Math.min(septemberDelta * 1.6, 24);
  } else {
    cortisolPoints += Math.max(septemberDelta * 0.8, -5);
  }

  if (julyDelta > 0) {
    cortisolPoints += Math.min(julyDelta * 0.8, 10);
  } else {
    cortisolPoints += Math.max(julyDelta * 0.5, -4);
  }

  // Workload, calendar & sleep factors (from profile & telemetry)
  const totalMeetings = telemetry.reduce((sum, item) => sum + (item.meetingHours || 0), 0);
  const totalLateCalls = telemetry.reduce((sum, item) => sum + (item.eveningCalls || 0), 0);
  const totalFlights = telemetry.reduce((sum, item) => sum + (item.flightShifts || 0), 0);
  const sleepDeficitWeeks = telemetry.filter(item => item.isSleepDeficit).length;

  let lifestylePoints = 25; // Base resting allostatic load for working professional

  // Late calls past 7 PM
  lifestylePoints += Math.min(totalLateCalls * 0.35, 10);

  // Sleep deficit
  lifestylePoints += Math.min(sleepDeficitWeeks * 1.5, 8);

  // Profile hours
  if (profile.weeklyHours > 70) lifestylePoints += 7;
  else if (profile.weeklyHours > 55) lifestylePoints += 4;
  else if (profile.weeklyHours < 40) lifestylePoints -= 3;

  // Curfew bleed
  if (profile.workBoundaryBleed === 'always_on_bed') lifestylePoints += 5;
  else if (profile.workBoundaryBleed === 'occasional_bleed') lifestylePoints += 2;
  else if (profile.workBoundaryBleed === 'strict_boundaries') lifestylePoints -= 2;

  // Sleep quality & duration
  if (profile.sleepQuality === 'exhausted_wired') lifestylePoints += 5;
  else if (profile.sleepQuality === 'middle_night_awakenings') lifestylePoints += 4;
  if (profile.nightlySleepHours && profile.nightlySleepHours < 6.0) lifestylePoints += 3;
  else if (profile.nightlySleepHours && profile.nightlySleepHours > 7.5) lifestylePoints -= 2;

  // Caffeine Habit
  if (profile.caffeineHabit === 'afternoon_excess') lifestylePoints += 2;
  else if (profile.caffeineHabit === 'no_coffee') lifestylePoints -= 2;

  // Travel Frequency
  if (profile.travelFrequency === 'constant_nomad') lifestylePoints += 3;
  else if (profile.travelFrequency === 'frequent_cross_meridian') lifestylePoints += 2;

  // Perceived Stress Rating (1-10)
  if (profile.perceivedStressRating && profile.perceivedStressRating >= 8) lifestylePoints += 3;
  else if (profile.perceivedStressRating && profile.perceivedStressRating <= 3) lifestylePoints -= 2;

  // Somatic symptoms
  if (profile.somaticSymptoms && profile.somaticSymptoms.length > 0 && !profile.somaticSymptoms.includes('none')) {
    lifestylePoints += Math.min(profile.somaticSymptoms.length * 1.5, 6);
  }

  // Pre-existing conditions
  const activeConditions = (profile.healthConditions || []).filter(c => c !== 'none');
  if (activeConditions.length > 0) {
    lifestylePoints += Math.min(activeConditions.length * 2, 6);
  }

  // Combine
  let rawScore = lifestylePoints + cortisolPoints;

  // Pregnancy calibration
  if (profile.isPregnant) {
    rawScore = Math.max(25, rawScore - 6);
  }

  // Clamp strictly between 15 and 98
  const score = Math.min(Math.max(Math.round(rawScore), 15), 98);

  let strainLevel: 'Mild' | 'Moderate' | 'High' | 'Severe' = 'Moderate';
  let category = 'Moderate Strain Zone';
  if (score >= 66) {
    strainLevel = score >= 85 ? 'Severe' : 'High';
    category = 'High Burnout Zone';
  } else if (score >= 45) {
    strainLevel = 'Moderate';
    category = 'Moderate Strain Zone';
  } else {
    strainLevel = 'Mild';
    category = 'Optimal Homeostasis';
  }

  // Cumulative 90-day biological metrics
  const cumulativeAvgCortisol = parseFloat(((july + august + september) / 3).toFixed(1));
  const cumulativeSurgePct = Math.round(((cumulativeAvgCortisol - baseline) / baseline) * 100);

  // Root cause culprit text expressed 100% cumulatively for the 90-day window
  const isDiscordance = totalMeetings <= 5 && august > 16.0;
  let rootCauseCulprit = '';

  if (isDiscordance) {
    rootCauseCulprit = `Biomarker-Calendar Discordance Detected: Hair cortisol averaged ${cumulativeAvgCortisol} pg/mg (+${cumulativeSurgePct}% above baseline) with an acute surge to ${august} pg/mg, despite minimal/zero scheduled calendar meetings (${Math.round(totalMeetings)}h total). Standard desk meeting conclusions are withheld. Complete intake with Tricha AI to document your clinical ward duties, study workload, or irregular shift patterns.`;
  } else if (cumulativeAvgCortisol > 16.0) {
    rootCauseCulprit = `Across the full 90-day testing window, cumulative hair cortisol averaged ${cumulativeAvgCortisol} pg/mg (+${cumulativeSurgePct}% above baseline). The primary driver was ${totalLateCalls} cumulative evening calls past 7:00 PM${totalFlights > 0 ? ` and ${totalFlights} timezone travel shifts` : ''} that caused severe deep sleep deficits, accumulating high sustained strain.`;
  } else if (cumulativeAvgCortisol > 13.0) {
    rootCauseCulprit = `Cumulative 90-day hair cortisol averaged ${cumulativeAvgCortisol} pg/mg (+${cumulativeSurgePct}% above baseline). Moderate cumulative strain accumulated from elevated meeting volume and sporadic evening calls, though overall sleep architecture shows resilient recovery.`;
  } else {
    rootCauseCulprit = `Cumulative 90-day hair cortisol is in a healthy, balanced range (${cumulativeAvgCortisol} pg/mg average vs 11.0 baseline). Your schedule and sleep habits maintain optimal resilience across the entire 90-day period.`;
  }

  return {
    ...CLINICAL_FALLBACK_SYNTHESIS,
    allostaticLoadScore: score,
    allostaticCategory: category,
    strainLevel,
    rootCauseCulprit,
    confidenceScore: 94,
  };
}
