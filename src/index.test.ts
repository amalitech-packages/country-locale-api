import { describe, expect, it } from 'vitest';
import {
  countries,
  countryOptions,
  currencyOptions,
  formatCurrency,
  formatDate,
  formatNumber,
  getCountryInfo,
} from './index.js';

describe('countries', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(countries)).toBe(true);
    expect(countries.length).toBeGreaterThan(0);
  });

  it('contains expected fields for Ghana', () => {
    const ghana = countries.find((country) => country.code === 'GH');

    expect(ghana).toMatchObject({
      name: 'Ghana',
      locale: 'en-GH',
      currency: { code: 'GHS' },
      numberFormat: { decimalSeparator: '.' },
    });
  });

  it('has no duplicate country codes', () => {
    const codes = countries.map((country) => country.code);

    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe('countryOptions', () => {
  it('maps countries to key/label entries for selects', () => {
    expect(countryOptions.length).toBe(countries.length);
    expect(countryOptions[0]).toEqual({ key: 'GH', label: 'Ghana' });
  });

  it('contains a United States entry', () => {
    expect(countryOptions).toContainEqual({
      key: 'US',
      label: 'United States',
    });
  });
});

describe('currencyOptions', () => {
  it('maps currencies to symbol/code entries for selects', () => {
    expect(currencyOptions).toContainEqual({ key: '$', label: 'USD' });
    expect(currencyOptions).toContainEqual({ key: '\u20AC', label: 'EUR' });
  });

  it('deduplicates currencies shared by multiple countries', () => {
    const eurEntries = currencyOptions.filter((option) => option.label === 'EUR');

    expect(eurEntries).toHaveLength(1);
  });
});

describe('getCountryInfo', () => {
  it('finds a country by name case-insensitively', () => {
    expect(getCountryInfo('ghana')?.code).toBe('GH');
  });

  it('finds a country by ISO code', () => {
    expect(getCountryInfo('US')?.name).toBe('United States');
  });

  it('finds a country by alias', () => {
    expect(getCountryInfo('usa')?.code).toBe('US');
  });

  it('trims whitespace', () => {
    expect(getCountryInfo('  Ghana  ')?.code).toBe('GH');
  });

  it('returns undefined for an unknown or empty value', () => {
    expect(getCountryInfo('Atlantis')).toBeUndefined();
    expect(getCountryInfo('')).toBeUndefined();
    expect(getCountryInfo('   ')).toBeUndefined();
  });
});

describe('formatCurrency', () => {
  it('formats USD amounts for en-US', () => {
    expect(formatCurrency(1234.56, 'en-US')).toBe('$1,234.56');
  });

  it('formats EUR amounts for de-DE', () => {
    expect(formatCurrency(1234.56, 'de-DE')).toContain('\u20AC');
  });

  it('infers currency from the locale region', () => {
    expect(formatCurrency(1234.56, 'en-GB')).toContain('\u00A3');
  });

  it('falls back to USD when the locale has no supported country', () => {
    expect(formatCurrency(1234.56, 'en-CA')).toContain('US$');
  });

  it('throws on non-finite numbers and empty locales', () => {
    expect(() => formatCurrency(NaN, 'en-US')).toThrow(TypeError);
    expect(() => formatCurrency(Infinity, 'en-US')).toThrow(TypeError);
    expect(() => formatCurrency(100, '')).toThrow(TypeError);
  });
});

describe('formatNumber', () => {
  it('formats with en-US grouping', () => {
    expect(formatNumber(1234567.89, 'en-US')).toBe('1,234,567.89');
  });

  it('formats with de-DE grouping', () => {
    expect(formatNumber(1234567.89, 'de-DE')).toBe('1.234.567,89');
  });

  it('handles zero and negative numbers', () => {
    expect(formatNumber(0, 'en-US')).toBe('0');
    expect(formatNumber(-42.5, 'en-US')).toBe('-42.5');
  });

  it('throws on non-finite numbers and empty locales', () => {
    expect(() => formatNumber(NaN, 'en-US')).toThrow(TypeError);
    expect(() => formatNumber(Infinity, 'en-US')).toThrow(TypeError);
    expect(() => formatNumber(100, '')).toThrow(TypeError);
  });
});

describe('formatDate', () => {
  const testDate = new Date(2025, 2, 15);

  it("formats dates with each country's configured pattern", () => {
    expect(formatDate(testDate, 'en-US')).toBe('03/15/2025');
    expect(formatDate(testDate, 'de-DE')).toBe('15.03.2025');
    expect(formatDate(testDate, 'en-GH')).toBe('15/03/2025');
    expect(formatDate(testDate, 'ja-JP')).toBe('2025/03/15');
    expect(formatDate(testDate, 'zh-CN')).toBe('2025-03-15');
  });

  it('accepts ISO strings and timestamp numbers', () => {
    const timestamp = testDate.getTime();

    expect(formatDate('2025-03-15T00:00:00', 'en-US')).toBe('03/15/2025');
    expect(formatDate(timestamp, 'en-US')).toBe('03/15/2025');
  });

  it('falls back to dd/MM/yyyy for unknown regions', () => {
    expect(formatDate(testDate, 'en-CA')).toBe('15/03/2025');
  });

  it('throws on invalid date or empty locale', () => {
    expect(() => formatDate('not-a-date', 'en-US')).toThrow(TypeError);
    expect(() => formatDate(testDate, '')).toThrow(TypeError);
  });
});
