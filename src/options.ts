import { countries } from './data/countries.js';
import type { LocaleOption, NumberFormatOption } from './types/option.js';

/**
 * Pre-built country options for dropdown/select inputs.
 *
 * Each entry has `{ key: "<ISO country code>", label: "<Country name>" }`.
 */
export const countryOptions: ReadonlyArray<LocaleOption> = countries.map((country) => ({
  key: country.name,
  label: country.name,
}));

/**
 * Pre-built currency options for dropdown/select inputs.
 *
 * Each entry has `{ key: "<symbol>", label: "<currency code>" }`.
 * Currencies shared by multiple countries are included once.
 */
export const currencyOptions: ReadonlyArray<LocaleOption> = Array.from(
  new Map(
    countries.map((country) => [
      country.currency.code,
      { key: country.currency.symbol, label: country.currency.code, countryName: country.name },
    ]),
  ).values(),
);

export const numberFormatOptions: ReadonlyArray<NumberFormatOption> = Array.from(
  new Map(
    countries.map((country) => [
      `${country.numberFormat.decimalSeparator}|${country.numberFormat.thousandSeparator}`,
      {
        key: country.locale,
        countryName: country.name,
        label: `${country.name} Format (${country.numberFormat.example})`,
      },
    ]),
  ).values(),
);
