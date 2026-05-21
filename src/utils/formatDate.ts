import { findCountryByLocale, normalizeLocale } from './locale.js';

/**
 * Formats a date according to the date format pattern of the country matching
 * the given locale.
 *
 * Supported tokens: `yyyy`, `MM`, `dd`.
 *
 * @param date A Date object, ISO-8601 string, or Unix timestamp in milliseconds.
 * @param locale The BCP 47 language tag (e.g. "en-US", "de-DE").
 * @returns The formatted date string.
 */
export function formatDate(date: Date | string | number, locale: string): string {
  const normalizedLocale = normalizeLocale(locale);
  const parsed = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    throw new TypeError('Date must be a valid Date, ISO string, or timestamp');
  }

  const pattern = findCountryByLocale(normalizedLocale)?.dateFormat ?? 'dd/MM/yyyy';
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = String(parsed.getFullYear());

  return pattern.replace('yyyy', year).replace('MM', month).replace('dd', day);
}
