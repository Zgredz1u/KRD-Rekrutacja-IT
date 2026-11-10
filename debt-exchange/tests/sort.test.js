import { describe, expect, it } from 'vitest';
import { compareDebts, getSortKey, parseDateKey, sortDebts } from '../src/utils/sort';

const debts = [
  { Id: 1, Name: 'bawol', NIP: '1112223301', Value: 1000, Date: '2017-03-01T00:00:00' },
  { Id: 2, Name: 'Alicja', NIP: '1112223302', Value: 4000, Date: '2017-03-30T00:00:00' },
  { Id: 3, Name: 'Zbigniew', NIP: '1112223303', Value: 100, Date: '2017-02-03T00:00:00' },
  { Id: 4, Name: 'aurelia', NIP: '1112223304', Value: 100000, Date: '2017-06-06T00:00:00' },
];

describe('parseDateKey', () => {
  it('parses an ISO 8601 date into a YYYYMMDD key', () => {
    expect(parseDateKey('2017-03-01T00:00:00')).toBe('20170301');
  });

  it('ignores the time component', () => {
    expect(parseDateKey('2017-03-01T23:59:59')).toBe('20170301');
  });

  it('returns a zero key for invalid input', () => {
    expect(parseDateKey('')).toBe('00000000');
    expect(parseDateKey(undefined)).toBe('00000000');
    expect(parseDateKey('not-a-date')).toBe('00000000');
  });
});

describe('getSortKey', () => {
  it('lowercases names for locale comparison', () => {
    expect(getSortKey({ Name: 'Alicja' }, 'name')).toBe('alicja');
  });

  it('keeps NIP as a string', () => {
    expect(getSortKey({ NIP: '1112223301' }, 'nip')).toBe('1112223301');
  });

  it('coerces Value to a number', () => {
    expect(getSortKey({ Value: 1000 }, 'value')).toBe(1000);
  });

  it('maps Date to a YYYYMMDD key', () => {
    expect(getSortKey({ Date: '2017-03-01T00:00:00' }, 'date')).toBe('20170301');
  });
});

describe('sortDebts', () => {
  it('sorts by name ascending (case-insensitive)', () => {
    const sorted = sortDebts(debts, 'name', 'asc');
    expect(sorted.map((d) => d.Name)).toEqual(['Alicja', 'aurelia', 'bawol', 'Zbigniew']);
  });

  it('sorts by name descending', () => {
    const sorted = sortDebts(debts, 'name', 'desc');
    expect(sorted.map((d) => d.Name)).toEqual(['Zbigniew', 'bawol', 'aurelia', 'Alicja']);
  });

  it('sorts by NIP as a string ascending', () => {
    const sorted = sortDebts(debts, 'nip', 'asc');
    expect(sorted.map((d) => d.NIP)).toEqual([
      '1112223301',
      '1112223302',
      '1112223303',
      '1112223304',
    ]);
  });

  it('sorts by NIP descending', () => {
    const sorted = sortDebts(debts, 'nip', 'desc');
    expect(sorted.map((d) => d.NIP)).toEqual([
      '1112223304',
      '1112223303',
      '1112223302',
      '1112223301',
    ]);
  });

  it('sorts by value numerically ascending (not lexicographically)', () => {
    const sorted = sortDebts(debts, 'value', 'asc');
    expect(sorted.map((d) => d.Value)).toEqual([100, 1000, 4000, 100000]);
  });

  it('sorts by value descending', () => {
    const sorted = sortDebts(debts, 'value', 'desc');
    expect(sorted.map((d) => d.Value)).toEqual([100000, 4000, 1000, 100]);
  });

  it('sorts by date chronologically ascending', () => {
    const sorted = sortDebts(debts, 'date', 'asc');
    expect(sorted.map((d) => d.Date)).toEqual([
      '2017-02-03T00:00:00',
      '2017-03-01T00:00:00',
      '2017-03-30T00:00:00',
      '2017-06-06T00:00:00',
    ]);
  });

  it('sorts by date descending', () => {
    const sorted = sortDebts(debts, 'date', 'desc');
    expect(sorted.map((d) => d.Date)).toEqual([
      '2017-06-06T00:00:00',
      '2017-03-30T00:00:00',
      '2017-03-01T00:00:00',
      '2017-02-03T00:00:00',
    ]);
  });

  it('does not mutate the input array', () => {
    const original = debts.map((d) => d.Id);
    sortDebts(debts, 'value', 'desc');
    expect(debts.map((d) => d.Id)).toEqual(original);
  });

  it('handles missing fields without crashing', () => {
    const messy = [{ Id: 1 }, { Id: 2, Name: 'x', Value: 5, NIP: '1', Date: '2020-01-01T00:00:00' }];
    const byName = sortDebts(messy, 'name', 'asc');
    expect(byName[0].Id).toBe(1);
    const byValue = sortDebts(messy, 'value', 'asc');
    expect(byValue[0].Id).toBe(1);
  });
});

describe('compareDebts', () => {
  it('returns 0 for equal values', () => {
    const a = { Name: 'a', NIP: '1', Value: 1, Date: '2020-01-01T00:00:00' };
    const b = { Name: 'a', NIP: '1', Value: 1, Date: '2020-01-01T00:00:00' };
    expect(compareDebts(a, b, 'name')).toBe(0);
    expect(compareDebts(a, b, 'nip')).toBe(0);
    expect(compareDebts(a, b, 'value')).toBe(0);
    expect(compareDebts(a, b, 'date')).toBe(0);
  });
});
