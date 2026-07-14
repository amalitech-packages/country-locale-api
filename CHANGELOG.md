# @amali-tech/country-locale-api

## 1.1.0

### Minor Changes

- add `dateFormatOptions` — one entry per country keyed by locale, labelled with the country name and date-format pattern (e.g. "Ghana Format (dd/MM/yyyy)")

### Patch Changes

- update currency options to use the code as the key

## 1.0.1

### Patch Changes

- `numberFormatOptions` now emits one entry per country instead of deduplicating by separator signature. Each country gets its own option with a locale key and a localised example, so the list reflects the full set of countries rather than the ~5 underlying formatting conventions.

## 1.0.0

### Major Changes

- 47e95bc: full country listing support provided

### Patch Changes

- 47e95bc: full list of countries provided

## 0.1.2

### Patch Changes

- 62eef99: patch

## 0.1.1

### Patch Changes

- 7124356: provided options for number formatiing

## 0.1.0

### Minor Changes

- d9020dd: Add the production country locale API with typed country/currency options, country lookup, and locale-aware currency, number, and date formatting helpers.
