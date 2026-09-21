import { NextRequest, NextResponse } from 'next/server';
import { synthesizeBiomarkerData } from '@/lib/gemini';
import { UserProfile, HairCortisolSegment, WeeklyTelemetry } from '@/lib/types';
import { INITIAL_USER_PROFILE, CLINICAL_SURGE_SEGMENTS, WEEKLY_12_WEEK_TELEMETRY } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const profile: UserProfile = body.profile || INITIAL_USER_PROFILE;
    const segments: HairCortisolSegment[] = body.segments || CLINICAL_SURGE_SEGMENTS;
    const telemetry: WeeklyTelemetry[] = body.telemetry || WEEKLY_12_WEEK_TELEMETRY;
    const apiKey = body.apiKey || req.headers.get('x-gemini-api-key') || undefined;

    const result = await synthesizeBiomarkerData(profile, segments, telemetry, apiKey);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[API /api/gemini-synthesis] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to synthesize biomedical biomarkers',
      },
      { status: 500 }
    );
  }
}
