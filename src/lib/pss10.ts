/**
 * Perceived Stress Scale, 10-item version (PSS-10).
 * Cohen S, Kamarck T, Mermelstein R. A global measure of perceived stress.
 * J Health Soc Behav 1983;24(4):385-396.
 *
 * The scale may be used without permission for non-profit academic research and
 * education. Commercial use needs the author's permission, so check the licence
 * before the paid launch.
 */

export const PSS10_STEM = 'In the last month, how often have you';

export const PSS10_ITEMS: Array<{ id: number; text: string; reversed: boolean }> = [
  { id: 1, text: 'been upset because of something that happened unexpectedly?', reversed: false },
  { id: 2, text: 'felt that you were unable to control the important things in your life?', reversed: false },
  { id: 3, text: 'felt nervous and stressed?', reversed: false },
  { id: 4, text: 'felt confident about your ability to handle your personal problems?', reversed: true },
  { id: 5, text: 'felt that things were going your way?', reversed: true },
  { id: 6, text: 'found that you could not cope with all the things that you had to do?', reversed: false },
  { id: 7, text: 'been able to control irritations in your life?', reversed: true },
  { id: 8, text: 'felt that you were on top of things?', reversed: true },
  { id: 9, text: 'been angered because of things that happened that were outside of your control?', reversed: false },
  { id: 10, text: 'felt difficulties were piling up so high that you could not overcome them?', reversed: false },
];

export const PSS10_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Almost never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Fairly often' },
  { value: 4, label: 'Very often' },
];

export type Pss10Band = 'low' | 'moderate' | 'high';

export interface Pss10Result {
  /** Raw answers (0 to 4) in item order, before reverse scoring. */
  answers: number[];
  /** Total after reverse scoring items 4, 5, 7 and 8. Range 0 to 40. */
  score: number;
  band: Pss10Band;
  completedAt: string;
}

export function isCompletePss10(answers: Array<number | null | undefined>): answers is number[] {
  return (
    answers.length === PSS10_ITEMS.length &&
    answers.every(a => typeof a === 'number' && Number.isInteger(a) && a >= 0 && a <= 4)
  );
}

/** Commonly used bands (0-13 low, 14-26 moderate, 27-40 high). They are a guide, not a diagnosis. */
export function pss10Band(score: number): Pss10Band {
  if (score <= 13) return 'low';
  if (score <= 26) return 'moderate';
  return 'high';
}

export function scorePss10(answers: number[], completedAt = new Date().toISOString()): Pss10Result {
  if (!isCompletePss10(answers)) throw new Error('PSS-10 needs ten answers between 0 and 4.');
  const score = PSS10_ITEMS.reduce((sum, item, i) => sum + (item.reversed ? 4 - answers[i] : answers[i]), 0);
  return { answers: [...answers], score, band: pss10Band(score), completedAt };
}

export const PSS10_BAND_LABEL: Record<Pss10Band, string> = {
  low: 'Low perceived stress',
  moderate: 'Moderate perceived stress',
  high: 'High perceived stress',
};

/** One line for AI prompts. */
export function describePss10(result?: Pss10Result | null): string {
  if (!result) return 'PSS-10: not completed yet';
  const date = result.completedAt.slice(0, 10);
  return `PSS-10 (validated questionnaire, 0 to 40): ${result.score} (${PSS10_BAND_LABEL[result.band]}), completed ${date}`;
}
