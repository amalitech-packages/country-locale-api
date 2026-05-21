/**
 * @amali-tech/country-locale-api
 *
 * Entry point for the package. Keep named exports only.
 */

export { countries } from './data/countries.js';

export type { Country, Currency, NumberFormat } from './types/country.js';
export type { LocaleOption } from './types/option.js';

export { countryOptions, currencyOptions } from './options.js';

export { getCountryInfo } from './utils/getCountryInfo.js';
export { formatCurrency } from './utils/formatCurrency.js';
export { formatNumber } from './utils/formatNumber.js';
export { formatDate } from './utils/formatDate.js';
