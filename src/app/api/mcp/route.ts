import { NextRequest, NextResponse } from 'next/server';
import { clientIp, rateLimit } from '@/lib/serverAuth';
import { searchEvidence } from '@/lib/evidence';
import { HELPLINES, type HelpRegion } from '@/lib/helplines';

export const dynamic = 'force-dynamic';

/**
 * A small Model Context Protocol (MCP) server, so other agents (for example
 * one built in Microsoft Foundry) can call BAALANCE's public tools over HTTP.
 *
 * Only tools that involve no personal data are exposed: the evidence library
 * and the helpline directory. Nothing here can read a user's results or
 * calendar. Transport: JSON-RPC 2.0 over POST, one JSON response per request.
 */

const SERVER_INFO = { name: 'baalance', version: '1.0.0' };
const DEFAULT_PROTOCOL = '2025-03-26';

const TOOLS = [
  {
    name: 'search_hair_cortisol_evidence',
    description: 'Search the BAALANCE evidence library: published studies and method notes on hair cortisol as a measure of long-term stress, its limits, the lab method, and the PSS-10 questionnaire. Returns passages with their sources.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'What to look up, in plain words.' } },
      required: ['query'],
    },
  },
  {
    name: 'get_crisis_helplines',
    description: 'Emergency numbers and mental health helplines for India, the UAE, or other countries.',
    inputSchema: {
      type: 'object',
      properties: { region: { type: 'string', enum: ['india', 'uae', 'other'] } },
      required: ['region'],
    },
  },
];

const ok = (id: unknown, result: unknown) => ({ jsonrpc: '2.0', id, result });
const fail = (id: unknown, code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

async function handle(msg: any): Promise<object | null> {
  const id = msg?.id;
  const method = msg?.method;
  if (msg?.jsonrpc !== '2.0' || typeof method !== 'string') return fail(id, -32600, 'Invalid request.');
  // Notifications carry no id and get no response.
  if (id === undefined || id === null) return null;

  switch (method) {
    case 'initialize':
      return ok(id, {
        protocolVersion: typeof msg?.params?.protocolVersion === 'string' ? msg.params.protocolVersion : DEFAULT_PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
        instructions: 'Public BAALANCE tools: hair cortisol evidence and crisis helplines. No personal data is available here.',
      });
    case 'ping':
      return ok(id, {});
    case 'tools/list':
      return ok(id, { tools: TOOLS });
    case 'tools/call': {
      const name = msg?.params?.name;
      const args = msg?.params?.arguments || {};
      if (name === 'search_hair_cortisol_evidence') {
        const query = String(args.query || '').slice(0, 200);
        if (!query.trim()) return ok(id, { content: [{ type: 'text', text: 'A query is required.' }], isError: true });
        const found = await searchEvidence(query, 3);
        const text = found.passages.length
          ? found.passages.map(p => `${p.title}\n${p.text}\nSource: ${p.source}${p.url ? ` (${p.url})` : ''}`).join('\n\n')
          : 'Nothing in the BAALANCE evidence library matches that.';
        return ok(id, { content: [{ type: 'text', text }] });
      }
      if (name === 'get_crisis_helplines') {
        const region = (['india', 'uae', 'other'] as HelpRegion[]).includes(args.region) ? (args.region as HelpRegion) : 'other';
        const text = HELPLINES[region].lines.map(l => `${l.name}: ${l.display || l.url || 'see detail'}. ${l.detail}`).join('\n');
        return ok(id, { content: [{ type: 'text', text: `${HELPLINES[region].label}\n${text}` }] });
      }
      return fail(id, -32602, `Unknown tool: ${String(name)}`);
    }
    default:
      return fail(id, -32601, `Method not found: ${method}`);
  }
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`mcp:ip:${clientIp(req)}`, 120, 60 * 60 * 1000)) {
    return NextResponse.json(fail(null, -32000, 'Rate limit reached. Try again later.'), { status: 429 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(fail(null, -32700, 'Parse error.'), { status: 400 });
  }

  if (Array.isArray(body)) {
    const replies = (await Promise.all(body.slice(0, 20).map(handle))).filter(Boolean);
    return replies.length ? NextResponse.json(replies) : new NextResponse(null, { status: 202 });
  }
  const reply = await handle(body);
  return reply ? NextResponse.json(reply) : new NextResponse(null, { status: 202 });
}

export async function GET() {
  return NextResponse.json({
    ...SERVER_INFO,
    protocol: 'Model Context Protocol, JSON-RPC 2.0 over HTTP POST',
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
  });
}
