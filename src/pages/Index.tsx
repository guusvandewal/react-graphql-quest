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
import { Challenge } from '@/components/Challenge';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type {
  Country,
  CountriesByContinent,
  CountryName,
  ReadonlyCountry,
  NonNullableCountry,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  The GraphQL query — a plain string. `gql` is just for highlighting */
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
    const list = term
      ? data.countries.filter(c => c.name.toLowerCase().includes(term))
      : data.countries;
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
            Learn <span className="gradient-text">GraphQL + TypeScript</span> by reading one app
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            A pure React app — no Apollo, no codegen — that fetches real data from a public GraphQL
            API and shows the most common TypeScript patterns you'll meet on the job.
          </p>
        </div>
      </header>

      <div className="container py-12 max-w-5xl space-y-16">
        {/* ---------- Section 1: the query ---------- */}
        <section>
          <SectionHeading n={1} title="The GraphQL query" />
          <p className="text-muted-foreground mb-4">
            GraphQL is just an HTTP <code className="inline-code">POST</code> with a JSON body
            containing a <code className="inline-code">query</code> string. No special client
            required.
          </p>
          <pre className="code-block">{COUNTRIES_QUERY.trim()}</pre>
        </section>

        {/* ---------- Section 2: results ---------- */}
        <section>
          <SectionHeading n={2} title="Live results" />
          <p className="text-muted-foreground mb-4">
            The hook returns <code className="inline-code">{`{ status, data, error }`}</code>. We
            render a different UI for each value of <code className="inline-code">status</code>.
          </p>

          <Input
            placeholder="Filter by country name…"
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

        {/* ---------- Section 3: challenges ---------- */}
        <section>
          <SectionHeading n={3} title="Test yourself" />
          <p className="text-muted-foreground mb-6">
            Five quick questions covering the patterns used in this app. Pick the answer you think
            is right — explanations appear instantly.
          </p>

          <div className="grid gap-4">
            <Challenge
              question="What does the `T` mean in `useGraphQL<T>(...)`?"
              options={[
                'T is a runtime variable holding the fetched data',
                'T is a generic type parameter — the caller decides the shape',
                'T stands for `Type`, a built-in TS keyword',
                'T must always be `any`',
              ]}
              correctIndex={1}
              explanation="Generics let a function/hook be reusable with many types. The caller passes the type, e.g. useGraphQL<CountriesData>(...)."
            />

            <Challenge
              question="Which utility type would you use to make EVERY field of `Country` optional?"
              options={[
                "Pick<Country, 'name'>",
                "Omit<Country, 'name'>",
                'Partial<Country>',
                'Readonly<Country>',
              ]}
              correctIndex={2}
              explanation="`Partial<T>` walks every key of T and adds `?` to it. Perfect for draft/edit forms."
            />

            <Challenge
              question="A GraphQL response always has the shape:"
              options={[
                '{ result, status }',
                '{ data, errors }',
                '{ payload, meta }',
                'Whatever the server decides',
              ]}
              correctIndex={1}
              explanation="The GraphQL spec mandates an envelope with optional `data` and optional `errors`. Both can be present at once (partial success)."
            />

            <Challenge
              question="Why do we type the `fetch` body as `unknown` then narrow it?"
              options={[
                'Because `any` is faster at runtime',
                'Because the network can return literally anything — `unknown` forces us to validate before use',
                'Because TS requires it',
                "We don't — `any` is fine",
              ]}
              correctIndex={1}
              explanation="`unknown` is the type-safe twin of `any`: you cannot use the value until you've proven what it is (e.g. with a type guard like `isCountry`)."
            />

            <Challenge
              question="Which of these is a valid TypeScript type guard?"
              options={[
                'function isCountry(v) { return v.code; }',
                "function isCountry(v: unknown): v is Country { return typeof v === 'object' && v !== null && 'code' in v; }",
                'type isCountry = Country;',
                'const isCountry = (v: any) => v as Country;',
              ]}
              correctIndex={1}
              explanation="A type guard is a function whose return type is `value is X`. Inside the `if` branch, TS narrows the variable to X."
            />
          </div>
        </section>

        {/* ---------- Section 4: challenges from types.ts ---------- */}
        <section>
          <SectionHeading n={4} title="Bonus exercises" />
          <p className="text-muted-foreground mb-4">
            Open <code className="inline-code">src/types.ts</code> and try these on your own.
            Solutions below — no peeking!
          </p>
          <pre className="code-block">{`// A. Extract just the name type:
type CountryName = Country["name"]; // string

// B. Make all fields readonly:
type ReadonlyCountry = Readonly<Country>;

// C. Force capital & currency to be non-null:
type NonNullableCountry = Omit<Country, "capital" | "currency"> & {
  capital: string;
  currency: string;
};`}</pre>
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
