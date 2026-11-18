/**
 * The evidence Tricha is allowed to cite. Answers about the science are
 * grounded in these passages (retrieval-augmented generation), and each
 * passage carries its source so the reply can show where a claim comes from.
 *
 * Retrieval uses Azure AI Search when AZURE_SEARCH_ENDPOINT, AZURE_SEARCH_KEY
 * and AZURE_SEARCH_INDEX are set (index it with scripts/index-evidence.mjs),
 * and a built-in keyword search otherwise.
 *
 * Keep every passage conservative and true to its source.
 */

export interface EvidencePassage {
  id: string;
  title: string;
  source: string;
  url?: string;
  text: string;
}

export const EVIDENCE: EvidencePassage[] = [
  {
    id: 'growth-rate',
    title: 'Why 3 cm of hair is about 3 months',
    source: 'BAALANCE method note',
    text: 'Scalp hair grows about 1 cm a month on average. Cortisol from the blood is built into the hair as it grows, so each centimetre holds roughly one month of cortisol. A 3 cm sample cut at the scalp covers about the last three months: the centimetre nearest the scalp is the most recent month. Growth rate varies between people, so the months are approximate.',
  },
  {
    id: 'lab-method',
    title: 'How the lab measures hair cortisol',
    source: 'Meyer J, et al. Extraction and analysis of cortisol from human and monkey hair. J Vis Exp. 2014;(83):e50882',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24513702/',
    text: 'A published step-by-step laboratory protocol describes washing the hair to remove surface contamination, grinding it, extracting the cortisol, and measuring it with an immunoassay. BAALANCE asks the partner lab to cut the sample into 1 cm segments and measure each one, giving one value per month in picograms of cortisol per milligram of hair (pg/mg).',
  },
  {
    id: 'meta-analysis',
    title: 'Hair cortisol is higher under chronic stress',
    source: 'Stalder T, et al. Stress-related and basic determinants of hair cortisol in humans: a meta-analysis. Psychoneuroendocrinology. 2017;77:261-274',
    text: 'A meta-analysis pooling many studies found that groups exposed to chronic stress had higher hair cortisol than comparison groups, and the difference was larger when the stress was still going on at the time of sampling. It also found that hair cortisol was not consistently related to how stressed people said they felt. Other factors, such as age, sex, hair washing and hair treatment, also influence the values.',
  },
  {
    id: 'systematic-review',
    title: 'Hair cortisol, stress exposure and mental health',
    source: 'Staufenbiel SM, et al. Hair cortisol, stress exposure, and mental health in humans: a systematic review. Psychoneuroendocrinology. 2013;38(8):1220-1235',
    url: 'https://doi.org/10.1016/j.psyneuen.2012.11.015',
    text: 'A systematic review examined studies linking hair cortisol with stress exposure and with mental health conditions. It concluded that hair cortisol is a promising measure of long-term cortisol exposure, while noting that findings differ between conditions and that more standardised research is needed.',
  },
  {
    id: 'cardiovascular',
    title: 'Hair cortisol as a marker of chronic stress in heart disease',
    source: 'Iob E, Steptoe A. Cardiovascular disease and hair cortisol: a novel biomarker of chronic stress. Curr Cardiol Rep. 2019;21(10):116',
    url: 'https://pubmed.ncbi.nlm.nih.gov/31471749/',
    text: 'A review describes hair cortisol as a new biomarker of chronic stress and summarises studies relating raised hair cortisol to cardiovascular disease and its risk factors. The authors treat it as a research measure and call for longitudinal studies.',
  },
  {
    id: 'pss10',
    title: 'The PSS-10 questionnaire',
    source: 'Cohen S, Kamarck T, Mermelstein R. A global measure of perceived stress. J Health Soc Behav. 1983;24(4):385-396',
    url: 'https://pubmed.ncbi.nlm.nih.gov/6668417/',
    text: 'The Perceived Stress Scale asks how often in the last month a person found life unpredictable, uncontrollable and overloaded. The 10-item version is scored from 0 to 40, with four items reverse scored. Scores of 0 to 13 are usually read as low, 14 to 26 as moderate and 27 to 40 as high. It is a screening questionnaire, not a diagnosis. BAALANCE pairs it with hair cortisol because the two measure different things: how stressed you feel, and the body\'s cortisol load.',
  },
  {
    id: 'limits',
    title: 'What hair cortisol cannot tell you',
    source: 'BAALANCE method note',
    text: 'There is no agreed clinical reference range for hair cortisol yet. Hair dye and bleaching, steroid medicines (including creams and inhalers), pregnancy, and conditions such as Cushing\'s and Addison\'s disease can change readings. Trends between samples from the same person are more informative than a single cut-off. BAALANCE is a research-stage tool and does not give a diagnosis. Very high values, or worrying symptoms, should be discussed with a doctor.',
  },
  {
    id: 'reading-values',
    title: 'How BAALANCE reads the numbers',
    source: 'BAALANCE method note',
    text: 'BAALANCE treats hair cortisol below 14.0 pg/mg as the healthy range for its reports, values between 14 and 20 as raised, and values above 20 as high. These bands are working thresholds for the app, not clinical cut-offs. The 3-month stress score combines the three monthly hair values with calendar load, and a score below 35 is treated as healthy.',
  },
  {
    id: 'collection',
    title: 'How the sample is collected',
    source: 'BAALANCE collection guide',
    text: 'A pencil-thin lock of hair is taken from the back of the head, under the top layer, so the haircut looks unchanged. It is tied at the root, cut as close to the scalp as possible at about 3 cm, the scalp end is marked so the lab knows which end is newest, and it is folded into foil and sealed in a labelled envelope. There is no blood, no needle and no electronics. It can be done in about 30 seconds during a normal haircut, or at home with a kit.',
  },
  {
    id: 'calendar-link',
    title: 'Why the calendar is read next to the hair result',
    source: 'BAALANCE method note',
    text: 'Hair shows when cortisol was high but not why. BAALANCE reads the same 90 days of the person\'s calendar and counts meeting hours, meetings after 7 PM and flights, to see whether busy or late weeks line up with the high month. A match is an association in the person\'s own data, not proof of cause. When the calendar does not explain a high reading, the cause is likely outside it, such as shifts, study, sleep or life events.',
  },
  {
    id: 'consent',
    title: 'Consent and control',
    source: 'BAALANCE privacy policy',
    url: 'https://www.baalance.in/privacy',
    text: 'BAALANCE can move a meeting only after the person presses Approve for that meeting, and only meetings they organise. Every approval, decline and calendar change is written to an activity log the person can read. They can export or delete their data from the Profile tab. Employers see anonymous team averages only.',
  },
];

const STOP = new Set('a an and are as at be by can do does for from how i in is it me my of on or so than that the this to what when which who why will with you your'.split(' '));
const tokens = (text: string) => (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(t => t.length > 1 && !STOP.has(t));

/** Built-in retrieval: scores passages by the query words they contain, weighting rare words and the title. */
export function searchEvidenceLocal(query: string, top = 3): EvidencePassage[] {
  const q = Array.from(new Set(tokens(query)));
  if (q.length === 0) return [];
  const docs = EVIDENCE.map(passage => ({ passage, body: new Set(tokens(passage.text)), title: new Set(tokens(passage.title)) }));
  const stem = (set: Set<string>, t: string) => set.has(t) || Array.from(set).some(w => w.length > 3 && t.length > 3 && (w.startsWith(t) || t.startsWith(w)));
  // A word found in few passages says more about what is being asked than one found in most.
  const weight = (t: string) => {
    const df = docs.filter(d => stem(d.body, t) || stem(d.title, t)).length;
    return df === 0 ? 0 : Math.log(1 + docs.length / df);
  };
  return docs
    .map(d => ({
      passage: d.passage,
      score: q.reduce((sum, t) => sum + weight(t) * ((stem(d.title, t) ? 2 : 0) + (stem(d.body, t) ? 1 : 0)), 0),
    }))
    .filter(r => r.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, top)
    .map(r => r.passage);
}

function searchConfig() {
  const endpoint = (process.env.AZURE_SEARCH_ENDPOINT || '').trim().replace(/\/+$/, '');
  const key = (process.env.AZURE_SEARCH_KEY || '').trim();
  const index = (process.env.AZURE_SEARCH_INDEX || '').trim();
  return endpoint && key && index ? { endpoint, key, index } : null;
}

export function evidenceBackend(): 'azure-ai-search' | 'built-in' {
  return searchConfig() ? 'azure-ai-search' : 'built-in';
}

/** Retrieval for grounding: Azure AI Search when configured, the built-in search otherwise. */
export async function searchEvidence(query: string, top = 3): Promise<{ passages: EvidencePassage[]; backend: 'azure-ai-search' | 'built-in' }> {
  const cfg = searchConfig();
  if (cfg) {
    try {
      const res = await fetch(`${cfg.endpoint}/indexes/${encodeURIComponent(cfg.index)}/docs/search?api-version=2024-07-01`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': cfg.key },
        body: JSON.stringify({ search: query, top, select: 'id,title,source,url,text' }),
      });
      if (res.ok) {
        const data = await res.json();
        const passages: EvidencePassage[] = (data?.value || [])
          .filter((d: any) => d?.id && d?.text)
          .map((d: any) => ({ id: String(d.id), title: String(d.title || ''), source: String(d.source || ''), url: d.url || undefined, text: String(d.text) }));
        if (passages.length > 0) return { passages, backend: 'azure-ai-search' };
      } else {
        console.warn('[BAALANCE Evidence] Azure AI Search error:', res.status);
      }
    } catch (err: any) {
      console.warn('[BAALANCE Evidence] Azure AI Search request failed:', err?.message || err);
    }
  }
  return { passages: searchEvidenceLocal(query, top), backend: 'built-in' };
}
