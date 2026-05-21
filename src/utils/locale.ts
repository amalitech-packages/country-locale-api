import { countries } from '../data/countries.js';
import type { Country } from '../types/country.js';

export function assertFiniteNumber(value: number, name: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

export function normalizeLocale(locale: string): string {
  if (typeof locale !== 'string' || !locale.trim()) {
    throw new TypeError('Locale must be a non-empty string');
  }

  const [canonicalLocale] = Intl.getCanonicalLocales(locale.trim());

  if (!canonicalLocale) {
    throw new TypeError('Locale must be a valid BCP 47 language tag');
  }

  return canonicalLocale;
}

export function findCountryByLocale(locale: string): Country | undefined {
  const normalizedLocale = normalizeLocale(locale);
  const lowerLocale = normalizedLocale.toLowerCase();

  const exactMatch = countries.find((country) => country.locale.toLowerCase() === lowerLocale);

  if (exactMatch) {
    return exactMatch;
  }

  const region = normalizedLocale.split('-').find((part) => /^[A-Z]{2}$/.test(part));

  if (region) {
    return countries.find((country) => country.code === region);
  }

  const language = normalizedLocale.split('-')[0]?.toLowerCase();

  return countries.find((country) => country.locale.split('-')[0]?.toLowerCase() === language);
}
