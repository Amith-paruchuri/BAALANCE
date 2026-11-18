'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, LifeBuoy, MapPin, Navigation, Phone, Stethoscope, X } from 'lucide-react';
import { HELPLINES, guessRegion, type HelpRegion } from '@/lib/helplines';

type Tab = 'helplines' | 'doctor';
type Kind = 'mental_health' | 'general';

interface Place {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  distanceKm: number | null;
  lat: number;
  lon: number;
}

interface GetHelpPanelProps {
  isOpen: boolean;
  initialTab?: Tab;
  onClose: () => void;
}

const KIND_LABEL: Record<Kind, { title: string; search: string }> = {
  mental_health: { title: 'Mental health professional', search: 'psychiatrist' },
  general: { title: 'General doctor', search: 'general physician' },
};

const mapSearchUrl = (query: string, where?: { lat: number; lon: number }) =>
  where
    ? `https://www.bing.com/maps?q=${encodeURIComponent(query)}&cp=${where.lat.toFixed(2)}~${where.lon.toFixed(2)}&lvl=13`
    : `https://www.bing.com/maps?q=${encodeURIComponent(`${query} near me`)}`;
const directionsUrl = (place: Place) => `https://www.bing.com/maps?rtp=~pos.${place.lat}_${place.lon}_${encodeURIComponent(place.name)}`;

/**
 * Help, reachable from anywhere in the app:
 *   1. helplines for the person's country, one tap to call;
 *   2. doctors near them, found only after they agree to share their location.
 * BAALANCE does not run a helpline and does not book appointments: it puts the
 * right number in front of the person.
 */
export const GetHelpPanel: React.FC<GetHelpPanelProps> = ({ isOpen, initialTab = 'helplines', onClose }) => {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [region, setRegion] = useState<HelpRegion>('india');
  const [kind, setKind] = useState<Kind>('mental_health');
  const [where, setWhere] = useState<{ lat: number; lon: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'locating' | 'searching' | 'done' | 'denied' | 'unavailable' | 'error'>('idle');
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setRegion(guessRegion());
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const search = async (position: { lat: number; lon: number }, searchKind: Kind) => {
    setStatus('searching');
    try {
      const res = await fetch('/api/doctors/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: position.lat, lon: position.lon, kind: searchKind }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data?.available) {
        setPlaces([]);
        setStatus('unavailable');
        return;
      }
      setPlaces(Array.isArray(data.places) ? data.places : []);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const useMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('denied');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        // Round to about 100 metres: close enough to find a clinic, no more precise than needed.
        const position = { lat: Math.round(pos.coords.latitude * 1000) / 1000, lon: Math.round(pos.coords.longitude * 1000) / 1000 };
        setWhere(position);
        search(position, kind);
      },
      () => setStatus('denied'),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const changeKind = (next: Kind) => {
    setKind(next);
    if (where) search(where, next);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const lines = HELPLINES[region].lines;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans"
      role="dialog"
      aria-modal="true"
      aria-label="Get help"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
        data-testid="help-panel"
      >
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Get help</h2>
              <p className="text-xs text-slate-600">Talk to someone now, or find a doctor near you.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 sm:px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl" role="tablist">
            {[
              { id: 'helplines' as Tab, label: 'Talk to someone', icon: Phone },
              { id: 'doctor' as Tab, label: 'Find a doctor', icon: Stethoscope },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  tab === item.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {tab === 'helplines' ? (
            <>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Where you are">
                <span className="text-xs font-semibold text-slate-500">I am in</span>
                {(Object.keys(HELPLINES) as HelpRegion[]).map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRegion(key)}
                    aria-pressed={region === key}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                      region === key ? 'bg-[#0D4F59] border-[#0D4F59] text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {HELPLINES[key].label}
                  </button>
                ))}
              </div>

              <ul className="space-y-2.5">
                {lines.map(line => (
                  <li
                    key={line.name}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                      line.emergency ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-slate-900">{line.name}</div>
                      <div className="text-xs text-slate-600">{line.detail}</div>
                    </div>
                    {line.phone ? (
                      <a
                        href={`tel:${line.phone}`}
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white transition-colors ${
                          line.emergency ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#0D4F59] hover:bg-[#0B434B]'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="whitespace-nowrap">Call {line.display}</span>
                      </a>
                    ) : line.url ? (
                      <a
                        href={line.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0D4F59] hover:bg-[#0B434B] transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>

              <p className="text-[11px] text-slate-500">
                BAALANCE does not run these services and is not an emergency service. Calls go straight to the service from your phone.
              </p>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Kind of doctor">
                {(Object.keys(KIND_LABEL) as Kind[]).map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => changeKind(key)}
                    aria-pressed={kind === key}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-colors cursor-pointer ${
                      kind === key ? 'bg-[#0D4F59]/5 border-[#0D4F59] text-slate-900 ring-1 ring-[#0D4F59]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {KIND_LABEL[key].title}
                  </button>
                ))}
              </div>

              {status === 'idle' && (
                <div className="p-4 rounded-2xl border border-[#EFE6DA] bg-[#FBF7F2] space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#BF6F4E] shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700">
                      To list doctors near you, we need your location for this one search. It is rounded to about 100 metres, it is
                      not saved, and it is not added to your profile.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={useMyLocation}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0D4F59] hover:bg-[#0B434B] text-white text-xs font-bold cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Use my location
                    </button>
                    <a
                      href={mapSearchUrl(KIND_LABEL[kind].search)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
                    >
                      Search on a map instead
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {(status === 'locating' || status === 'searching') && (
                <p className="text-xs font-semibold text-slate-600 p-4 rounded-2xl bg-slate-50 border border-slate-200" role="status">
                  {status === 'locating' ? 'Finding where you are…' : 'Looking for doctors near you…'}
                </p>
              )}

              {status === 'denied' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <p className="text-xs text-slate-700">
                    We could not get your location. You can allow it in your browser and try again, or search on a map.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={useMyLocation} className="px-3.5 py-2 rounded-xl bg-[#0D4F59] text-white text-xs font-bold cursor-pointer">
                      Try again
                    </button>
                    <a href={mapSearchUrl(KIND_LABEL[kind].search)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold">
                      Search on a map <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {(status === 'unavailable' || status === 'error' || (status === 'done' && places.length === 0)) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <p className="text-xs text-slate-700">
                    {status === 'done'
                      ? 'We did not find any listed within 20 km. A map search may show more.'
                      : 'We cannot list doctors inside the app right now. Open a map of doctors near you instead.'}
                  </p>
                  <a
                    href={mapSearchUrl(KIND_LABEL[kind].search, where || undefined)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0D4F59] hover:bg-[#0B434B] text-white text-xs font-bold"
                  >
                    Open the map
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {status === 'done' && places.length > 0 && (
                <ul className="space-y-2.5">
                  {places.map(place => (
                    <li key={place.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-slate-900">{place.name}</div>
                          <div className="text-xs text-slate-600">{place.address}</div>
                        </div>
                        {place.distanceKm !== null && (
                          <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{place.distanceKm} km</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {place.phone && (
                          <a href={`tel:${place.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D4F59] hover:bg-[#0B434B] text-white text-xs font-bold">
                            <Phone className="w-3.5 h-3.5" />
                            Call to book
                          </a>
                        )}
                        <a href={directionsUrl(place)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold">
                          <Navigation className="w-3.5 h-3.5" />
                          Directions
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-[11px] text-slate-500">
                BAALANCE does not book appointments or recommend a particular doctor. Listings come from a public map; call the clinic
                to check it is open and to book.
              </p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
