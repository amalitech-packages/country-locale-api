import { assertFiniteNumber, findCountryByLocale, normalizeLocale } from './locale.js';

/**
 * Formats a numeric amount as currency based on the provided locale.
 *
 * @param amount The numeric amount to format.
 * @param locale The BCP 47 language tag (e.g. "en-US", "de-DE").
 * @returns The formatted currency string.
 */
export function formatCurrency(amount: number, locale: string): string {
  assertFiniteNumber(amount, 'Amount');

  const normalizedLocale = normalizeLocale(locale);
  const currencyCode = findCountryByLocale(normalizedLocale)?.currency.code ?? 'USD';

  return new Intl.NumberFormat(normalizedLocale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}
