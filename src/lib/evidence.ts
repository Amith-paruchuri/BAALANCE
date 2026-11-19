/**
 * The evidence Tricha is allowed to cite. Answers about the science are
 * grounded in these passages (retrieval-augmented generation), and each
 * passage carries its source so the reply can show where a claim comes from.
 *
 * Retrieval uses Azure AI Search when AZURE_SEARCH_ENDPOINT and
 * AZURE_SEARCH_KEY (an admin key) are set: the app creates the index and loads
 * this library itself (ensureSearchIndex). A built-in keyword search is used
 * otherwise, or if the service cannot be reached.
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
    source: 'BAALANCE method note, based on Kirschbaum C, et al. Psychoneuroendocrinology. 2009;34(1):32-7',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18947933/',
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
  {
    id: 'retrospective-calendar',
    title: 'Hair as a calendar of cortisol',
    source: 'Kirschbaum C, Tietze A, Skoluda N, Dettenborn L. Hair as a retrospective calendar of cortisol production. Psychoneuroendocrinology. 2009;34(1):32-7',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18947933/',
    text: 'A proof-of-concept study cut hair into segments, assuming growth of about 1 cm a month, and compared new mothers with women who were not pregnant. The segment closest to the scalp of new mothers held about twice as much cortisol, which fits the known rise in cortisol late in pregnancy, so segments can be read as earlier and later months. Cortisol also fell steadily in segments further from the scalp, so the authors judged the hair calendar reliable for roughly the most recent six months.',
  },
  {
    id: 'review-russell-2012',
    title: 'Hair cortisol as a marker of chronic stress',
    source: 'Russell E, Koren G, Rieder M, Van Uum S. Hair cortisol as a biological marker of chronic stress. Psychoneuroendocrinology. 2012;37(5):589-601',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21974976/',
    text: 'A narrative review explains that blood, saliva and urine show cortisol at a single moment, while hair reflects cortisol exposure over longer periods, roughly month by month. It reviews how the method developed and where it is used, and lists its limitations and open questions.',
  },
  {
    id: 'review-stalder-2012',
    title: 'Hair cortisol reflects months of cortisol output',
    source: 'Stalder T, Kirschbaum C. Analysis of cortisol in hair: state of the art and future directions. Brain Behav Immun. 2012;26(7):1019-29',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22366690/',
    text: 'A review argues that hair cortisol captures cumulative cortisol output over several months, which one-off blood, saliva or urine tests capture poorly. It summarises evidence that the measure is valid for long-term cortisol, gives similar results when repeated, and is fairly robust to several confounding factors.',
  },
  {
    id: 'methods-greff-2019',
    title: 'Method limits: growth rate, sampling and assays',
    source: 'Greff MJE, et al. Hair cortisol analysis: an update on methodological considerations and clinical applications. Clin Biochem. 2019;63:1-9',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30261181/',
    text: 'A methods review covers how cortisol enters hair, hair growth rates, sampling, sample preparation, extraction and the choice of assay. It notes that differences in hair growth between people limit how precisely segments can be dated. It also describes clinical uses being studied, such as Cushing syndrome, adrenal insufficiency, monitoring of steroid treatment, heart disease, stress and mental illness.',
  },
  {
    id: 'lab-agreement',
    title: 'Do different labs get the same result?',
    source: 'Russell E, et al. Toward standardization of hair cortisol measurement: results of the first international interlaboratory round robin. Ther Drug Monit. 2015;37(1):71-5',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25387254/',
    text: 'Four leading laboratories measured the same hair samples with four immunoassay methods, such as ELISA, and two mass spectrometry (LC-MS/MS) methods. Results from the immunoassays agreed closely with each other and with mass spectrometry, although absolute values differed, so the authors proposed conversion factors as a step toward shared reference values. Comparing values is therefore safest within the same lab and method.',
  },
  {
    id: 'shift-work',
    title: 'Shift work and hair cortisol',
    source: 'Manenschijn L, et al. Shift work at young age is associated with elevated long-term cortisol levels and body mass index. J Clin Endocrinol Metab. 2011;96(11):E1862-5',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21880805/',
    text: 'A cross-sectional study compared 33 shift workers with 89 day workers. Shift workers had higher hair cortisol on average (about 47 against 30 pg/mg), and the difference was seen mainly in the younger workers. Because it measured people at one point in time, it shows an association, not that shift work caused the difference.',
  },
  {
    id: 'burnout-penz-2018',
    title: 'Hair cortisol and burnout',
    source: 'Penz M, et al. Hair cortisol as a biological marker for burnout symptomatology. Psychoneuroendocrinology. 2018;87:218-221',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28781093/',
    text: 'In a population-based study from Dresden with over 300 hair samples, people with burnout symptoms on the Maslach Burnout Inventory had higher hair cortisol. Depressive symptoms were not clearly linked to hair cortisol. It is a cross-sectional study, so it shows an association rather than cause.',
  },
  {
    id: 'health-workers-ibar-2021',
    title: 'Hair cortisol in hospital staff',
    source: 'Ibar C, et al. Evaluation of stress, burnout and hair cortisol levels in health workers at a University Hospital during COVID-19 pandemic. Psychoneuroendocrinology. 2021;128:105213',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33845387/',
    text: 'A study of 234 hospital staff in Buenos Aires, including doctors, residents and nurses, found that about 40% had hair cortisol above the reference range used. Staff with burnout had higher hair cortisol than those without. Links between hair cortisol and perceived stress or emotional exhaustion were weak, which is why BAALANCE reads hair cortisol next to a questionnaire rather than in place of one.',
  },
  {
    id: 'residents-tawfik-2023',
    title: 'Tracking residents with repeated hair samples',
    source: 'Tawfik DS, et al. Prevalence of burnout and its relation to the neuroendocrine system among pediatric residents during the early Covid-19 pandemic: a pilot feasibility study. Compr Psychoneuroendocrinol. 2023;14:100174',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36742128/',
    text: 'A small pilot followed 17 paediatric residents in the United States with surveys and hair samples every three months. Most reported burnout at least once, and collecting hair repeatedly was feasible. In this small group, burnout scores were not significantly linked to hair cortisol, so it supports tracking over time rather than using hair cortisol to diagnose burnout.',
  },
  {
    id: 'anaesthesiologists-2022',
    title: 'Hair cortisol across a doctor\'s career',
    source: 'van der Wal RAB, et al. Chronic stress indicated by hair cortisol concentration in anaesthesiologists and its relationship to work experience and emotional intelligence. Eur J Anaesthesiol. 2022;39(1):26-32',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33278085/',
    text: 'A cross-sectional study of 184 Dutch anaesthesiologists, 61 of them residents, found hair cortisol was highest early and late in consultants\' careers. That pattern did not match how stressed they said they were, another sign that hair cortisol and self-reported stress measure different things.',
  },
  {
    id: 'residents-burnout-low-2019',
    title: 'How common burnout is in residents',
    source: 'Low ZX, et al. Prevalence of burnout in medical and surgical residents: a meta-analysis. Int J Environ Res Public Health. 2019;16(9):1479',
    url: 'https://pubmed.ncbi.nlm.nih.gov/31027333/',
    text: 'A meta-analysis of studies covering about 22,800 residents across specialties and countries estimated that about half had burnout, with large differences between studies, specialties and regions.',
  },
  {
    id: 'physicians-burnout-rotenstein-2018',
    title: 'Burnout in practising doctors is measured in many ways',
    source: 'Rotenstein LS, et al. Prevalence of burnout among physicians: a systematic review. JAMA. 2018;320(11):1131-1150',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30326495/',
    text: 'A systematic review of 182 studies of practising physicians in 45 countries found reported burnout ranging from 0% to about 80%, with over 140 different definitions in use. The authors concluded that no single figure can be given and called for standard definitions and measures.',
  },
  {
    id: 'diurnal-slope',
    title: 'Why evenings matter: the daily cortisol curve',
    source: 'Adam EK, et al. Diurnal cortisol slopes and mental and physical health outcomes: a systematic review and meta-analysis. Psychoneuroendocrinology. 2017;83:25-41',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28578301/',
    text: 'Cortisol normally peaks in the morning and falls through the day. A meta-analysis of 80 studies, using saliva or blood rather than hair, found that a flatter fall from morning to evening was linked with worse mental and physical health, although the effect was small. It cannot say whether the flat curve causes poor health or only marks it. BAALANCE uses this as the reason to protect evenings, not as proof that late meetings cause harm.',
  },
  {
    id: 'growth-varies',
    title: 'Hair growth differs between people',
    source: 'Wennig R. Potential problems with the interpretation of hair analysis results. Forensic Sci Int. 2000;107(1-3):5-12',
    url: 'https://pubmed.ncbi.nlm.nih.gov/10689559/',
    text: 'Hair growth rate varies with body site, age, sex, ethnicity and from person to person, which makes dating a hair segment approximate. This is why BAALANCE describes each centimetre as about one month rather than an exact calendar month.',
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
  const index = (process.env.AZURE_SEARCH_INDEX || 'baalance-evidence').trim();
  return endpoint && key ? { endpoint, key, index } : null;
}

const API = '2024-07-01';
const META_ID = 'corpus-meta';
const SEMANTIC = 'baalance-semantic';

/** A short fingerprint of the library, so the index is refreshed only when a passage changes. */
function corpusHash(): string {
  const json = JSON.stringify(EVIDENCE);
  let h = 5381;
  for (let i = 0; i < json.length; i++) h = ((h << 5) + h + json.charCodeAt(i)) | 0;
  return `v1-${EVIDENCE.length}-${(h >>> 0).toString(16)}`;
}

function indexDefinition(name: string) {
  return {
    name,
    fields: [
      { name: 'id', type: 'Edm.String', key: true, filterable: true },
      { name: 'kind', type: 'Edm.String', filterable: true, searchable: false },
      { name: 'title', type: 'Edm.String', searchable: true, analyzer: 'en.microsoft' },
      { name: 'source', type: 'Edm.String', searchable: true, analyzer: 'en.microsoft' },
      { name: 'url', type: 'Edm.String', searchable: false },
      { name: 'text', type: 'Edm.String', searchable: true, analyzer: 'en.microsoft' },
    ],
    scoringProfiles: [{ name: 'title-first', text: { weights: { title: 3, text: 1, source: 0.5 } } }],
    defaultScoringProfile: 'title-first',
    semantic: {
      configurations: [
        {
          name: SEMANTIC,
          prioritizedFields: {
            titleField: { fieldName: 'title' },
            prioritizedContentFields: [{ fieldName: 'text' }],
            prioritizedKeywordsFields: [{ fieldName: 'source' }],
          },
        },
      ],
    },
  };
}

async function searchFetch(path: string, init: { method?: string; body?: unknown } = {}) {
  const cfg = searchConfig()!;
  const sep = path.includes('?') ? '&' : '?';
  return fetch(`${cfg.endpoint}${path}${sep}api-version=${API}`, {
    method: init.method || (init.body === undefined ? 'GET' : 'POST'),
    headers: { 'Content-Type': 'application/json', 'api-key': cfg.key },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
}

let indexReady: { at: number } | null = null;
let indexError: string | null = null;
let lastMode: 'semantic' | 'keyword' | null = null;

/**
 * Creates the Azure AI Search index and loads the library into it the first
 * time a server instance needs it, and again whenever a passage changes. No
 * script to run: setting the three AZURE_SEARCH_* variables is enough.
 * Needs an admin key (a query key cannot create the index).
 */
export async function ensureSearchIndex(): Promise<boolean> {
  const cfg = searchConfig();
  if (!cfg) return false;
  if (indexReady && Date.now() - indexReady.at < 10 * 60 * 1000) return true;
  const idx = `/indexes/${encodeURIComponent(cfg.index)}`;
  const hash = corpusHash();
  try {
    const meta = await searchFetch(`${idx}/docs/${META_ID}`);
    if (meta.ok) {
      const doc = await meta.json();
      if (doc?.text === hash) {
        indexReady = { at: Date.now() };
        indexError = null;
        return true;
      }
    }

    let put = await searchFetch(idx, { method: 'PUT', body: indexDefinition(cfg.index) });
    if (!put.ok && put.status === 400) {
      // An older index with a different shape: it holds only this public library, so rebuild it.
      await searchFetch(idx, { method: 'DELETE' });
      put = await searchFetch(idx, { method: 'PUT', body: indexDefinition(cfg.index) });
    }
    if (!put.ok) throw new Error(`index setup failed (${put.status}): ${(await put.text()).slice(0, 200)}`);

    // Remove passages that are no longer in the library, then upload the current ones.
    const listed = await searchFetch(`${idx}/docs/search`, { body: { search: '*', filter: "kind eq 'passage'", select: 'id', top: 1000 } });
    const existing: string[] = listed.ok ? ((await listed.json())?.value || []).map((d: any) => String(d.id)) : [];
    const current = new Set(EVIDENCE.map(p => p.id));
    const actions = [
      ...existing.filter(id => !current.has(id)).map(id => ({ '@search.action': 'delete', id })),
      ...EVIDENCE.map(p => ({ '@search.action': 'mergeOrUpload', id: p.id, kind: 'passage', title: p.title, source: p.source, url: p.url || null, text: p.text })),
      { '@search.action': 'mergeOrUpload', id: META_ID, kind: 'meta', title: 'corpus version', source: 'BAALANCE', url: null, text: hash },
    ];
    const upload = await searchFetch(`${idx}/docs/index`, { body: { value: actions } });
    if (!upload.ok) throw new Error(`upload failed (${upload.status}): ${(await upload.text()).slice(0, 200)}`);
    console.info(`[BAALANCE Evidence] Azure AI Search index ${cfg.index} loaded with ${EVIDENCE.length} passages (${hash}).`);
    indexReady = { at: Date.now() };
    indexError = null;
    return true;
  } catch (err: any) {
    indexReady = null;
    indexError = String(err?.message || err).slice(0, 300);
    console.warn('[BAALANCE Evidence]', indexError);
    return false;
  }
}

export function evidenceBackend(): 'azure-ai-search' | 'built-in' {
  return searchConfig() ? 'azure-ai-search' : 'built-in';
}

/** For the status page. No secrets. */
export async function searchStatus() {
  const cfg = searchConfig();
  if (!cfg) return { on: false, configured: false, index: null as string | null, mode: null as string | null, passages: EVIDENCE.length };
  const ok = await ensureSearchIndex();
  return { on: ok, configured: true, index: cfg.index, mode: lastMode, passages: EVIDENCE.length };
}

function toPassages(data: any): EvidencePassage[] {
  return (data?.value || [])
    .filter((d: any) => d?.id && d?.text && d.id !== META_ID)
    .map((d: any) => ({ id: String(d.id), title: String(d.title || ''), source: String(d.source || ''), url: d.url || undefined, text: String(d.text) }));
}

/**
 * Retrieval for grounding. With Azure AI Search configured: semantic ranking
 * first, plain keyword search if the semantic ranker is not available on the
 * service, and the built-in search if Azure AI Search cannot be reached.
 */
export async function searchEvidence(query: string, top = 3): Promise<{ passages: EvidencePassage[]; backend: 'azure-ai-search' | 'built-in' }> {
  const cfg = searchConfig();
  if (cfg && (await ensureSearchIndex())) {
    const path = `/indexes/${encodeURIComponent(cfg.index)}/docs/search`;
    const base = { search: query, top, filter: "kind eq 'passage'", select: 'id,title,source,url,text' };
    try {
      if (lastMode !== 'keyword') {
        const res = await searchFetch(path, { body: { ...base, queryType: 'semantic', semanticConfiguration: SEMANTIC } });
        if (res.ok) {
          lastMode = 'semantic';
          const passages = toPassages(await res.json());
          if (passages.length > 0) return { passages, backend: 'azure-ai-search' };
        } else {
          console.warn('[BAALANCE Evidence] Semantic ranking unavailable, using keyword search:', res.status);
          lastMode = 'keyword';
        }
      }
      const res = await searchFetch(path, { body: { ...base, queryType: 'simple', searchMode: 'any' } });
      if (res.ok) {
        if (lastMode === null) lastMode = 'keyword';
        const passages = toPassages(await res.json());
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
