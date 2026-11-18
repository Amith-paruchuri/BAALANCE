/**
 * Crisis and support lines, by region. Numbers were checked in November 2026;
 * re-check them before each release, because helplines change.
 *
 * India: KIRAN (1800-599-0019) was merged into Tele-MANAS in 2024, so it is not listed.
 */

export type HelpRegion = 'india' | 'uae' | 'other';

export interface Helpline {
  name: string;
  detail: string;
  /** Digits to dial. Missing for entries that are a website. */
  phone?: string;
  /** How the number is written for people. */
  display?: string;
  url?: string;
  emergency?: boolean;
}

export const HELPLINES: Record<HelpRegion, { label: string; lines: Helpline[] }> = {
  india: {
    label: 'India',
    lines: [
      { name: 'Emergency', detail: 'Police, ambulance or fire, anywhere in India.', phone: '112', display: '112', emergency: true },
      {
        name: 'Tele-MANAS',
        detail: 'Free government mental health line. 24 hours, every day, in about 20 languages.',
        phone: '14416',
        display: '14416',
      },
      { name: 'Tele-MANAS (toll-free)', detail: 'The same service on a toll-free number.', phone: '18008914416', display: '1800-891-4416' },
    ],
  },
  uae: {
    label: 'United Arab Emirates',
    lines: [
      { name: 'Police', detail: 'For immediate danger.', phone: '999', display: '999', emergency: true },
      { name: 'Ambulance', detail: 'For a medical emergency.', phone: '998', display: '998', emergency: true },
      { name: 'National mental support line', detail: 'Free support line, in Arabic and English.', phone: '8004673', display: '800 4673 (800-HOPE)' },
      { name: 'Estijaba, Abu Dhabi', detail: 'Abu Dhabi Department of Health line, in Arabic and English.', phone: '8001717', display: '800 1717' },
    ],
  },
  other: {
    label: 'Another country',
    lines: [
      { name: 'Emergency', detail: 'Call your local emergency number, or go to the nearest emergency department.', emergency: true },
      {
        name: 'Find a helpline',
        detail: 'A directory of free, verified helplines in over 130 countries.',
        url: 'https://findahelpline.com',
      },
    ],
  },
};

/** A first guess from the device's time zone. The person can always change it. */
export function guessRegion(): HelpRegion {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (zone === 'Asia/Kolkata' || zone === 'Asia/Calcutta') return 'india';
    if (zone === 'Asia/Dubai') return 'uae';
  } catch {}
  return 'other';
}

/** Opens the Get help panel from anywhere in the app. */
export function openHelpPanel(tab: 'helplines' | 'doctor' = 'helplines') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('baalance-open-help', { detail: { tab } }));
  }
}
