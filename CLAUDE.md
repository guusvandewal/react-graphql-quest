# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (Vite)
npm run build        # production build
npm run lint         # ESLint (flat config)
npm test             # run all tests once (Vitest)
npm run test:watch   # watch mode
```

Run a single test file:

```bash
npx vitest run src/pages/Index.test.tsx
```

Run tests matching a name pattern:

```bash
npx vitest run -t "filters countries"
```

## Architecture

### Data flow

`apolloClient` (lib/apolloClient.ts) → `useQuery` in Index.tsx → rendered country cards

- `apolloClient.ts` configures Apollo Client v4 with an `InMemoryCache` and an `onError` link that routes all GraphQL and network errors through `reportError` before they reach the component.
- `useQuery<CountriesData>(COUNTRIES_QUERY)` in `Index.tsx` returns `{ loading, error, data }` — Apollo's built-in state shape replaces the old custom `AsyncState<T>`.
- `COUNTRIES_QUERY` is exported from `Index.tsx` so tests can import the same `DocumentNode` reference that `MockedProvider` requires for exact matching.

### Apollo v4 import paths

Apollo Client v4 split its exports — wrong paths cause silent `undefined` errors:

| What                                                       | Import from                    |
| ---------------------------------------------------------- | ------------------------------ |
| `useQuery`, `ApolloProvider`                               | `@apollo/client/react`         |
| `ApolloClient`, `InMemoryCache`, `HttpLink`, `from`, `gql` | `@apollo/client`               |
| `onError`                                                  | `@apollo/client/link/error`    |
| `MockedProvider`                                           | `@apollo/client/testing/react` |

### Error observability

All errors funnel through `reportError` in `lib/errorReporter.ts`. The Apollo `onError` link handles both GraphQL errors (partial responses with `errors[]`) and network errors before they surface to the component. To wire up Sentry or another provider, change only `errorReporter.ts`.

### Types

`src/types.ts` is the single source of truth for all shared types. Key exports:

- `Country`, `Continent`, `Language` — API shapes
- `GraphQLResponse<T>` / `AsyncState<T>` — kept for reference; Apollo's `useQuery` return type supersedes `AsyncState<T>` in practice
- `isCountry` / `isCompleteCountry` — type guards used to narrow API responses before rendering
- `CountriesByContinent` — `Record<string, Country[]>`, used as the grouping result in Index.tsx

### Testing conventions

- Apollo queries are mocked with `MockedProvider` from `@apollo/client/testing/react`; the `request.query` must be the exact same `DocumentNode` reference exported by the component under test
- `waitFor` polls until assertions pass — used for both Apollo resolution and debounce expiry (300 ms); set `timeout: 1000` on debounce assertions to give enough headroom
- Fake timers (`vi.useFakeTimers`) conflict with Apollo's Promise-based mocks — avoid combining them; use `waitFor` with a timeout instead
- Pre-commit hooks: Husky runs ESLint + Prettier on staged `*.ts`/`*.tsx` via lint-staged
