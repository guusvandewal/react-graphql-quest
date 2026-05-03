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
npx vitest run src/hooks/useGraphQL.test.ts
```

Run tests matching a name pattern:

```bash
npx vitest run -t "retries on failure"
```

## Architecture

### Data flow

`graphqlRequest` (lib/graphql.ts) → `useGraphQL` hook (hooks/useGraphQL.ts) → page component (pages/Index.tsx)

- `graphqlRequest` is a plain async function: POST to the endpoint, parse the GraphQL envelope `{ data, errors }`, throw on anything wrong. It owns the **timeout** (10 s default via `AbortController`) and forwards an optional external `signal` for cancellation.
- `useGraphQL` wraps it in a React hook. It owns **retry** (2× with incremental backoff), **cancellation on unmount** (AbortController cleanup), and **error reporting** via `reportError`. Variables are compared by `JSON.stringify` to avoid infinite re-renders from object identity; the actual value is read from a ref inside the effect.
- The hook returns `AsyncState<T>` — a discriminated union `{ status, data, error }` — which the UI switches on directly.

### Error handling layers

1. `graphqlRequest` — throws typed errors (`"Network error: 500"`, `"Request timed out"`, joined GraphQL error messages)
2. `useGraphQL` — catches after retries, calls `reportError`, sets `status: 'error'`
3. `ErrorBoundary` (components/ErrorBoundary.tsx) — catches unexpected render errors; calls `reportError` with component stack via `componentDidCatch`, wraps the entire app in App.tsx

### Error observability

All errors funnel through `reportError` in `lib/errorReporter.ts`. It currently logs to `console.error` with a structured payload. To wire up Sentry or another provider, change only that file.

### Types

`src/types.ts` is the single source of truth for all shared types. Key exports:

- `Country`, `Continent`, `Language` — API shapes
- `GraphQLResponse<T>` / `AsyncState<T>` — generic envelopes
- `isCountry` / `isCompleteCountry` — type guards used to narrow `unknown` API responses before rendering
- `CountriesByContinent` — `Record<string, Country[]>`, used as the grouping result in Index.tsx

### Testing conventions

- Fetch is mocked with `vi.stubGlobal('fetch', ...)` — no MSW
- Timer-dependent tests (`useDebounce`, timeout) use `vi.useFakeTimers()` / `vi.useRealTimers()` and clean up in `afterEach`
- `retryDelay: 0` is passed in hook tests to skip backoff delays
- `renderHook` + `waitFor` from `@testing-library/react` for async hook states

### Pre-commit hooks

Husky runs ESLint + Prettier on staged `*.ts`/`*.tsx` files via lint-staged. Commits are blocked on lint or format errors.
