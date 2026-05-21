import type { Country } from '../types/country.js';
import { countries } from '../data/countries.js';

/**
 * Retrieves full country information by name or ISO country code.
 *
 * The lookup is case-insensitive and trims whitespace. It matches against:
 * - The country `name` (e.g. "Ghana", "united states")
 * - The 2-letter ISO `code` (e.g. "GH", "us")
 * - Known country aliases (e.g. "USA")
 *
 * @param countryName - The country name or ISO code to search for.
 * @returns The matching {@link Country} object, or `undefined` if not found.
 */
export function getCountryInfo(countryName: string): Country | undefined {
  if (typeof countryName !== 'string' || !countryName.trim()) {
    return undefined;
  }

  const search = countryName.trim().toLowerCase();

  return countries.find(
    (c) =>
      c.name.toLowerCase() === search ||
      c.code.toLowerCase() === search ||
      c.aliases?.some((alias) => alias.toLowerCase() === search),
  );
}
