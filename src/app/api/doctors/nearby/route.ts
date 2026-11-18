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

type Kind = 'hospital' | 'mental_health' | 'general';

/** Several searches per kind, merged, so one thin result does not hide nearer places. */
const QUERIES: Record<Kind, { path: string; query: string }[]> = {
  hospital: [
    { path: 'search/poi/category/json', query: 'hospital' },
    { path: 'search/poi/json', query: 'hospital' },
  ],
  mental_health: [
    { path: 'search/poi/json', query: 'psychiatrist' },
    { path: 'search/poi/json', query: 'psychologist' },
    { path: 'search/poi/json', query: 'mental health clinic' },
  ],
  general: [
    { path: 'search/poi/json', query: 'general practitioner' },
    { path: 'search/poi/json', query: 'doctor' },
    { path: 'search/poi/json', query: 'clinic' },
  ],
};

/**
 * Azure Maps files labs, eye banks and even training academies under
 * "hospital/polyclinic", so the hospital list drops them by name.
 */
const NOT_A_HOSPITAL = /\b(lab|labs|laborator(y|ies)|diagnostic|diagnostics|pathology|imaging|scan|x-?ray|eye bank|blood bank|academy|school|college of|institute of hotel|hospitality|pharmacy|chemist|medical store|optical|opticians?|dental|dentist|physiotherapy|homeopathy|ayurved\w*|pain management|spa|salon|insurance|agency|consultants?)\b/i;

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
    const kind: Kind = body?.kind === 'general' ? 'general' : body?.kind === 'hospital' ? 'hospital' : 'mental_health';
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return NextResponse.json({ available: true, places: [], error: 'That location is not valid.' }, { status: 400 });
    }

    const responses = await Promise.all(
      QUERIES[kind].map(async ({ path, query }) => {
        const params = new URLSearchParams({
          'api-version': '1.0',
          query,
          lat: lat.toFixed(3),
          lon: lon.toFixed(3),
          radius: '25000',
          limit: '10',
          language: 'en-GB',
          'subscription-key': key,
        });
        try {
          const res = await fetch(`https://atlas.microsoft.com/${path}?${params.toString()}`, { cache: 'no-store' });
          if (!res.ok) {
            console.warn('[BAALANCE Doctors] Azure Maps error:', res.status);
            return null;
          }
          const data = await res.json();
          return Array.isArray(data?.results) ? (data.results as any[]) : [];
        } catch {
          return null;
        }
      }),
    );
    if (responses.every(r => r === null)) return NextResponse.json({ available: false, places: [] });

    const seen = new Set<string>();
    const merged = responses.flatMap(r => r || []).filter(r => {
      const id = String(r?.id || `${r?.poi?.name}|${r?.position?.lat},${r?.position?.lon}`);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    const places: Place[] = merged
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
      .filter((p: Place) => kind !== 'hospital' || !NOT_A_HOSPITAL.test(p.name))
      .sort((a: Place, b: Place) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
      .slice(0, 8);

    return NextResponse.json({ available: true, places });
  } catch {
    return NextResponse.json({ available: false, places: [] });
  }
}
