import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CountryCard } from '@/components/CountryCard';
import type { Country } from '@/types';

const germany: Country = {
  code: 'DE',
  name: 'Germany',
  emoji: '🇩🇪',
  capital: 'Berlin',
  currency: 'EUR',
  continent: { code: 'EU', name: 'Europe' },
  languages: [
    { code: 'de', name: 'German' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'nl', name: 'Dutch' },
  ],
};

describe('CountryCard', () => {
  it('renders the country name', () => {
    render(<CountryCard country={germany} />);
    expect(screen.getByText('Germany')).toBeInTheDocument();
  });

  it('renders capital and currency', () => {
    render(<CountryCard country={germany} />);
    expect(screen.getByText(/Berlin/)).toBeInTheDocument();
    expect(screen.getByText(/EUR/)).toBeInTheDocument();
  });

  it('shows "No capital" when capital is null', () => {
    render(<CountryCard country={{ ...germany, capital: null }} />);
    expect(screen.getByText(/No capital/)).toBeInTheDocument();
  });

  it('shows "—" when currency is null', () => {
    render(<CountryCard country={{ ...germany, currency: null }} />);
    expect(screen.getByText(/—/)).toBeInTheDocument();
  });

  it('renders the continent as a badge', () => {
    render(<CountryCard country={germany} />);
    expect(screen.getByText('Europe')).toBeInTheDocument();
  });

  it('renders at most 3 language badges', () => {
    render(<CountryCard country={germany} />);

    expect(screen.getByText('German')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
    expect(screen.queryByText('Dutch')).not.toBeInTheDocument();
  });

  it('renders all languages when fewer than 3 are present', () => {
    render(<CountryCard country={{ ...germany, languages: [{ code: 'de', name: 'German' }] }} />);
    expect(screen.getByText('German')).toBeInTheDocument();
  });

  it('renders no language badges when the list is empty', () => {
    render(<CountryCard country={{ ...germany, languages: [] }} />);
    expect(screen.queryByText('German')).not.toBeInTheDocument();
  });
});
