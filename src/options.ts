import { countries } from './data/countries.js';
import type { Country } from './types/country.js';
import type { DateFormatOption, LocaleOption, NumberFormatOption } from './types/option.js';

/**
 * Pre-built country options for dropdown/select inputs.
 *
 * Each entry has `{ key: "<Country name>", label: "<Country name>" }`.
 */
export const countryOptions: ReadonlyArray<LocaleOption> = countries.map((country) => ({
  key: country.name,
  label: country.name,
}));

// Canonical ISO 3166-1 alpha-2 issuer for each shared currency. Used to pick a
// representative country when multiple countries share the same currency code,
// instead of relying on iteration order.
const PRIMARY_FOR_CURRENCY: Readonly<Record<string, string>> = {
  USD: 'US',
  EUR: 'DE',
  GBP: 'GB',
  XOF: 'SN', // West African CFA franc — UEMOA seat
  XAF: 'CM', // Central African CFA franc — BEAC seat
  XCD: 'AG', // Eastern Caribbean dollar — ECCB seat (Saint Kitts hosts; AG used as primary issuer in ISO listings)
  CHF: 'CH',
  AUD: 'AU',
  NZD: 'NZ',
  DKK: 'DK',
  NOK: 'NO',
  ILS: 'IL',
  MAD: 'MA',
  INR: 'IN',
  RUB: 'RU',
  TRY: 'TR',
  ZAR: 'ZA',
};

function pickPrimary(group: readonly Country[], primaryCode: string | undefined): Country {
  if (primaryCode) {
    const primary = group.find((c) => c.code === primaryCode);
    if (primary) return primary;
  }
  const first = group[0];
  if (!first) throw new Error('pickPrimary called with empty group');
  return first;
}

/**
 * Pre-built currency options for dropdown/select inputs.
 *
 * Each entry has `{ key: "<symbol>", label: "<currency code>", countryName }`.
 * Currencies shared by multiple countries are emitted once with the canonical
 * issuer as the `countryName` (see `PRIMARY_FOR_CURRENCY`).
 */
function buildCurrencyOptions(): LocaleOption[] {
  const groups = new Map<string, Country[]>();
  for (const country of countries) {
    const code = country.currency.code;
    if (!groups.has(code)) groups.set(code, []);
    groups.get(code)!.push(country);
  }
  const out: LocaleOption[] = [];
  for (const [code, group] of groups) {
    const rep = pickPrimary(group, PRIMARY_FOR_CURRENCY[code]);
    out.push({
      key: rep.currency.code,
      label: `${rep.currency.code} (${rep.currency.symbol})`,
      countryName: rep.name,
    });
  }
  return out;
}

export const currencyOptions: ReadonlyArray<LocaleOption> = buildCurrencyOptions();

/**
 * Pre-built number-format options for dropdown/select inputs.
 *
 * One entry per country, keyed by the country's BCP 47 locale. The label
 * includes the country name and a localised example of its number format
 * (e.g. "Germany Format (1.234.567,89)").
 */
export const numberFormatOptions: ReadonlyArray<NumberFormatOption> = countries.map((country) => ({
  key: country.locale,
  countryName: country.name,
  label: `${country.name} Format (${country.numberFormat.example})`,
}));

/**
 * Pre-built date-format options for dropdown/select inputs.
 *
 * One entry per country, keyed by the country's BCP 47 locale. The label
 * includes the country name and its date-format pattern
 * (e.g. "Ghana Format (dd/MM/yyyy)").
 */
export const dateFormatOptions: ReadonlyArray<DateFormatOption> = countries.map((country) => ({
  key: country.locale,
  countryName: country.name,
  label: `${country.name} Format (${country.dateFormat})`,
}));
