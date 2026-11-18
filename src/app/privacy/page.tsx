import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy policy | BAALANCE',
  description: 'What BAALANCE collects, why, who processes it, and how to export or delete it.',
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated={SITE.lastUpdated}>
      <section>
        <p>
          BAALANCE measures three months of stress from a small lock of hair and uses your calendar to help explain it. This page
          says what we collect, why, who handles it, and how you stay in control. BAALANCE is at research stage. It is not a
          medical device and does not give a diagnosis.
        </p>
      </section>

      <section>
        <h2>The short version</h2>
        <ul>
          <li>Your data belongs to you. You can export it or delete it at any time from the Profile tab.</li>
          <li>We use it only to show you your own results. We do not sell it and we do not use it for advertising.</li>
          <li>Nothing in your calendar changes unless you approve that change.</li>
          <li>Employers who use the team view see anonymous team averages only, never an individual result.</li>
        </ul>
      </section>

      <section>
        <h2>What we collect and why</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Why</th>
              <th>Where it is kept</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Account: name and email</td>
              <td>To sign you in and keep your results private to you.</td>
              <td>Our database</td>
            </tr>
            <tr>
              <td>Hair cortisol results: one value per 1 cm segment</td>
              <td>To show your three-month timeline and score.</td>
              <td>Our database</td>
            </tr>
            <tr>
              <td>Lab report file, if you upload one</td>
              <td>Read once by our AI provider to pick out the three values.</td>
              <td>Not kept</td>
            </tr>
            <tr>
              <td>Calendar: meeting times, titles and attendee counts for the last 90 days</td>
              <td>To count meeting hours and meetings after 7 PM, and to suggest changes.</td>
              <td>Events stay in your browser. Weekly totals are saved to your profile.</td>
            </tr>
            <tr>
              <td>Questionnaire and PSS-10 answers</td>
              <td>To read your hair result in context.</td>
              <td>Our database</td>
            </tr>
            <tr>
              <td>Messages to Tricha, the AI coach</td>
              <td>To answer you, and to check messages for safety.</td>
              <td>Your browser. Sent to our AI provider to produce the reply.</td>
            </tr>
            <tr>
              <td>Location, only if you tap &ldquo;Use my location&rdquo;</td>
              <td>To list doctors near you for that one search.</td>
              <td>Not kept. Rounded to about 100 metres before it is sent.</td>
            </tr>
            <tr>
              <td>Activity log: approvals, declines, calendar changes</td>
              <td>So you can see everything that was done in your name.</td>
              <td>Our database, or your browser if you are not signed in</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3">The guest demo uses a fictional &ldquo;Sample Case&rdquo;. It is not a real person.</p>
      </section>

      <section>
        <h2>Calendar access</h2>
        <p>
          If you connect Outlook, Teams or Google Calendar, BAALANCE reads your events for the last 90 days. It can move a meeting
          you organise only after you press Approve for that meeting. It never changes a meeting someone else organises. You can
          remove BAALANCE&apos;s access at any time in your Microsoft or Google account settings.
        </p>
        <p className="mt-2">
          BAALANCE&apos;s use of information received from Google APIs adheres to the{' '}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. Google Calendar data is used only to provide the features described here. It
          is not used for advertising, is not sold, and is not used to train general AI models.
        </p>
      </section>

      <section>
        <h2>Who processes your data for us</h2>
        <ul>
          <li>Microsoft Azure: the AI coach and lab report reading (Azure OpenAI), safety checks on chat (Azure AI Content Safety), sign-in and calendar (Microsoft Entra ID and Microsoft Graph), and the doctor search (Azure Maps).</li>
          <li>Supabase: sign-in and the database, with row-level security so each person can reach only their own rows.</li>
          <li>Vercel: hosting.</li>
          <li>Google: sign-in and Google Calendar, if you choose them.</li>
          <li>The partner laboratory that measures your hair sample, on our instruction.</li>
        </ul>
        <p className="mt-2">Azure OpenAI does not use your data to train its models.</p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li>Export: Profile, then &ldquo;Export my data&rdquo;, gives you a file with everything we hold about you.</li>
          <li>Delete: Profile, then &ldquo;Delete my data&rdquo;, permanently removes your profile, results, calendar totals and activity log.</li>
          <li>Withdraw consent: disconnect your calendar or stop using the app at any time.</li>
          <li>Questions or complaints: write to <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</li>
        </ul>
        <p className="mt-2">We handle personal data in line with India&apos;s Digital Personal Data Protection Act, 2023.</p>
      </section>

      <section>
        <h2>Safety</h2>
        <p>
          Tricha is an AI coach, not a doctor or an emergency service. Messages are screened for signs of crisis so that we can
          show helpline and emergency information. We do not store the content of those messages, only that a safety check acted.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>BAALANCE is for adults aged 18 and over.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If we change this policy in a way that matters, we will say so in the app before the change takes effect.</p>
        <p className="mt-2">
          {SITE.name} is run by {SITE.owner}, New Delhi, India. Contact: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
