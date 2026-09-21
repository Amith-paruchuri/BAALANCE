import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { UserProfile, HairCortisolSegment, WeeklyTelemetry } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      history,
      profile,
      segments,
      telemetry,
      calendarEvents,
      calendarIcalUrl,
      verifiedCalendarEmail,
      apiKey: clientApiKey,
    } = await req.json();

    const userProfile: UserProfile = profile || {};
    const july = segments?.find((s: HairCortisolSegment) => s.id === 1)?.cortisolPgPerMg || 11.2;
    const august = segments?.find((s: HairCortisolSegment) => s.id === 2)?.cortisolPgPerMg || 28.4;
    const september = segments?.find((s: HairCortisolSegment) => s.id === 3)?.cortisolPgPerMg || 15.6;
    const m1 = september; // Most recent month (Root)
    const m2 = august;    // Surge month (Mid-shaft)
    const m3 = july;      // Baseline month (Tip)

    // Check if user has uploaded or linked their real calendar
    const hasLinkedCalendar = !!(
      calendarIcalUrl ||
      (calendarEvents && calendarEvents.length > 0) ||
      (verifiedCalendarEmail && !verifiedCalendarEmail.includes('Demo')) ||
      (userProfile.calendarIcalUrl)
    );

    let realEventCount = 0;
    let realMeetingHours = 0;
    let realLateCalls = 0;
    let realFlights = 0;
    let sampleEventsSummary = '';

    if (Array.isArray(calendarEvents)) {
      realEventCount = calendarEvents.length;
      realMeetingHours = Math.round(
        calendarEvents.reduce((sum: number, evt: any) => {
          if (evt.isAllDay) return sum;
          const t = (evt.title || '').toLowerCase();
          if (/\b(stay at|hotel|hostel|inn|resort|lodge|airbnb|check-in|checkout|reservation at|flight|flights|airline|movie|cinema|imax|concert|ticket)\b/i.test(t)) return sum;
          return sum + Math.min(Math.max(0, evt.durationHours || 0), 6.0);
        }, 0)
      );
      realLateCalls = calendarEvents.filter((evt: any) => {
        if (evt.isAllDay) return false;
        const t = (evt.title || '').toLowerCase();
        if (/\b(stay at|hotel|hostel|inn|resort|lodge|airbnb|check-in|checkout|reservation at|flight|flights|airline|movie|cinema|imax|concert|ticket)\b/i.test(t)) return false;
        return evt.isCurfewBreach;
      }).length;
      realFlights = calendarEvents.filter((evt: any) => {
        const t = (evt.title || '').toLowerCase();
        if (t.includes('terminal window') || t.includes('web terminal') || t.includes('cli') || t.includes('bash')) return false;
        return /\b(flight|flights|airline|airlines|airport|boarding\s+pass|airways)\b/i.test(t);
      }).length;

      if (realEventCount > 0) {
        sampleEventsSummary = calendarEvents
          .slice(0, 8)
          .map((e: any) => `• ${e.title} (${e.startTime || 'all-day'} - ${e.endTime || ''})`)
          .join('\n');
      }
    }

    const weeklyData = (telemetry as WeeklyTelemetry[]) || [];

    // If real calendar was uploaded/linked, strictly use real ingested counts!
    const totalMeetings = hasLinkedCalendar
      ? realMeetingHours
      : (weeklyData.length > 0 ? Math.round(weeklyData.reduce((sum, item) => sum + (item.meetingHours || 0), 0)) : 0);

    const totalLateCalls = hasLinkedCalendar
      ? realLateCalls
      : (weeklyData.length > 0 ? weeklyData.reduce((sum, item) => sum + (item.eveningCalls || 0), 0) : 0);

    const totalFlights = hasLinkedCalendar
      ? realFlights
      : (weeklyData.length > 0 ? weeklyData.reduce((sum, item) => sum + (item.flightShifts || 0), 0) : 0);

    const avgDeepSleep = weeklyData.length > 0
      ? (weeklyData.reduce((sum, item) => sum + item.deepSleepHours, 0) / weeklyData.length).toFixed(1)
      : '0.8';

    // Comprehensive Lifestyle Context & Active Profile Alignment
    const userRoleLower = (userProfile.role || '').toLowerCase();
    const queryLower = (message || '').toLowerCase();
    const emailLower = (userProfile.email || '').toLowerCase();

    const isMedicalStudent =
      userRoleLower.includes('medical') ||
      userRoleLower.includes('doctor') ||
      userRoleLower.includes('resident') ||
      userRoleLower.includes('mbbs') ||
      queryLower.includes('medical student') ||
      queryLower.includes('hospital ward') ||
      emailLower.includes('aiims');

    const rawUserName = (userProfile.name || '').replace(/^Dr\.\s*/i, '').trim();
    const firstName = rawUserName.split(' ')[0] || (isMedicalStudent ? 'Doctor' : 'there');
    const role = userProfile.role || (isMedicalStudent ? 'Medical Student / Clinical Scholar' : 'Professional');
    const sector = userProfile.sector || (isMedicalStudent ? 'Medicine & Healthcare' : 'Professional Services');
    const age = userProfile.age || (isMedicalStudent ? 24 : 32);
    const sex = userProfile.biologicalSex || 'Not specified';
    const isPregnant = userProfile.biologicalSex === 'female' && !!userProfile.isPregnant;
    const weeklyHours = userProfile.weeklyHours || (isMedicalStudent ? 60 : 50);
    const chronotype = userProfile.chronotype || 'morning_lark';
    const nightlySleepHours = userProfile.nightlySleepHours || 6.5;
    const sleepQuality = userProfile.sleepQuality || 'moderate';
    const caffeineHabit = userProfile.caffeineHabit || 'immediate_waking';
    const travelFrequency = userProfile.travelFrequency || 'occasional';
    const perceivedStressRating = userProfile.perceivedStressRating || 7;
    const somaticSymptoms = userProfile.somaticSymptoms?.length ? userProfile.somaticSymptoms.join(', ') : 'None reported';
    const workBoundaryBleed = userProfile.workBoundaryBleed || 'occasional_bleed';
    const conditions = userProfile.healthConditions?.length ? userProfile.healthConditions.join(', ') : 'None';
    const medications = userProfile.medications?.length ? userProfile.medications.join(', ') : 'None';
    const stressDrivers = userProfile.stressDrivers?.length
      ? userProfile.stressDrivers.join(', ')
      : (isMedicalStudent ? 'Hospital rotations, exam pressure, irregular sleep' : 'Workload crunch, evening calls');

    // Biomarker-Calendar Discordance Analysis:
    // When hair cortisol reflects a high stress spike (>16 pg/mg in August or >14 pg/mg in September),
    // but the linked calendar shows 0 or very few meetings (<= 10 hours), this is classic Discordance!
    const isDiscordant = (august > 16 || september > 14) && (hasLinkedCalendar && realMeetingHours <= 10 && realLateCalls <= 2);

    const systemPrompt = `You are Tricha, the intelligent, friendly, and practical AI health & recovery guide for BAALANCE.
You have the complete diagnostic, lifestyle, calendar, and sleep context for ${userProfile.name || firstName}:

PATIENT PROFILE & LIFESTYLE:
- Name: ${userProfile.name || firstName} (${sex}, Age ${age})${isPregnant ? ' [PREGNANT / POSTPARTUM - Gestational Hypercortisolemia Calibration Active]' : ''}
- Role: ${role} in ${sector} (~${weeklyHours} hours/week)
- Chronotype: ${chronotype}
- Sleep Architecture: Average ${nightlySleepHours} hrs/night, Morning Awakening: ${sleepQuality}
- Caffeine Habits: ${caffeineHabit === 'no_coffee' ? 'No coffee / Zero caffeine consumption' : caffeineHabit}
- Evening Work & Curfew Boundary: ${workBoundaryBleed}
- International Travel Frequency: ${travelFrequency}
- Clinical Perceived Stress Scale (PSS-4): ${perceivedStressRating}/10
- Active Somatic Stress Manifestations: ${somaticSymptoms}
- Primary Stress Drivers: ${stressDrivers}
- Health Conditions: ${conditions}
- Current Medications: ${medications}

90-DAY HAIR CORTISOL LAB TEST (3.0 cm sample, 1 cm = 30 days):
- July (60-90 days ago / Hair Tip): ${july} pg/mg (Normal Baseline, healthy range 5.0 - 14.0 pg/mg)
- August (30-60 days ago / Mid-Shaft): ${august} pg/mg (Acute Stress Spike, +154% above baseline)
- September (Last 30 days / Scalp Root): ${september} pg/mg (Delayed Recovery, still +42% elevated)

REAL GOOGLE CALENDAR STATUS:
${hasLinkedCalendar ? (
  realEventCount > 0
    ? `- Google Calendar: CONNECTED & INGESTED (${realEventCount} events found, ${totalMeetings} total hours, ${totalLateCalls} late calls past 7 PM, ${totalFlights} flights).
- Sample Ingested Events:
${sampleEventsSummary}`
    : `- Google Calendar: CONNECTED, BUT HAS 0 SCHEDULED MEETINGS (Empty calendar: 0 hours of meetings, 0 evening calls, 0 flights).`
) : `- Google Calendar: Not yet linked (or using clinical baseline benchmark).`}

${isDiscordant ? `
*** CRITICAL CLINICAL PROTOCOL: BIOMARKER-CALENDAR DISCORDANCE & INTAKE INTERVIEW ***
- Biological stress is HIGH in hair cortisol (August spike ${august} pg/mg, September ${september} pg/mg), yet Google Calendar contains virtually NO meetings (${totalMeetings} hours total, ${totalLateCalls} late calls).
- THIS IS A BIOMARKER-CALENDAR DISCORDANCE:
  The user has real physiological stress recorded in their hair, but their digital calendar does not have scheduled desk meetings.
- MANDATORY INSTRUCTION FROM USER:
  DO NOT jump to conclusions or give unsolicited recovery suggestions upfront!
  DO NOT assume corporate desk work or make up meetings or flights!
  Instead:
  1) Explicitly highlight the Biomarker-Calendar Discordance: explain that their hair test reveals significant cortisol elevation despite having ${totalMeetings} hours of scheduled meetings on their Google Calendar.
  2) Withhold inferences across workload sections and ask the user leading, exploratory questions to understand their daily life before giving conclusions or suggestions:
     - What is your profession, line of study, or daily field of work?
     - What are your typical daily waking, working, or shift hours?
     - What kind of physical, cognitive, or clinical demands do you face each day (e.g. hospital ward rounds, night duties, patient care, board exam study) that wouldn't appear on a digital calendar?
  3) If the user has already answered these questions in the conversation history (e.g. they stated they are a medical student doing hospital rotations or preparing for exams), acknowledge their answers with empathy and provide personalized, practical guidance suited to medical training without corporate meeting jargon.
` : `
*** GENUINE CALENDAR CORRELATIONS PROTOCOL ***
- The user has ${totalMeetings} hours of meetings, ${totalLateCalls} evening calls past 7 PM, and ${totalFlights} cross-timezone flights.
- Correlate their hair cortisol spikes with these genuine calendar events, late calls, and flights as usual.
`}

COMMUNICATION RULES:
1. NEVER use markdown asterisks (* or **) anywhere in your output. No bold formatting with asterisks, no italic asterisks, no bullet asterisks. Use clean plain text only.
2. DO NOT use medical or biological buzzwords like "HPA-axis", "sympathoadrenal", "hysteresis", "hypercortisolemia", "catecholamines", "homeostasis", or "suprachiasmatic". Speak in warm, plain, conversational English that any common person easily understands.
3. Address the user's EXACT question directly first. If they ask what is in their Google Calendar, answer accurately based on the real calendar status above.
4. Address the user respectfully as ${firstName}. DO NOT call the user a "doctor" or "medical student" unless their active profile role is in healthcare, and DO NOT call them a "tech founder" unless their active profile role is in technology. Strictly reflect their actual profile role (${role}).
5. Provide concrete, actionable, and personalized solutions tailored to ${firstName}'s real role (${role}) and actual circumstances.
6. Keep answers concise, helpful, and empathetic (2 to 3 short paragraphs max).`;

    // Check for API key (Client-provided, Header, or Environment)
    const apiKey =
      clientApiKey ||
      req.headers.get('x-gemini-api-key') ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 10) {
      const cleanKey = apiKey.trim();
      const ai = new GoogleGenAI({ apiKey: cleanKey });

      // Active supported models in Google Gemini API
      const candidateModels = [
        'gemini-3.6-flash',
        'gemini-3.8-flash',
        'gemini-3-flash-preview',
        'gemini-2.0-flash',
      ];

      for (const modelName of candidateModels) {
        try {
          // 1. Try Interactions API first (recommended for newer models)
          if (ai.interactions && typeof ai.interactions.create === 'function') {
            try {
              const convHistory = (Array.isArray(history) && history.length > 0)
                ? history.slice(-6).map((h: any) => `${h.role === 'user' ? 'User' : 'Tricha'}: ${h.text}`).join('\n')
                : '';

              const interaction = await ai.interactions.create({
                model: modelName,
                input: `${systemPrompt}\n\n${convHistory ? `RECENT CONVERSATION:\n${convHistory}\n\n` : ''}User Question: ${message}`,
              });
              const raw = interaction.output_text || '';
              if (raw && raw.trim()) {
                return NextResponse.json({
                  reply: raw.replace(/\*/g, ''),
                  source: modelName,
                });
              }
            } catch (intErr: any) {
              console.log(`[Interactions API ${modelName}] fallback to generateContent:`, intErr?.message);
            }
          }

          // 2. Try generateContent with multi-turn history
          const contents: any[] = [];
          if (Array.isArray(history) && history.length > 0) {
            for (const h of history.slice(-6)) {
              if (!h.text) continue;
              contents.push({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.text }],
              });
            }
          }
          contents.push({
            role: 'user',
            parts: [{ text: message }],
          });

          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: systemPrompt,
            },
          });

          const rawReply = response.text || '';
          if (rawReply && rawReply.trim()) {
            return NextResponse.json({
              reply: rawReply.replace(/\*/g, ''),
              source: modelName,
            });
          }
        } catch (modelErr: any) {
          console.warn(`[Tricha ${modelName}] Call error:`, modelErr?.message || modelErr);
        }
      }
    }

    // Dynamic Contextual Reasoning Fallback Engine (No asterisks, no buzzwords, highly tailored)
    let responseText = '';
    const q = message.toLowerCase();

    // Specific treatment & lifestyle checks first
    if (
      q.includes('phototherapy') ||
      q.includes('photo theray') ||
      q.includes('light therapy') ||
      q.includes('red light')
    ) {
      responseText = `Yes, morning phototherapy (bright light therapy around 10,000 lux) can be very helpful for accelerating your stress recovery.

When stress remains elevated as seen in your Month 1 hair reading (${m1} pg/mg vs your ${m3} pg/mg baseline), your body's natural 24-hour clock gets desynchronized. Spending 20 to 30 minutes in front of a morning phototherapy lamp within 60 minutes of waking helps anchor your morning alertness and naturally brings down nighttime stress hormone production.

However, timing is critical: never use bright phototherapy after 7:00 PM. Since taking ${totalLateCalls} late-night calls after 7:00 PM was the primary culprit behind your Month 2 spike (${m2} pg/mg) and lost deep sleep, using phototherapy strictly in the morning while protecting a 7:00 PM evening digital cutoff is the ideal protocol.`;
    } else if (
      q.includes('coffee') ||
      q.includes('caffeine') ||
      q.includes('tea') ||
      q.includes('espresso')
    ) {
      if (caffeineHabit === 'no_coffee') {
        responseText = `Since you do not drink coffee or consume caffeine, you are already protecting your natural circadian cortisol curve and adenosine clearance:

1. Continue relying on natural outdoor morning light within 30 minutes of waking to anchor your Cortisol Awakening Response (CAR) naturally.
2. Maintain strong hydration with electrolytes in the morning to support adrenal function during high-demand days without needing stimulants.
3. Your deep NREM Stage 3 sleep architecture remains uninhibited by caffeine half-life blocks, giving your brain optimal recovery conditions.`;
      } else {
        responseText = `To protect your recovery without disrupting your sleep:

1. Wait 60 to 90 minutes after waking before your first cup of coffee. Having caffeine immediately upon waking spikes morning stress hormones when your body is already trying to wake naturally.
2. Maintain a hard cutoff for caffeine by 2:00 PM so it has completely cleared your system before bedtime.
3. Pair your caffeine intake with hydration to prevent heart rate elevations during long meeting blocks.`;
      }
    } else if (
      q.includes('exercise') ||
      q.includes('workout') ||
      q.includes('gym') ||
      q.includes('cardio') ||
      q.includes('running')
    ) {
      responseText = `Exercise is fantastic for stress recovery, but the type and timing matter when your hair cortisol shows ongoing strain (${m1} pg/mg):

1. Prioritize Zone 2 cardio (steady walking, light cycling) or moderate resistance training in the morning or early afternoon.
2. Avoid intense high-intensity interval training (HIIT) late in the evening past 7:00 PM, as this further delays your deep sleep onset.
3. A 15-minute gentle outdoor walk after lunch helps clear daytime meeting fatigue without placing extra physical strain on your body.`;
    } else if (
      q.includes('supplement') ||
      q.includes('magnesium') ||
      q.includes('ashwagandha') ||
      q.includes('vitamin')
    ) {
      responseText = `While lifestyle changes like stopping calls past 7:00 PM have the greatest impact, two well-studied supplements can support your recovery:

1. Magnesium Glycinate (200–400 mg taken 30 minutes before bed) helps calm nervous system activity and promotes restorative deep sleep (helping you recover from the 42-minute deficit during your Month 2 peak).
2. L-Theanine (100–200 mg) can be paired with morning coffee to smooth out caffeine jitters and prevent stress spikes during demanding meeting blocks.

Always check with your physician before beginning new supplements, especially alongside your current medications.`;
    } else if (
      q.includes('month 1') ||
      q.includes('delayed') ||
      q.includes('elevated') ||
      q.includes('meetings dropped') ||
      q.includes('still high')
    ) {
      responseText = `Even though your daytime meeting hours dropped in Month 1, your hair test shows stress hormones stayed elevated at ${m1} pg/mg (+42% over baseline).

The reason is delayed recovery. Your calendar shows you continued taking 4 late calls every week after 7:00 PM. When you take calls late into the evening, your heart rate remains high and restorative deep sleep stays under 45 minutes, preventing your body from clearing the stress accumulated during your Month 2 peak (${m2} pg/mg).`;
    } else if (
      q.includes('spike') ||
      q.includes('month 2') ||
      q.includes('culprit') ||
      q.includes('cause') ||
      q.includes('why')
    ) {
      responseText = `The main culprit responsible for your Month 2 spike (${m2} pg/mg) was taking ${totalLateCalls} late-evening meetings after 7:00 PM combined with ${totalFlights} cross-country flights and peak 47.5-hour meeting weeks.

Elevated cortisol was merely the body's reaction. What actually caused the surge was that working late into the night prevented your brain and heart from relaxing, cutting your restorative deep sleep down to just 42 minutes per night.`;
    } else if (
      q.includes('reduce') ||
      q.includes('lower') ||
      q.includes('decrease') ||
      q.includes('step') ||
      q.includes('protocol') ||
      q.includes('action') ||
      q.includes('how to') ||
      q.includes('what should i do') ||
      q.includes('recover')
    ) {
      responseText = `To reduce your stress levels and bring your hair cortisol from ${m1} pg/mg back down to your healthy baseline (${m3} pg/mg), here are three targeted steps tailored to your schedule as a ${role}:

1. Hard 7:00 PM Calendar Curfew: Your data shows you took ${totalLateCalls} calls past 7:00 PM. Cutting off meetings after 7:00 PM allows your heart rate to slow down so you can double your deep sleep from 42 minutes back to the recommended 90 minutes.

2. Delayed Morning Coffee & Sunlight: Wait 60 to 90 minutes after waking before your first cup of coffee, and get 10 minutes of direct morning sunlight outdoors. This naturally clears residual morning grogginess without overstimulating stress hormones.

3. Protected Daytime Buffer Blocks: Add 15-minute buffers between back-to-back client calls and protect Tuesday and Thursday mornings as deep work time with zero meetings.

In 8 weeks, a follow-up 10-second hair snip at our certified partner salon will confirm if your root cortisol has returned to under 12.0 pg/mg.`;
    } else if (
      q.includes('calendar') ||
      q.includes('meeting') ||
      q.includes('google') ||
      q.includes('what is in my') ||
      q.includes('events') ||
      q.includes('schedule')
    ) {
      if (isDiscordant || realEventCount === 0 || isMedicalStudent) {
        responseText = `Looking directly at your synced Google Calendar, you currently have ${realEventCount} scheduled events (${totalMeetings} meeting hours, 0 flights, and ${totalLateCalls} late calls).

As a ${role}, your calendar is virtually clear of traditional corporate meetings. This illustrates a textbook Biomarker-Calendar Discordance: your 90-day hair cortisol analysis (${m2} pg/mg peak) captures the intense physical, emotional, and academic strain of medical training—including long hospital clinical postings, ward duties, standing fatigue, and medical examination preparation—which never get scheduled on a Google Calendar.

Because your stress is not caused by boardroom meetings, standard calendar rules do not apply to you. Instead, your recovery plan focuses on circadian anchoring between ward rotations and protecting restful sleep blocks during examination periods.`;
      } else {
        responseText = `Based on your calendar with ${totalMeetings} meeting hours and ${totalLateCalls} evening calls, we recommend two practical calendar boundaries: 1. Stop calls after 7:00 PM. 2. Insert daytime buffer blocks between back-to-back meetings.`;
      }
    } else if (
      q.includes('sleep') ||
      q.includes('deep sleep') ||
      q.includes('wake') ||
      q.includes('night') ||
      q.includes('rest')
    ) {
      responseText = `Your physiological telemetry indicates that during your peak stress period, restorative deep sleep was compromised.

Deep sleep is the exact biological window when your brain and body clear circulating stress hormones. For a ${role}, unpredictable hospital shifts or late-night study blocks delay sleep onset. Keeping a steady wake-up time, dimming overhead lights after duty, and taking a warm shower before bed will help restore your deep sleep.`;
    } else if (
      q.includes('hair') ||
      q.includes('test') ||
      q.includes('salon') ||
      q.includes('elisa') ||
      q.includes('accuracy')
    ) {
      responseText = `Unlike blood or saliva tests which only capture how stressed you are in a single moment, hair grows at about 1 centimeter per month and continuously incorporates circulating stress hormones from hair follicle capillaries.

Your 3.0 cm hair sample provided an exact 90-day biological record: Month 3 (${m3} pg/mg baseline), Month 2 (${m2} pg/mg surge), and Month 1 (${m1} pg/mg delayed recovery). A quick follow-up snip at our partner salon in 8 weeks will confirm your recovery progress.`;
    } else {
      if (isDiscordant || isMedicalStudent) {
        responseText = `Hello ${firstName}. Based on your 90-day hair test (${m3} pg/mg baseline to ${m2} pg/mg peak to ${m1} pg/mg today), your body has experienced significant physiologic stress despite your Google Calendar having virtually no meetings (${realEventCount} events).

This Biomarker-Calendar Discordance is common for a ${role}: hair cortisol is capturing the invisible strain of hospital ward rotations, medical study crunch, and irregular night shifts that don't appear on a calendar.

Would you like targeted recommendations for protecting sleep between clinical duties, circadian anchoring, or managing caffeine during study blocks?`;
      } else {
        responseText = `Hello ${firstName}. Based on your 90-day hair test (${m3} pg/mg baseline to ${m2} pg/mg peak to ${m1} pg/mg today), your body is making progress but still experiencing delayed recovery.

As a ${role}, the most effective change you can make today is protecting your evening wind-down time so your body can restore deep sleep.

Would you like specific recommendations for structuring your schedule, improving deep sleep, phototherapy, or managing caffeine?`;
      }
    }

    const cleanResponse = responseText.replace(/\*/g, '');
    return NextResponse.json({
      reply: cleanResponse,
      source: 'clinical-engine',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error processing chat query' },
      { status: 500 }
    );
  }
}
