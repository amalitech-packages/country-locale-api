# @elliot_collab/country-locale-api

Country, currency, number, and date helpers for ERP applications.

This package gives product teams a small typed API for common locale workflows:

- Country dropdown options: `[{ key: "US", label: "United States" }]`
- Currency dropdown options: `[{ key: "$", label: "USD" }]`
- Country lookup by name, ISO code, or supported alias
- Currency, number, and date formatting by BCP 47 locale

## Installation

```bash
pnpm add @elliot_collab/country-locale-api
```

```bash
npm install @elliot_collab/country-locale-api
```

Node.js 22 or newer is required.

## Usage

```ts
import {
  countryOptions,
  currencyOptions,
  formatCurrency,
  formatDate,
  formatNumber,
  getCountryInfo,
} from '@elliot_collab/country-locale-api';

countryOptions;
// [{ key: "GH", label: "Ghana" }, { key: "US", label: "United States" }, ...]

currencyOptions;
// [{ key: "$", label: "USD" }, ...]

getCountryInfo('USA');
// Full country metadata for the United States

formatCurrency(1234.56, 'en-US');
// "$1,234.56"

formatNumber(1234567.89, 'de-DE');
// "1.234.567,89"

formatDate(new Date(2025, 2, 15), 'en-GB');
// "15/03/2025"
```

## API

### `countries`

Readonly country metadata suitable for ERP configuration screens, address forms,
and locale-aware defaults. Each country includes ISO code, display name, locale,
phone code, currency, date/time patterns, number separators, and timezone data
where available.

### `countryOptions`

Pre-built select options derived from `countries`.

```ts
type LocaleOption = {
  key: string;
  label: string;
};
```

`key` is the ISO 3166-1 alpha-2 country code. `label` is the country name.

### `currencyOptions`

Pre-built select options derived from unique currencies in `countries`.

`key` is the currency symbol. `label` is the ISO 4217 currency code.

### `getCountryInfo(countryName)`

Looks up country metadata by:

- Country name, such as `"Ghana"`
- ISO country code, such as `"GH"`
- Supported alias, such as `"USA"`

The lookup is case-insensitive and trims whitespace. Unknown values return
`undefined`.

### `formatCurrency(amount, locale)`

Formats a finite number with `Intl.NumberFormat` and infers the currency from
the locale's country/region where available. Unsupported countries fall back to
USD.

### `formatNumber(value, locale)`

Formats a finite number with `Intl.NumberFormat`.

### `formatDate(date, locale)`

Formats a `Date`, ISO-8601 string, or millisecond timestamp using the date
pattern configured for the locale's country. Unknown countries fall back to
`dd/MM/yyyy`.

## Development

```bash
corepack enable
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

## Releasing

Releases are automated with Changesets and GitHub Actions. Add a changeset for
public API or runtime behavior changes:

```bash
pnpm changeset
```

Merges to `main` create a version PR. When that PR is merged, the release
workflow publishes to npm with provenance.

## License

[Apache-2.0](./LICENSE). Copyright AmaliTech.
