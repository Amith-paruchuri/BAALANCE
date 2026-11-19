import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import results from '@/data/benchmark-results.json';

export const metadata: Metadata = {
  title: 'How Tricha works | BAALANCE',
  description: 'The safety pipeline, the six agents on Microsoft Foundry, and how they are tested.',
};

const pct = (x: number) => `${Math.round(x * 1000) / 10}%`;

const PIPELINE = [
  { step: 'Input safety', what: 'Azure AI Content Safety, Prompt Shields and a crisis-language check (English and Hindi). Suicide or self-harm language stops here and shows helplines.' },
  { step: 'Care triage', what: 'Rules for medical red flags such as chest pain, trouble breathing, fainting or stroke signs. A possible emergency stops here, before any AI runs, and shows emergency numbers and the nearest hospital.' },
  { step: 'Data checks', what: 'Missing or implausible inputs (no hair result, a value of 2840 pg/mg, the same month twice, an empty calendar) are flagged, never guessed. The agents are told, and the reply asks the person to confirm.' },
  { step: 'Six agents on Microsoft Foundry', what: 'The Lead agent decides which specialists it needs and asks them at the same time. Each specialist uses its own read-only tools and reports a short brief with any flags.' },
  { step: 'Reviewer', what: 'Checks the draft against the briefs: every number and study must come from a specialist, no diagnosis or medicine advice, data problems stated, doctor advice kept.' },
  { step: 'Output safety', what: 'Azure AI Content Safety screens the reply, and any phone number that is not a verified helpline is removed.' },
];

const AGENTS = [
  { name: 'Lead', job: 'Talks to the person, chooses specialists, writes the draft, adds buttons.', rules: 'Has no data of its own; answers only from briefs. Must consult Evidence before any science claim and Care when triage says so.' },
  { name: 'Biomarker', job: 'Reads hair cortisol by month, the stress score and the PSS-10.', rules: 'Quotes values exactly; flags missing or implausible values; notes that hair cortisol and self-report are only modestly linked.' },
  { name: 'Calendar', job: 'Reads 90 days of Outlook meetings: hours, meetings after 7 PM, flights.', rules: 'Proposes at most three changes; cannot move anything; every change needs the person’s approval in the app.' },
  { name: 'Evidence', job: 'Searches 19 peer-reviewed papers with Azure AI Search.', rules: 'Reports only what the passages say, by author and year; says when there is no source.' },
  { name: 'Care', job: 'Decides routine, see a doctor, or urgent.', rules: 'Uses only verified helpline numbers; never diagnoses or suggests medicines.' },
  { name: 'Reviewer', job: 'Checks every draft before it is shown.', rules: 'Never adds facts; removes anything not supported by a brief; keeps safety advice.' },
];

const COMPARE = [
  { option: 'Wearable stress scores', gives: 'Minutes to days of heart-rate based stress', misses: 'Not a hormone measure; cannot show which month was hard' },
  { option: 'Questionnaires (PSS-10)', gives: 'How stressed you feel this month', misses: 'Self-report; only modestly linked to the body’s cortisol' },
  { option: 'Blood or saliva cortisol', gives: 'Cortisol at one moment', misses: 'Changes hour to hour; needs a clinic visit' },
  { option: 'Hair cortisol lab report alone', gives: 'Three months of cortisol, month by month', misses: 'A number with no explanation of the cause or what to change' },
  { option: 'BAALANCE', gives: 'The 3-month hair record, read next to the calendar and the PSS-10, with cited evidence and changes you approve', misses: 'Not a diagnosis; no Indian reference range yet (the pilot starts one)' },
];

export default function TrichaPage() {
  const t = results.triage;
  const d = results.dataChecks;
  return (
    <LegalPage title="How Tricha works" updated="19 November 2026">
      <section>
        <h2>The task</h2>
        <p>
          <strong>We help</strong> working professionals and resident doctors <strong>understand and reduce three months of chronic stress</strong>,{' '}
          <strong>using</strong> their hair cortisol (one value per month from a 3 cm lock of hair), their Outlook calendar and the PSS-10
          questionnaire. Tricha, the AI coach, explains what the numbers mean, what likely caused a high month, and what to change, and points to a
          doctor or emergency help when that is what is needed.
        </p>
      </section>

      <section>
        <h2>What happens to each message</h2>
        <ol>
          {PIPELINE.map(p => (
            <li key={p.step}>
              <strong>{p.step}.</strong> {p.what}
            </li>
          ))}
        </ol>
        <p>
          Under every reply in the chat, <em>How Tricha answered</em> shows each of these stages, what every agent was asked, what it found and what
          it flagged. Nothing in a calendar moves without the person approving that one meeting.
        </p>
      </section>

      <section>
        <h2>The six agents</h2>
        <ul className="!list-none !pl-0 space-y-2">
          {AGENTS.map(a => (
            <li key={a.name} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <strong>{a.name}.</strong> {a.job} <span className="text-slate-600">Rules: {a.rules}</span>
            </li>
          ))}
        </ul>
        <p>All six are hosted on Microsoft Foundry Agent Service and run on Azure OpenAI. Their tools are read-only.</p>
      </section>

      <section>
        <h2>How it is tested</h2>
        <p>
          <strong>
            Emergency detection: {t.emergencyDetected} of {t.emergencyCases} ({pct(t.sensitivity)}), with {t.falseAlarms} false alarms in{' '}
            {t.nonEmergencyCases} non-emergency messages.
          </strong>{' '}
          Data checks: {d.passed} of {d.cases} cases flagged correctly.
        </p>
        <ul>
          {Object.entries(t.groups as Record<string, { total: number; pass: number }>).map(([group, v]) => (
            <li key={group}>
              {group}: {v.pass} of {v.total}
            </li>
          ))}
        </ul>
        <p>
          The triage cases include Hindi and Hinglish, denials (&ldquo;no chest pain&rdquo;), look-alikes (&ldquo;chest day at the gym&rdquo;) and other
          people&rsquo;s symptoms. The data cases include missing months, zero and negative values, unit errors and duplicated months. The first run found
          two errors, a missed &ldquo;I can not breathe&rdquo; and a false alarm on &ldquo;the review collapsed&rdquo;; both were fixed and new cases were
          added to check the fix. A separate live evaluation sends 16 questions to the running agents and checks safety, sources, accuracy and the
          approval rule; it passed 16 of 16.
        </p>
      </section>

      <section>
        <h2>Compared with what exists</h2>
        <ul className="!list-none !pl-0 space-y-2">
          {COMPARE.map(c => (
            <li key={c.option} className={`p-3 rounded-xl border ${c.option === 'BAALANCE' ? 'border-[#0D4F59]/30 bg-[#0D4F59]/5' : 'border-slate-200 bg-slate-50/60'}`}>
              <strong>{c.option}.</strong> Gives: {c.gives}. <span className="text-slate-600">Limit: {c.misses}.</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Data, honestly</h2>
        <ul>
          <li>The guest demo uses a fictional &ldquo;Sample Case&rdquo;; it is labelled as sample data everywhere it appears.</li>
          <li>The benchmark cases are synthetic, written by the BAALANCE team. The pilot will test on real messages, with consent.</li>
          <li>The evidence library holds 19 peer-reviewed papers, each checked against its PubMed record, plus our own method notes.</li>
          <li>Your data is used only with your consent, never to train a model, and you can export or delete it in the app.</li>
        </ul>
      </section>

      <section>
        <h2>Limits</h2>
        <ul>
          <li>BAALANCE is a research-stage wellness tool, not a diagnosis. There is no agreed clinical reference range for hair cortisol yet.</li>
          <li>Hair grows at different speeds, so months are approximate; dye and steroid creams can shift values.</li>
          <li>Triage rules cover English, Hindi and Hinglish phrasing we anticipated; unusual wording may be missed, which is why Content Safety and the Care agent also check.</li>
          <li>Team answers take about 10 to 15 seconds.</li>
        </ul>
      </section>

      <section>
        <h2>Pilot</h2>
        <p>
          150 resident doctors at AIIMS New Delhi, two hair samples three months apart, after ethics approval. The main measure: does the hair pick each
          doctor&rsquo;s hardest month against the duty roster? Chance is 1 in 3; the target is 60%. We report the result either way.
        </p>
        <p>
          See also <Link href="/azure">the live status of every Microsoft service</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
