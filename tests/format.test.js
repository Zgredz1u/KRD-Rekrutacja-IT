import { describe, expect, it } from 'vitest';
import { formatDate, formatNip, formatValue } from '../src/utils/format';

describe('formatValue', () => {
  it('formats with Polish grouping and two decimals', () => {
    expect(formatValue(10000)).toBe('10 000,00');
  });

  it('keeps existing decimals', () => {
    expect(formatValue(1234.5)).toBe('1 234,50');
  });

  it('handles zero', () => {
    expect(formatValue(0)).toBe('0,00');
  });

  it('handles negative values', () => {
    expect(formatValue(-999.99)).toBe('-999,99');
  });

  it('passes through non-numeric values', () => {
    expect(formatValue('abc')).toBe('abc');
    expect(formatValue(null)).toBe('');
  });
});

describe('formatDate', () => {
  it('formats ISO 8601 as dd-mm-yyyy', () => {
    expect(formatDate('2017-03-01T00:00:00')).toBe('01-03-2017');
  });

  it('ignores the time component', () => {
    expect(formatDate('2017-12-31T23:59:59')).toBe('31-12-2017');
  });

  it('passes through unparseable values', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate('niedata')).toBe('niedata');
    expect(formatDate(null)).toBe('');
  });
});

describe('formatNip', () => {
  it('renders NIP as a string, without numeric parsing', () => {
    expect(formatNip('1112223301')).toBe('1112223301');
  });

  it('keeps leading zeros (would be lost if parsed as a number)', () => {
    expect(formatNip('0001234567')).toBe('0001234567');
  });

  it('handles empty values', () => {
    expect(formatNip('')).toBe('');
    expect(formatNip(null)).toBe('');
  });
});
