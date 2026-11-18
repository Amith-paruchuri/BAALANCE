#!/usr/bin/env node
/**
 * Loads the BAALANCE evidence library into Azure AI Search, so Tricha's
 * retrieval runs there instead of on the built-in keyword search.
 *
 *   AZURE_SEARCH_ENDPOINT=https://<name>.search.windows.net \
 *   AZURE_SEARCH_KEY=<admin key> \
 *   AZURE_SEARCH_INDEX=baalance-evidence \
 *   node scripts/index-evidence.mjs
 *
 * Then set the same three variables in Vercel (a query key is enough there).
 * Not yet run against a real search service: check the output the first time.
 */
import { readFileSync } from 'node:fs';

const endpoint = (process.env.AZURE_SEARCH_ENDPOINT || '').replace(/\/+$/, '');
const key = process.env.AZURE_SEARCH_KEY || '';
const index = process.env.AZURE_SEARCH_INDEX || 'baalance-evidence';
const api = '2024-07-01';
if (!endpoint || !key) {
  console.error('Set AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_KEY first.');
  process.exit(1);
}

// Read the passages straight out of the TypeScript source so there is one copy of the library.
const source = readFileSync(new URL('../src/lib/evidence.ts', import.meta.url), 'utf8');
const block = source.slice(source.indexOf('export const EVIDENCE'), source.indexOf('];', source.indexOf('export const EVIDENCE')) + 1);
const passages = Function(`return ${block.slice(block.indexOf('['))}`)();

const headers = { 'Content-Type': 'application/json', 'api-key': key };
const put = await fetch(`${endpoint}/indexes/${index}?api-version=${api}`, {
  method: 'PUT',
  headers,
  body: JSON.stringify({
    name: index,
    fields: [
      { name: 'id', type: 'Edm.String', key: true, filterable: true },
      { name: 'title', type: 'Edm.String', searchable: true },
      { name: 'source', type: 'Edm.String', searchable: true },
      { name: 'url', type: 'Edm.String' },
      { name: 'text', type: 'Edm.String', searchable: true },
    ],
  }),
});
console.log('Index:', put.status, put.ok ? 'ready' : await put.text());

const upload = await fetch(`${endpoint}/indexes/${index}/docs/index?api-version=${api}`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ value: passages.map(p => ({ '@search.action': 'mergeOrUpload', id: p.id, title: p.title, source: p.source, url: p.url || null, text: p.text })) }),
});
console.log('Upload:', upload.status, upload.ok ? `${passages.length} passages` : await upload.text());
