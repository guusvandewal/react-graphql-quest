/**
 * =============================================================================
 *  types.ts — A tour of the most common TypeScript patterns
 * =============================================================================
 *
 *  This file is intentionally chatty. It demonstrates the TS features you will
 *  use in 90% of real React/GraphQL apps:
 *
 *    1. `interface` vs `type`
 *    2. Union & literal types
 *    3. Optional / readonly properties
 *    4. Generics (the `<T>` thing)
 *    5. Utility types (Partial, Pick, Omit, Record)
 *    6. Type guards (narrowing `unknown` safely)
 *    7. Re-exporting from a barrel file
 *
 *  Everything here is `export`-ed so the rest of the app can `import { ... }`.
 * ============================================================================= */

/* -------------------------------------------------------------------------- */
/*  1. Interfaces — describe the shape of an object                            */
/* -------------------------------------------------------------------------- */

/** A single country as returned by the Countries GraphQL API. */
export interface Country {
  /** ISO 3166-1 alpha-2 code, e.g. "DE" */
  code: string;
  name: string;
  emoji: string; // 🇩🇪
  capital: string | null; // some countries have no capital (e.g. Nauru)
  currency: string | null;
  continent: Continent;
  languages: Language[];
}

export interface Continent {
  code: string;
  name: string;
}

export interface Language {
  code: string;
  name: string;
}

/* -------------------------------------------------------------------------- */
/*  2. Union & literal types — a value that can be one of N exact things       */
/* -------------------------------------------------------------------------- */

/** Every async UI is in one of these four states. Memorize this pattern. */
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

/* -------------------------------------------------------------------------- */
/*  3. Generics — types that take parameters, like functions for types         */
/* -------------------------------------------------------------------------- */

/**
 * The standard envelope returned by any GraphQL server.
 * `T` is the shape of the `data` field — caller decides what it is.
 *
 * Example: `GraphQLResponse<{ countries: Country[] }>`
 */
export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface GraphQLError {
  message: string;
  path?: (string | number)[];
}

/** Generic state container used by our useGraphQL hook. */
export interface AsyncState<T> {
  status: RequestStatus;
  data: T | null;
  error: string | null;
}

/* -------------------------------------------------------------------------- */
/*  4. Utility types — built-in TS helpers (extremely common in real code)     */
/* -------------------------------------------------------------------------- */

/** A "preview" Country: just the bits we need for a list item. */
export type CountryPreview = Pick<Country, 'code' | 'name' | 'emoji'>;

/** A Country we are editing locally — every field becomes optional. */
export type CountryDraft = Partial<Country>;

/** A Country without its languages relation. */
export type CountryWithoutLanguages = Omit<Country, 'languages'>;

/** A lookup map: continent code -> list of countries. */
export type CountriesByContinent = Record<string, Country[]>;

/* -------------------------------------------------------------------------- */
/*  5. Type guards — turn `unknown` into a known type at runtime               */
/* -------------------------------------------------------------------------- */

/**
 * A type guard is a function that returns `value is X`.
 * If it returns true, TS will narrow the variable to type X inside the branch.
 */
export function isCompleteCountry(c: Country): c is NonNullableCountry {
  return c.capital !== null && c.currency !== null;
}

export function isCountry(value: unknown): value is Country {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'name' in value &&
    'continent' in value
  );
}

/* -------------------------------------------------------------------------- */
/*  6. Function-type aliases — shapes for callbacks                            */
/* -------------------------------------------------------------------------- */

export type Selector<T, R> = (item: T) => R;

export type NonNullableCountry = Omit<Country, 'capital' | 'currency'> & {
  capital: string;
  currency: string;
};

/* -------------------------------------------------------------------------- */
/*  7 Not used for now                                                        */
/* -------------------------------------------------------------------------- */

export type CountryName = Pick<Country, 'name'>;
export type ReadonlyCountry = Readonly<Country>;
