import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getAIStatus } from '@/lib/ai';

/** Reports whether a server-side AI model is configured. Keys are set only through environment variables. */
export async function GET() {
  return NextResponse.json(getAIStatus());
}
