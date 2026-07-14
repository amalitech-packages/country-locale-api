// Generates src/data/countries.ts from credible sources:
//   - REST Countries v3.1 (name, ISO 3166-1, phone code, currency, flag)
//   - IANA tz database zone.tab (per-country IANA timezones)
//   - Node ICU / Intl (CLDR-derived locale, number format, date format per region)
//
// Run: node scripts/generate-countries.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');

const rest = JSON.parse(readFileSync(join(__dirname, '.rest-countries.json'), 'utf8'));
// We use zone.tab (per-country) rather than zone1970.tab. Both files describe
// the same canonical timezones, but zone.tab keeps the country-named aliases
// like Africa/Accra and Europe/Berlin instead of collapsing them into the
// principal location (Africa/Abidjan, Europe/Zurich) when multiple countries
// share a zone. For a country-locale API the per-country names are the more
// useful representation; they are still official IANA links and resolve
// identically in any tz-aware runtime.
const zoneTab = readFileSync(join(__dirname, '.zone.tab'), 'utf8');

// --- Parse zone.tab into Map<cca2, IANA tz names[]> --------------------------
// Each row is a single country code → one timezone. Countries with multiple
// zones appear on multiple rows; the most-populous zone is listed first by
// IANA convention, which we preserve.

const tzByCountry = new Map();
for (const line of zoneTab.split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const cols = line.split('\t');
  if (cols.length < 3) continue;
  const code = cols[0];
  const tz = cols[2];
  if (!tzByCountry.has(code)) tzByCountry.set(code, []);
  tzByCountry.get(code).push(tz);
}

// --- Compute UTC offset for an IANA zone using Intl (no DST: Jan 15) ----------
// Returns string like "+05:30" or "-08:00".

function utcOffsetOf(tz) {
  const ref = new Date(Date.UTC(2025, 0, 15, 12, 0, 0));
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'longOffset',
    hour: 'numeric',
  });
  const parts = dtf.formatToParts(ref);
  const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  // tzPart looks like "GMT+05:30" or "GMT-8" or "GMT"
  const m = tzPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return '+00:00';
  const sign = m[1];
  const h = m[2].padStart(2, '0');
  const mm = m[3] ?? '00';
  return `${sign}${h}:${mm}`;
}

// --- Resolve canonical locale for a country code via CLDR likelySubtags -------

function localeForCountry(cca2) {
  try {
    const loc = new Intl.Locale(`und-${cca2}`).maximize();
    return `${loc.language}-${loc.region}`;
  } catch {
    return `en-${cca2}`;
  }
}

// --- Derive number format separators + example from locale via Intl -----------

function numberFormatFor(locale) {
  const nf = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const parts = nf.formatToParts(1234567.89);
  const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.';
  const group = parts.find((p) => p.type === 'group')?.value ?? ',';
  // Normalize NBSP / NNBSP / FIGURE SPACE to regular space for portability.
  const normGroup = /[\u00A0\u202F\u2009\s]/.test(group) ? ' ' : group;
  const example = nf.format(1234567.89).replace(/[\u00A0\u202F\u2009]/g, ' ');
  return { decimalSeparator: decimal, thousandSeparator: normGroup, example };
}

// --- Derive date format pattern from locale via Intl --------------------------
// Maps Intl date parts to dd/MM/yyyy-style placeholders.

function dateFormatFor(locale) {
  const ref = new Date(Date.UTC(2025, 2, 4)); // March 4, 2025 — distinct d/m/y
  const dtf = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  });
  const parts = dtf.formatToParts(ref);
  let out = '';
  for (const p of parts) {
    switch (p.type) {
      case 'year':
        out += 'yyyy';
        break;
      case 'month':
        out += 'MM';
        break;
      case 'day':
        out += 'dd';
        break;
      case 'literal':
        // Strip RTL/bidi marks, normalize NBSP and "de" connectors.
        out += p.value.replace(/[\u200E\u200F\u061C]/g, '').replace(/[\u00A0\u202F]/g, ' ');
        break;
      default:
        break;
    }
  }
  return out || 'dd/MM/yyyy';
}

// --- Derive time format pattern (12h vs 24h) from locale ----------------------

function timeFormatFor(locale) {
  const ref = new Date(Date.UTC(2025, 0, 1, 15, 30, 0));
  const dtf = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
  const parts = dtf.formatToParts(ref);
  const has12h = parts.some((p) => p.type === 'dayPeriod');
  if (has12h) return 'hh:mm a';
  return 'HH:mm';
}

// --- Build phone code from REST Countries idd --------------------------------
// The +1 NANP countries (US, CA, BS, BB, …) share root "+1" with distinct
// 3-digit area codes as the suffix. We join root + first suffix.

// Hand-curated overrides for ITU-T E.164 country codes where REST Countries'
// `idd` structure does not cleanly recover the dial code (e.g. NANP, Vatican).
const PHONE_OVERRIDES = {
  VA: '+379', // Vatican City — assigned by ITU, though +39 is used in practice
  HM: '+672', // Heard & McDonald (uses Australian external territory code)
  BV: '+47', // Bouvet Island (Norwegian dependency)
  AQ: '+672', // Antarctica (Australian Antarctic Territory zone)
  AX: '+358', // Åland Islands — part of Finland's numbering plan
  SJ: '+47', // Svalbard and Jan Mayen — Norwegian numbering plan
  EH: '+212', // Western Sahara — Moroccan numbering plan
};

function phoneCodeFrom(cca2, idd) {
  if (PHONE_OVERRIDES[cca2]) return PHONE_OVERRIDES[cca2];
  if (!idd || !idd.root) return '';
  // NANP: all +1 territories share the +1 country code; suffixes are area codes.
  if (idd.root === '+1') return '+1';
  // Russia + Kazakhstan share +7; suffixes are zone codes within the country.
  if (idd.root === '+7') return '+7';
  const suffixes = (idd.suffixes ?? []).filter((s) => s !== '');
  if (suffixes.length === 0) return idd.root;
  const first = suffixes[0];
  // Country codes are 2 or 3 digits total; root is 1 digit. Concatenate when
  // suffix is 1–2 digits, otherwise the suffix is a sub-region code.
  if (first.length <= 2) return idd.root + first;
  return idd.root;
}

// --- Pick currency from REST Countries currencies object ----------------------

function currencyFrom(currencies) {
  if (!currencies) return null;
  const entries = Object.entries(currencies);
  if (entries.length === 0) return null;
  const [code, info] = entries[0];
  return { code, name: info.name, symbol: info.symbol ?? code };
}

// --- Aliases: hand-curated for the most common cases. Keep small. -------------

const ALIASES = {
  US: ['USA', 'United States of America'],
  GB: ['UK', 'Great Britain'],
  RU: ['Russian Federation'],
  KR: ['South Korea'],
  KP: ['North Korea'],
  VN: ['Vietnam'],
  LA: ["Lao People's Democratic Republic"],
  SY: ['Syrian Arab Republic'],
  IR: ['Iran'],
  CZ: ['Czechia', 'Czech Republic'],
  TZ: ['Tanzania, United Republic of'],
  CD: ['DRC', 'Democratic Republic of the Congo', 'Congo-Kinshasa'],
  CG: ['Republic of the Congo', 'Congo-Brazzaville'],
  CI: ["Cote d'Ivoire", 'Ivory Coast'],
  CV: ['Cabo Verde', 'Cape Verde'],
  SZ: ['Swaziland'],
  MK: ['Macedonia', 'North Macedonia'],
  TL: ['East Timor', 'Timor-Leste'],
  PS: ['Palestine'],
  VA: ['Vatican', 'Holy See'],
  TW: ['Taiwan, Province of China'],
};

// --- Locale overrides where CLDR likelySubtags don't fit common usage ---------
// E.g. Switzerland's likelySubtags is "de-CH" but the data file should reflect
// the canonical region tag we want. Adjustments here are minimal.

const LOCALE_OVERRIDES = {
  // Anglophone Africa where the official working language is English even
  // though CLDR likelySubtags returns a local language.
  GH: 'en-GH',
  NG: 'en-NG',
  KE: 'en-KE',
  UG: 'en-UG',
  TZ: 'en-TZ',
  RW: 'en-RW',
  ZA: 'en-ZA',
  ZM: 'en-ZM',
  ZW: 'en-ZW',
  MW: 'en-MW',
  BW: 'en-BW',
  SL: 'en-SL',
  LR: 'en-LR',
  GM: 'en-GM',
  NA: 'en-NA',
  SS: 'en-SS',
  LS: 'en-LS',
  SZ: 'en-SZ',
  // Indian English is the de facto working language alongside Hindi.
  IN: 'en-IN',
  // Pakistan official languages are Urdu + English; default to en-PK to align
  // with the existing data style.
  PK: 'en-PK',
  // Philippines English/Filipino — use en-PH (matches CLDR resolvedOptions).
  PH: 'en-PH',
};

// --- Build the dataset --------------------------------------------------------

function build() {
  const out = [];
  const seen = new Set();
  for (const c of rest) {
    const code = c.cca2;
    if (!code || seen.has(code)) continue;
    seen.add(code);

    const name = c.name.common;
    const flag = c.flag;
    const phoneCode = phoneCodeFrom(code, c.idd);
    const currency = currencyFrom(c.currencies);
    if (!currency) continue; // Skip Antarctica-style entries with no currency
    if (!phoneCode) continue;

    const locale = LOCALE_OVERRIDES[code] ?? localeForCountry(code);

    const tzs = tzByCountry.get(code) ?? [];
    if (tzs.length === 0) continue; // Skip entries with no IANA timezone

    const numberFormat = numberFormatFor(locale);
    const dateFormat = dateFormatFor(locale);
    const timeFormat = timeFormatFor(locale);

    const entry = {
      code,
      flag,
      phoneCode,
      name,
    };
    if (ALIASES[code]) entry.aliases = ALIASES[code];
    entry.locale = locale;
    if (tzs.length === 1) {
      entry.timezone = tzs[0];
      entry.utcOffset = utcOffsetOf(tzs[0]);
    } else {
      entry.timezones = tzs;
      entry.utcOffsets = tzs.map(utcOffsetOf);
    }
    entry.currency = currency;
    entry.dateFormat = dateFormat;
    entry.timeFormat = timeFormat;
    entry.numberFormat = numberFormat;

    out.push(entry);
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

// --- Emit TypeScript ----------------------------------------------------------

function escapeString(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function flagToEscape(flag) {
  // Convert flag emoji (two regional indicator code points) to \u{1F1XX} escapes.
  const parts = [];
  for (const cp of [...flag]) {
    parts.push(`\\u{${cp.codePointAt(0).toString(16).toUpperCase()}}`);
  }
  return `'${parts.join('')}'`;
}

function emitEntry(e) {
  const lines = [];
  lines.push('  {');
  lines.push(`    code: '${e.code}',`);
  lines.push(`    flag: ${flagToEscape(e.flag)},`);
  lines.push(`    phoneCode: '${escapeString(e.phoneCode)}',`);
  lines.push(`    name: '${escapeString(e.name)}',`);
  if (e.aliases) {
    lines.push(`    aliases: [${e.aliases.map((a) => `'${escapeString(a)}'`).join(', ')}],`);
  }
  lines.push(`    locale: '${e.locale}',`);
  if (e.timezone) {
    lines.push(`    timezone: '${e.timezone}',`);
    lines.push(`    utcOffset: '${e.utcOffset}',`);
  } else {
    lines.push(`    timezones: [${e.timezones.map((t) => `'${t}'`).join(', ')}],`);
    lines.push(`    utcOffsets: [${e.utcOffsets.map((o) => `'${o}'`).join(', ')}],`);
  }
  lines.push('    currency: {');
  lines.push(`      code: '${e.currency.code}',`);
  lines.push(`      name: '${escapeString(e.currency.name)}',`);
  lines.push(`      symbol: '${escapeString(e.currency.symbol)}',`);
  lines.push('    },');
  lines.push(`    dateFormat: '${escapeString(e.dateFormat)}',`);
  lines.push(`    timeFormat: '${escapeString(e.timeFormat)}',`);
  lines.push('    numberFormat: {');
  lines.push(`      decimalSeparator: '${escapeString(e.numberFormat.decimalSeparator)}',`);
  lines.push(`      thousandSeparator: '${escapeString(e.numberFormat.thousandSeparator)}',`);
  lines.push(`      example: '${escapeString(e.numberFormat.example)}',`);
  lines.push('    },');
  lines.push('  },');
  return lines.join('\n');
}

function emitFile(entries) {
  const header = [
    "import type { Country } from '../types/country.js';",
    '',
    '// Generated by scripts/generate-countries.mjs from credible sources:',
    '//   - REST Countries v3.1 (https://restcountries.com) — name, ISO 3166-1,',
    '//     phone code (ITU-T E.164), currency (ISO 4217), flag emoji.',
    '//   - IANA tz database zone1970.tab — IANA timezones per country.',
    '//   - Unicode CLDR via Node ICU (Intl.Locale, Intl.NumberFormat,',
    '//     Intl.DateTimeFormat) — locale (BCP 47), number/date/time formats.',
    '// To regenerate: `node scripts/generate-countries.mjs`.',
    '',
    'export const countries: Country[] = [',
  ];
  const body = entries.map(emitEntry).join('\n');
  const footer = ['].sort((a, b) => a.name.localeCompare(b.name));', ''];
  return header.join('\n') + '\n' + body + '\n' + footer.join('\n');
}

const entries = build();
const ts = emitFile(entries);
writeFileSync(join(REPO, 'src/data/countries.ts'), ts);
console.log(`Wrote ${entries.length} countries to src/data/countries.ts`);
