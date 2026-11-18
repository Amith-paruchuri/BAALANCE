import { NextRequest, NextResponse } from 'next/server';
import { clientIp, rateLimit } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

/**
 * Doctors and clinics near a location, from Azure Maps Search.
 *
 * Privacy: the location is used for this one search and is not stored or
 * logged. The browser rounds it to about 100 metres before sending it.
 * Needs AZURE_MAPS_KEY; without it the client falls back to a map search link.
 */

type Kind = 'mental_health' | 'general';

const QUERIES: Record<Kind, string> = {
  mental_health: 'psychiatrist',
  general: 'general practitioner',
};

interface Place {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  distanceKm: number | null;
  lat: number;
  lon: number;
  categories: string[];
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`doctors:ip:${clientIp(req)}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ available: true, places: [], error: 'Too many searches. Please try again later.' }, { status: 429 });
  }

  const key = (process.env.AZURE_MAPS_KEY || '').trim();
  if (!key) return NextResponse.json({ available: false, places: [] });

  try {
    const body = await req.json();
    const lat = Number(body?.lat);
    const lon = Number(body?.lon);
    const kind: Kind = body?.kind === 'general' ? 'general' : 'mental_health';
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return NextResponse.json({ available: true, places: [], error: 'That location is not valid.' }, { status: 400 });
    }

    const params = new URLSearchParams({
      'api-version': '1.0',
      query: QUERIES[kind],
      lat: lat.toFixed(3),
      lon: lon.toFixed(3),
      radius: '20000',
      limit: '10',
      language: 'en-GB',
      'subscription-key': key,
    });
    const res = await fetch(`https://atlas.microsoft.com/search/poi/json?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) {
      console.warn('[BAALANCE Doctors] Azure Maps error:', res.status);
      return NextResponse.json({ available: false, places: [] });
    }

    const data = await res.json();
    const places: Place[] = (Array.isArray(data?.results) ? data.results : [])
      .map((r: any): Place | null => {
        const name = r?.poi?.name;
        const pos = r?.position;
        if (!name || typeof pos?.lat !== 'number' || typeof pos?.lon !== 'number') return null;
        return {
          id: String(r.id || `${pos.lat},${pos.lon}`),
          name: String(name).slice(0, 120),
          address: String(r?.address?.freeformAddress || '').slice(0, 200),
          phone: r?.poi?.phone ? String(r.poi.phone).slice(0, 40) : null,
          distanceKm: typeof r?.dist === 'number' ? Math.round(r.dist / 100) / 10 : null,
          lat: pos.lat,
          lon: pos.lon,
          categories: Array.isArray(r?.poi?.categories) ? r.poi.categories.slice(0, 3).map((c: unknown) => String(c)) : [],
        };
      })
      .filter((p: Place | null): p is Place => p !== null)
      .sort((a: Place, b: Place) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
      .slice(0, 8);

    return NextResponse.json({ available: true, places });
  } catch {
    return NextResponse.json({ available: false, places: [] });
  }
}
