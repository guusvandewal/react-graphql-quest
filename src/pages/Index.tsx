/**
 * Index.tsx — the only page in this learning app.
 *
 * Demonstrates:
 *   • Importing types from a barrel file (`@/types`)
 *   • Calling a GraphQL endpoint with plain `fetch`
 *   • Rendering loading / error / data branches with full type-safety
 *   • Inline TypeScript challenges so the reader can self-test
 */

import { useMemo, useState } from 'react';
import { useGraphQL } from '@/hooks/useGraphQL';
import { COUNTRIES_ENDPOINT, gql } from '@/lib/graphql';
import { CountryCard } from '@/components/CountryCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { isCompleteCountry } from '@/types';
import type { Country, CountriesByContinent } from '@/types';

/* ------------------------------------------------------------------ */
/*  The GraphQL query — a plain string. `gql` is just for highlighting. */
/* ------------------------------------------------------------------ */
const COUNTRIES_QUERY = gql`
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

/** Shape of the `data` field we expect back from the server. */
interface CountriesData {
  countries: Country[];
}

export default function Index() {
  // 👇 Generic argument tells the hook (and us) the shape of `data`.
  const { status, data, error } = useGraphQL<CountriesData>({
    endpoint: COUNTRIES_ENDPOINT,
    query: COUNTRIES_QUERY,
  });

  const [filter, setFilter] = useState('');

  // Group countries by continent. `Record<string, Country[]>` lives in types.ts.
  const grouped: CountriesByContinent = useMemo(() => {
    if (!data) return {};
    const term = filter.trim().toLowerCase();
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
  }, [data, filter]);

  return (
    <main className="min-h-screen">
      {/* ---------- Hero ---------- */}
      <header className="border-b">
        <div className="container py-16 max-w-5xl">
          <Badge variant="outline" className="mb-4">
            React · TypeScript · GraphQL
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Search <span className="gradient-text"> for a country</span> with GraphQL
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            A pure React app — no Apollo, no codegen — that fetches real data from a public GraphQL
            API and shows the most common TypeScript patterns you'll meet on the job.
          </p>
        </div>
      </header>

      <div className="container py-12 max-w-5xl space-y-16">
        <section>
          <SectionHeading n={1} title="Live results" />
          <p className="text-muted-foreground mb-4">
            The hook returns <code className="inline-code">{`{ status, data, error }`}</code>. We
            render a different UI for each value of <code className="inline-code">status</code>.
          </p>

          <Input
            placeholder="Filter by country, capital name or currency ..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="mb-6 max-w-sm"
          />

          {status === 'loading' && <p className="text-muted-foreground">Loading countries…</p>}
          {status === 'error' && <p className="text-destructive">Something went wrong: {error}</p>}
          {status === 'success' && data && (
            <div className="space-y-8">
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
                <p className="text-muted-foreground">No countries match "{filter}".</p>
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
          >
            countries.trevorblades.com
          </a>{' '}
          · Built with React + Vite.
        </div>
      </footer>
    </main>
  );
}

/* -------------------- tiny local component -------------------- */
function SectionHeading({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm">
        {n}
      </span>
      {title}
    </h2>
  );
}
