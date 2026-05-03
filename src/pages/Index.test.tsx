import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing/react';
import { describe, it, expect } from 'vitest';
import Index, { COUNTRIES_QUERY } from '@/pages/Index';

const germany = {
  code: 'DE',
  name: 'Germany',
  emoji: '🇩🇪',
  capital: 'Berlin',
  currency: 'EUR',
  continent: { code: 'EU', name: 'Europe' },
  languages: [{ code: 'de', name: 'German' }],
};

const france = {
  code: 'FR',
  name: 'France',
  emoji: '🇫🇷',
  capital: 'Paris',
  currency: 'EUR',
  continent: { code: 'EU', name: 'Europe' },
  languages: [{ code: 'fr', name: 'French' }],
};

const successMock = {
  request: { query: COUNTRIES_QUERY },
  result: { data: { countries: [germany, france] } },
};

function renderIndex(mocks = [successMock]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Index />
    </MockedProvider>
  );
}

describe('Index', () => {
  it('shows a loading indicator while the query is in flight', () => {
    renderIndex();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders countries after the query resolves', async () => {
    renderIndex();
    await waitFor(() => expect(screen.getByText('Germany')).toBeInTheDocument());
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('groups countries under a continent heading', async () => {
    renderIndex();
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 3, name: /Europe/ })).toBeInTheDocument()
    );
  });

  it('shows an error alert when the query fails', async () => {
    const errorMock = {
      request: { query: COUNTRIES_QUERY },
      error: new Error('Network failure'),
    };
    renderIndex([errorMock]);
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/Network failure/)).toBeInTheDocument();
  });

  it('filters countries by name after debounce', async () => {
    const user = userEvent.setup();
    renderIndex();
    await waitFor(() => expect(screen.getByText('Germany')).toBeInTheDocument());

    await user.type(screen.getByRole('textbox'), 'ger');

    // waitFor polls until the debounce (300 ms) fires and France disappears
    await waitFor(() => expect(screen.queryByText('France')).not.toBeInTheDocument(), {
      timeout: 1000,
    });
    expect(screen.getByText('Germany')).toBeInTheDocument();
  });

  it('shows "no countries match" when the filter has no results', async () => {
    const user = userEvent.setup();
    renderIndex();
    await waitFor(() => expect(screen.getByText('Germany')).toBeInTheDocument());

    await user.type(screen.getByRole('textbox'), 'zzz');

    await waitFor(() => expect(screen.getByText(/No countries match/)).toBeInTheDocument(), {
      timeout: 1000,
    });
  });
});
