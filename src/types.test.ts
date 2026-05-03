import { describe, it, expect } from 'vitest';
import { isCountry, isCompleteCountry } from '@/types';
import type { Country } from '@/types';

const germany: Country = {
  code: 'DE',
  name: 'Germany',
  emoji: '🇩🇪',
  capital: 'Berlin',
  currency: 'EUR',
  continent: { code: 'EU', name: 'Europe' },
  languages: [{ code: 'de', name: 'German' }],
};

describe('isCountry', () => {
  it('returns true for a valid Country object', () => {
    expect(isCountry(germany)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isCountry(null)).toBe(false);
  });

  it('returns false for a primitive', () => {
    expect(isCountry('Germany')).toBe(false);
    expect(isCountry(42)).toBe(false);
  });

  it('returns false when code is missing', () => {
    const { code: _, ...rest } = germany;
    expect(isCountry(rest)).toBe(false);
  });

  it('returns false when name is missing', () => {
    const { name: _, ...rest } = germany;
    expect(isCountry(rest)).toBe(false);
  });

  it('returns false when continent is missing', () => {
    const { continent: _, ...rest } = germany;
    expect(isCountry(rest)).toBe(false);
  });
});

describe('isCompleteCountry', () => {
  it('returns true when both capital and currency are strings', () => {
    expect(isCompleteCountry(germany)).toBe(true);
  });

  it('returns false when capital is null', () => {
    expect(isCompleteCountry({ ...germany, capital: null })).toBe(false);
  });

  it('returns false when currency is null', () => {
    expect(isCompleteCountry({ ...germany, currency: null })).toBe(false);
  });

  it('returns false when both capital and currency are null', () => {
    expect(isCompleteCountry({ ...germany, capital: null, currency: null })).toBe(false);
  });
});
