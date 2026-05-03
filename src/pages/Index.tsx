import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useDebounce } from '@/hooks/useDebounce';
import { gql } from '@/lib/graphql';
import { CountryCard } from '@/components/CountryCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { isCompleteCountry } from '@/types';
import type { Country, CountriesByContinent } from '@/types';

export const COUNTRIES_QUERY = gql`
  query AllCountries {
    countries {
      code
      name
      emoji
      capital
      currency
      continent {
        code
        name
      }
      languages {
        code
        name
      }
    }
  }
`;

interface CountriesData {
  countries: Country[];
}

export default function Index() {
  const { loading, error, data } = useQuery<CountriesData>(COUNTRIES_QUERY);

  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebounce(filter, 300);

  const grouped: CountriesByContinent = useMemo(() => {
    if (!data) return {};
    const term = debouncedFilter.trim().toLowerCase();
    const complete = data.countries.filter(isCompleteCountry);
    const list = term
      ? complete.filter(
          c =>
            c.name.toLowerCase().includes(term) ||
            c.capital?.toLowerCase().includes(term) ||
            c.currency?.toLowerCase().includes(term)
        )
      : complete;
    return list.reduce<CountriesByContinent>((acc, c) => {
      (acc[c.continent.name] ||= []).push(c);
      return acc;
    }, {});
  }, [data, debouncedFilter]);

  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="container py-16 max-w-5xl">
          <Badge variant="outline" className="mb-4">
            React · TypeScript · GraphQL
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Search <span className="gradient-text"> for a country</span> with GraphQL
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            A pure React app that fetches real data from a public GraphQL API and shows the most
            common TypeScript patterns you'll meet on the job.
          </p>
        </div>
      </header>

      <div className="container py-12 max-w-5xl space-y-16">
        <section aria-labelledby="results-heading">
          <SectionHeading id="results-heading" n={1} title="Live results" />
          <p className="text-muted-foreground mb-4">
            Apollo's <code className="inline-code">useQuery</code> returns{' '}
            <code className="inline-code">{`{ loading, error, data }`}</code>. We render a different
            UI for each state.
          </p>

          <label htmlFor="country-filter" className="sr-only">
            Filter countries
          </label>
          <Input
            id="country-filter"
            placeholder="Filter by country, capital name or currency ..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="mb-6 max-w-sm"
          />

          {loading && (
            <p role="status" className="text-muted-foreground">
              Loading countries…
            </p>
          )}
          {error && (
            <p role="alert" className="text-destructive">
              Something went wrong: {error.message}
            </p>
          )}
          {!loading && !error && data && (
            <div aria-live="polite" aria-atomic="false" className="space-y-8">
              {Object.entries(grouped).map(([continent, countries]) => (
                <div key={continent}>
                  <h3 className="font-semibold text-lg mb-3">
                    {continent}{' '}
                    <span className="text-muted-foreground font-normal">({countries.length})</span>
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {countries.map(c => (
                      <CountryCard key={c.code} country={c} />
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(grouped).length === 0 && (
                <p className="text-muted-foreground">No countries match "{debouncedFilter}".</p>
              )}
            </div>
          )}
        </section>
      </div>

      <footer className="border-t mt-16">
        <div className="container py-8 max-w-5xl text-sm text-muted-foreground">
          Data from{' '}
          <a
            className="underline hover:text-foreground"
            href="https://countries.trevorblades.com"
            target="_blank"
            rel="noreferrer"
            aria-label="countries.trevorblades.com (opens in new tab)"
          >
            countries.trevorblades.com
          </a>{' '}
          · Built with React + Vite + Apollo.
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({ id, n, title }: { id: string; n: number; title: string }) {
  return (
    <h2 id={id} className="text-2xl font-bold mb-3 flex items-center gap-3">
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm"
      >
        {n}
      </span>
      {title}
    </h2>
  );
}
