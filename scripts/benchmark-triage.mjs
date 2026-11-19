#!/usr/bin/env node
/**
 * Benchmark for Tricha's two deterministic safety layers:
 *   1. Care triage (src/lib/triage.ts): does a possible emergency stop the pipeline?
 *   2. Data checks (src/lib/dataChecks.ts): are missing or implausible inputs flagged?
 *
 * Runs the real source files, offline, in about a second:
 *   node scripts/benchmark-triage.mjs
 * Writes docs/benchmark-triage.md and src/data/benchmark-results.json (shown on /benchmarks).
 *
 * The cases are synthetic, written by the BAALANCE team: easy cases, and hard ones
 * (Hindi and Hinglish, denials such as "no chest pain", look-alikes such as
 * "chest day at the gym", other people's symptoms, typos and unit errors).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

function load(path) {
  const src = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', js)(module, module.exports, require);
  return module.exports;
}

const { triageMessage } = load('src/lib/triage.ts');
const { checkInputs } = load('src/lib/dataChecks.ts');

// ---- 1. Triage cases: [message, expected level, group] ----
const E = 'emergency', D = 'see_doctor', R = 'routine';
const TRIAGE = [
  // Emergencies, plainly said
  ['I have chest pain right now', E, 'emergency: plain'],
  ['My chest feels tight and heavy since this morning', E, 'emergency: plain'],
  ['I get chest pain at night when I lie down', E, 'emergency: plain'],
  ['There is a crushing pressure in my chest', E, 'emergency: plain'],
  ['I can not breathe properly, it is getting worse', E, 'emergency: plain'],
  ["I can't breathe after climbing stairs today", E, 'emergency: plain'],
  ['Shortness of breath and sweating at my desk', E, 'emergency: plain'],
  ['I fainted in the meeting room an hour ago', E, 'emergency: plain'],
  ['My colleague just collapsed next to me', E, 'emergency: plain'],
  ['I passed out twice this week', E, 'emergency: plain'],
  ['Her face is drooping and her speech is slurred', E, 'emergency: plain'],
  ['Sudden weakness on one side of my body', E, 'emergency: plain'],
  ['This is the worst headache of my life, it came on suddenly', E, 'emergency: plain'],
  ['I had a seizure yesterday', E, 'emergency: plain'],
  ['I am coughing up blood', E, 'emergency: plain'],
  ['My throat is swelling after eating nuts', E, 'emergency: plain'],
  ['My heart is racing and I feel dizzy and faint', E, 'emergency: plain'],
  // Emergencies, harder phrasing
  ['Since the deadline week my chest is tight, is that stress?', E, 'emergency: hard'],
  ['Is it normal to have pain in my chest during long calls?', E, 'emergency: hard'],
  ['pls help chest pain since 20 min', E, 'emergency: hard'],
  ['My father has chest pain and is sweating', E, 'emergency: hard'],
  ['Seene mein dard ho raha hai', E, 'emergency: Hindi'],
  ['Chhati me dard hai aur pasina aa raha hai', E, 'emergency: Hindi'],
  ['Saans nahi aa rahi', E, 'emergency: Hindi'],
  ['सीने में दर्द हो रहा है', E, 'emergency: Hindi'],
  ['Struggling to breathe and my lips feel numb', E, 'emergency: hard'],
  // See a doctor
  ['I have palpitations during busy weeks', D, 'see a doctor'],
  ['I have not slept properly in weeks, insomnia every night', D, 'see a doctor'],
  ['Should I take melatonin for sleep?', D, 'see a doctor'],
  ['Can I stop my antidepressant if my cortisol drops?', D, 'see a doctor'],
  ['I use a steroid cream for eczema, does that matter?', D, 'see a doctor'],
  ["I can't cope with work any more", D, 'see a doctor'],
  ['I had a panic attack before my presentation', D, 'see a doctor'],
  ['My hair is falling out in clumps', D, 'see a doctor'],
  ['I feel dizzy every afternoon', D, 'see a doctor'],
  ['I am pregnant, is the hair test still valid?', D, 'see a doctor'],
  ['Should I see a doctor about my results?', D, 'see a doctor'],
  ['Can you help me find a psychiatrist?', D, 'see a doctor'],
  // Routine, including look-alikes and denials that must NOT trigger an emergency
  ['Why was my cortisol high in September?', R, 'routine'],
  ['What should I change in my calendar?', R, 'routine'],
  ['How does the hair test work?', R, 'routine'],
  ['Is hair cortisol scientifically valid?', R, 'routine'],
  ['When should I re-test?', R, 'routine'],
  ['Thanks, that helps!', R, 'routine'],
  ['No chest pain, just tired all the time', R, 'routine: denial'],
  ['I have never fainted, but I feel drained after meetings', R, 'routine: denial'],
  ['No shortness of breath, only stress at work', R, 'routine: denial'],
  ['I do not have chest pain, I just want to understand my score', R, 'routine: denial'],
  ['I did chest day at the gym and my legs are sore', R, 'routine: look-alike'],
  ['Breathing exercises help me before meetings', R, 'routine: look-alike'],
  ['My deadlines are killing me this month', R, 'routine: look-alike'],
  ['That presentation took my breath away', R, 'routine: look-alike'],
  ['Meetings after 7 PM give me a headache', R, 'routine: look-alike'],
  ['Our sprint review collapsed into chaos', R, 'routine: look-alike'],
  // Added after the first run, to check the fixes generalise (not used to tune the rules)
  ['I cannot catch my breath since lunch', E, 'emergency: hard'],
  ['My mother suddenly collapsed in the kitchen', E, 'emergency: hard'],
  ['The deal collapsed and I am stressed', R, 'routine: look-alike'],
  ['Can not stop thinking about work', R, 'routine: look-alike'],
];

// ---- 2. Data-check cases: [name, input, expected warning field or null, group] ----
const seg = (vals, titles = ['July', 'August', 'September']) => vals.map((v, i) => ({ id: i + 1, title: titles[i], cortisolPgPerMg: v }));
const weeks = n => Array.from({ length: n }, (_, i) => ({ weekNumber: i + 1, meetingHours: 30, eveningCalls: 3, flightShifts: 0 }));
const DATA = [
  ['Complete, plausible inputs', { segments: seg([11.2, 28.4, 15.6]), telemetry: weeks(12), pss10Score: 22 }, null, 'complete'],
  ['No hair result at all', { segments: [], telemetry: weeks(12), pss10Score: 22 }, 'hair', 'missing'],
  ['Only two months of hair', { segments: seg([11.2, 28.4]), telemetry: weeks(12), pss10Score: 22 }, 'hair-info', 'missing'],
  ['A month with no value', { segments: seg([11.2, NaN, 15.6]), telemetry: weeks(12), pss10Score: 22 }, 'hair', 'missing'],
  ['Zero cortisol', { segments: seg([11.2, 0, 15.6]), telemetry: weeks(12), pss10Score: 22 }, 'hair', 'wrong value'],
  ['Negative cortisol', { segments: seg([11.2, -4, 15.6]), telemetry: weeks(12), pss10Score: 22 }, 'hair', 'wrong value'],
  ['Unit error: 2840 instead of 28.4', { segments: seg([11.2, 2840, 15.6]), telemetry: weeks(12), pss10Score: 22 }, 'hair', 'wrong value'],
  ['Same month twice', { segments: seg([11.2, 28.4, 15.6], ['July', 'July', 'September']), telemetry: weeks(12), pss10Score: 22 }, 'hair', 'wrong value'],
  ['No calendar connected', { segments: seg([11.2, 28.4, 15.6]), telemetry: [], pss10Score: 22 }, 'calendar-info', 'missing'],
  ['Calendar with 140 hours in a week', { segments: seg([11.2, 28.4, 15.6]), telemetry: [...weeks(11), { weekNumber: 12, meetingHours: 140, eveningCalls: 2, flightShifts: 0 }], pss10Score: 22 }, 'calendar', 'wrong value'],
  ['PSS-10 not taken', { segments: seg([11.2, 28.4, 15.6]), telemetry: weeks(12), pss10Score: null }, 'pss10-info', 'missing'],
  ['PSS-10 out of range (55)', { segments: seg([11.2, 28.4, 15.6]), telemetry: weeks(12), pss10Score: 55 }, 'pss10', 'wrong value'],
];

// ---- Run ----
const triageRows = TRIAGE.map(([message, expected, group]) => {
  const r = triageMessage(message);
  return { message, expected, actual: r.level, reasons: r.reasons.join(', '), group, pass: r.level === expected, component: 'Care triage (src/lib/triage.ts)' };
});

const dataRows = DATA.map(([name, input, expected, group]) => {
  const flags = checkInputs(input);
  let pass, actual;
  if (expected === null) {
    pass = !flags.some(f => f.severity === 'warn');
    actual = flags.filter(f => f.severity === 'warn').map(f => f.field).join(', ') || 'no warnings';
  } else if (expected.endsWith('-info')) {
    const field = expected.replace('-info', '');
    pass = flags.some(f => f.field === field);
    actual = flags.map(f => `${f.severity}:${f.field}`).join(', ') || 'nothing flagged';
  } else {
    pass = flags.some(f => f.field === expected && f.severity === 'warn');
    actual = flags.map(f => `${f.severity}:${f.field}`).join(', ') || 'nothing flagged';
  }
  return { name, expected: expected || 'no warnings', actual, group, pass, component: 'Data checks (src/lib/dataChecks.ts)' };
});

const emergencies = triageRows.filter(r => r.expected === E);
const nonEmergencies = triageRows.filter(r => r.expected !== E);
const sensitivity = emergencies.filter(r => r.actual === E).length / emergencies.length;
const falseAlarms = nonEmergencies.filter(r => r.actual === E).length;
const triagePass = triageRows.filter(r => r.pass).length;
const dataPass = dataRows.filter(r => r.pass).length;
const pct = x => `${Math.round(x * 1000) / 10}%`;

const groups = {};
triageRows.forEach(r => {
  groups[r.group] = groups[r.group] || { total: 0, pass: 0 };
  groups[r.group].total++;
  if (r.pass) groups[r.group].pass++;
});

const summary = {
  runAt: new Date().toISOString(),
  triage: {
    cases: triageRows.length,
    passed: triagePass,
    emergencyCases: emergencies.length,
    emergencyDetected: emergencies.filter(r => r.actual === E).length,
    sensitivity,
    nonEmergencyCases: nonEmergencies.length,
    falseAlarms,
    groups,
  },
  dataChecks: { cases: dataRows.length, passed: dataPass },
  failures: [...triageRows, ...dataRows].filter(r => !r.pass),
  triageRows,
  dataRows,
};

mkdirSync(new URL('../src/data', import.meta.url), { recursive: true });
writeFileSync(new URL('../src/data/benchmark-results.json', import.meta.url), JSON.stringify(summary, null, 2));

const esc = s => String(s).replace(/\|/g, '\\|');
const md = `# Tricha safety benchmark

- Run: ${summary.runAt.slice(0, 16).replace('T', ' ')} UTC, with \`node scripts/benchmark-triage.mjs\` (offline, on the real source files)
- **Emergency detection: ${summary.triage.emergencyDetected} of ${emergencies.length} (${pct(sensitivity)})**, false alarms: ${falseAlarms} of ${nonEmergencies.length}
- Triage overall: ${triagePass} of ${triageRows.length}; data checks: ${dataPass} of ${dataRows.length}
- Cases are synthetic, written by the BAALANCE team, including hard ones (Hindi, denials, look-alikes, unit errors).

## How this benchmark was used
The first run (19 Nov 2026) found two errors: "I can not breathe" (two words) was missed, and "Our sprint review collapsed into chaos" raised a false alarm. Both rules were fixed, and four new cases were added afterwards to check the fixes generalise. The results below are after the fix. The cases are our own, so they show the rules work on what we anticipated; the AIIMS pilot will test them on real messages.

## Triage by group
| Group | Passed |
|---|---|
${Object.entries(groups).map(([g, v]) => `| ${g} | ${v.pass} of ${v.total} |`).join('\n')}

## Failures (expected vs actual, and the component responsible)
${summary.failures.length ? `| Case | Expected | Actual | Component |\n|---|---|---|---|\n${summary.failures.map(f => `| ${esc(f.message || f.name)} | ${f.expected} | ${esc(f.actual)} | ${f.component} |`).join('\n')}` : 'None.'}

## All triage cases
| Message | Group | Expected | Actual | Why |
|---|---|---|---|---|
${triageRows.map(r => `| ${esc(r.message)} | ${r.group} | ${r.expected} | ${r.actual}${r.pass ? '' : ' (FAIL)'} | ${esc(r.reasons)} |`).join('\n')}

## All data-check cases
| Case | Group | Expected | Actual |
|---|---|---|---|
${dataRows.map(r => `| ${esc(r.name)} | ${r.group} | ${r.expected} | ${esc(r.actual)}${r.pass ? '' : ' (FAIL)'} |`).join('\n')}
`;
mkdirSync(new URL('../docs', import.meta.url), { recursive: true });
writeFileSync(new URL('../docs/benchmark-triage.md', import.meta.url), md);

console.log(`Emergency detection: ${summary.triage.emergencyDetected}/${emergencies.length} (${pct(sensitivity)}), false alarms ${falseAlarms}/${nonEmergencies.length}`);
console.log(`Triage: ${triagePass}/${triageRows.length}   Data checks: ${dataPass}/${dataRows.length}`);
for (const f of summary.failures) console.log(`FAIL  ${f.component.split(' (')[0]}: "${f.message || f.name}"  expected ${f.expected}, got ${f.actual}`);
