import { CalendarEventItem } from '@/components/CalendarSnippetWidget';

export interface IndianHolidayItem {
  name: string;
  dateKey: string; // 'YYYY-MM-DD'
  description?: string;
  isGazetted?: boolean;
  emoji?: string;
}

export const INDIAN_HOLIDAYS_DATA: IndianHolidayItem[] = [
  // 2026 Major Holidays & Festivals in India
  { name: 'Makar Sankranti / Pongal', dateKey: '2026-01-14', emoji: '🪁', isGazetted: false },
  { name: 'Republic Day', dateKey: '2026-01-26', emoji: '🇮🇳', isGazetted: true },
  { name: 'Maha Shivratri', dateKey: '2026-02-15', emoji: '🔱', isGazetted: true },
  { name: 'Holi', dateKey: '2026-03-03', emoji: '🎨', isGazetted: true },
  { name: 'Ugadi / Gudi Padwa', dateKey: '2026-03-20', emoji: '🥭', isGazetted: false },
  { name: 'Eid-ul-Fitr (Ramadan)', dateKey: '2026-03-20', emoji: '🌙', isGazetted: true },
  { name: 'Rama Navami', dateKey: '2026-03-28', emoji: '🏹', isGazetted: true },
  { name: 'Mahavir Jayanti', dateKey: '2026-03-31', emoji: '🕊️', isGazetted: true },
  { name: 'Good Friday', dateKey: '2026-04-03', emoji: '✝️', isGazetted: true },
  { name: 'Buddha Purnima', dateKey: '2026-05-01', emoji: '☸️', isGazetted: true },
  { name: 'Bakrid / Eid al-Adha', dateKey: '2026-06-17', emoji: '🌙', isGazetted: true },
  { name: 'International Yoga Day', dateKey: '2026-06-21', emoji: '🧘', isGazetted: false },
  { name: 'Muharram', dateKey: '2026-07-17', emoji: '🌙', isGazetted: true },
  { name: 'Guru Purnima', dateKey: '2026-07-24', emoji: '🪷', isGazetted: false },
  { name: 'Independence Day', dateKey: '2026-08-15', emoji: '🇮🇳', isGazetted: true },
  { name: 'Onam / Thiruvonam', dateKey: '2026-08-27', emoji: '🌾', isGazetted: false },
  { name: 'Raksha Bandhan', dateKey: '2026-08-28', emoji: '🧵', isGazetted: false },
  { name: 'Janmashtami (Krishna Jayanti)', dateKey: '2026-09-04', emoji: '🦚', isGazetted: true },
  { name: 'Ganesh Chaturthi', dateKey: '2026-09-14', emoji: '🐘', isGazetted: true },
  { name: 'Id-e-Milad (Milad-un-Nabi)', dateKey: '2026-09-15', emoji: '🌙', isGazetted: true },
  { name: 'Mahatma Gandhi Jayanti', dateKey: '2026-10-02', emoji: '🇮🇳', isGazetted: true },
  { name: 'Maha Saptami / Durga Puja', dateKey: '2026-10-11', emoji: '🌸', isGazetted: false },
  { name: 'Maha Ashtami', dateKey: '2026-10-12', emoji: '🌸', isGazetted: false },
  { name: 'Maha Navami', dateKey: '2026-10-13', emoji: '🌸', isGazetted: false },
  { name: 'Dussehra / Vijayadashami', dateKey: '2026-10-20', emoji: '🏹', isGazetted: true },
  { name: 'Karwa Chauth', dateKey: '2026-10-29', emoji: '🌕', isGazetted: false },
  { name: 'Diwali / Deepavali', dateKey: '2026-11-08', emoji: '🪔', isGazetted: true },
  { name: 'Govardhan Puja', dateKey: '2026-11-09', emoji: '🪔', isGazetted: false },
  { name: 'Bhai Dooj', dateKey: '2026-11-10', emoji: '🪔', isGazetted: false },
  { name: 'Guru Nanak Jayanti', dateKey: '2026-11-24', emoji: 'ੴ', isGazetted: true },
  { name: 'Christmas Day', dateKey: '2026-12-25', emoji: '🎄', isGazetted: true },
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns Indian national holidays and cultural festivals formatted as CalendarEventItems.
 */
export function getIndianHolidaysAsEvents(): CalendarEventItem[] {
  return INDIAN_HOLIDAYS_DATA.map((h, idx) => {
    const [year, month, day] = h.dateKey.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0);
    const dayName = dayNames[dateObj.getDay()];
    const dayDate = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
    const calMonth = dateObj.getMonth();
    const monthKey: 1 | 2 | 3 = calMonth <= 6 ? 1 : calMonth === 7 ? 2 : 3;

    return {
      id: `in-holiday-${h.dateKey}-${idx}`,
      day: dayName,
      dayDate,
      dateKey: h.dateKey,
      monthKey,
      title: `${h.name} ${h.emoji || '🇮🇳'}`,
      startTime: 'All Day',
      endTime: 'All Day',
      startHour: 0,
      durationHours: 0,
      isCurfewBreach: false,
      hasMeet: false,
      attendeesCount: 0,
      category: 'festival' as const,
      colorBg: 'bg-amber-600 text-white border-amber-700 shadow-xs',
      isAllDay: true,
    };
  });
}
