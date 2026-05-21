import { assertFiniteNumber, normalizeLocale } from './locale.js';

/**
 * Formats a numeric value based on the provided locale.
 *
 * @param value The numeric value to format.
 * @param locale The BCP 47 language tag (e.g. "en-US", "de-DE").
 * @returns The formatted number string.
 */
export function formatNumber(value: number, locale: string): string {
  assertFiniteNumber(value, 'Value');

  return new Intl.NumberFormat(normalizeLocale(locale)).format(value);
}
