# React GraphQL Quest

A learning app that demonstrates how to use **TypeScript**, **React**, and **GraphQL** together — without any codegen or heavy client libraries.

Live data comes from the public [Countries GraphQL API](https://countries.trevorblades.com).

## What it covers

- Fetching GraphQL with plain `fetch` (no Apollo, no urql)
- Typing responses with generics (`GraphQLResponse<T>`, `AsyncState<T>`)
- Utility types in practice: `Pick`, `Omit`, `Partial`, `Readonly`, `Record`
- Type guards for narrowing `unknown` data from the network
- `useGraphQL` — a minimal custom hook that wraps fetch + state

## Stack

| Tool                     | Purpose            |
| ------------------------ | ------------------ |
| React 18                 | UI                 |
| TypeScript 5             | Type safety        |
| Vite                     | Dev server & build |
| Tailwind CSS + shadcn/ui | Styling            |
| Vitest                   | Unit tests         |
| ESLint + Prettier        | Code quality       |
| Husky + lint-staged      | Pre-commit hooks   |

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Script          | Description      |
| --------------- | ---------------- |
| `npm run dev`   | Start dev server |
| `npm run build` | Production build |
| `npm run lint`  | Run ESLint       |
| `npm test`      | Run tests        |

## Pre-commit hooks

Commits are blocked if staged files contain:

- ESLint errors (including `console.log` and unused imports)
- Prettier formatting issues

Hooks are installed automatically via `npm install` (`prepare` script runs Husky).

## Project structure

```
src/
├── types.ts          # All shared TypeScript types and type guards
├── hooks/
│   └── useGraphQL.ts # Generic fetch hook
├── lib/
│   └── graphql.ts    # Endpoint config and gql tag helper
├── pages/
│   └── Index.tsx     # Main page
└── components/
    ├── CountryCard.tsx
    └── Challenge.tsx  # Interactive quiz component
```
