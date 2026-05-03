/**
 * graphql.ts — a tiny GraphQL client built on the native `fetch` API.
 *
 * No Apollo, no urql, no extra libraries. Just `fetch` + types.
 * This is enough for ~80% of real apps.
 */

import type { GraphQLResponse } from '@/types';

/** Public, no-auth GraphQL endpoint we use for the demo. */
export const COUNTRIES_ENDPOINT = 'https://countries.trevorblades.com/graphql';

/**
 * Send a GraphQL query/mutation.
 *
 * @param endpoint  GraphQL HTTP endpoint
 * @param query     The query string (use the `gql` helper for syntax highlight)
 * @param variables Optional variables map
 * @param options   Optional signal (for cancellation) and timeoutMs (default 10 s)
 *
 * Generic `T` lets the caller declare what `data` looks like:
 *
 *   const res = await graphqlRequest<{ countries: Country[] }>(url, COUNTRIES_QUERY);
 *   res.data?.countries  // ✅ typed as Country[]
 */
export async function graphqlRequest<T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  { signal, timeoutMs = 10_000 }: { signal?: AbortSignal; timeoutMs?: number } = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  // If the caller cancels (e.g. component unmounts), forward that abort.
  signal?.addEventListener('abort', () => controller.abort(), { once: true });

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
  } catch (err) {
    // Distinguish a timeout from a caller-initiated abort so callers can show a useful message.
    if (controller.signal.aborted && !signal?.aborted) {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Network error: ${response.status} ${response.statusText}`);
  }

  // The body is always shaped like `{ data, errors }` — see GraphQL spec.
  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map(e => e.message).join('; '));
  }
  if (!json.data) {
    throw new Error('GraphQL response had no `data` field.');
  }
  return json.data;
}

/**
 * `gql` is just an identity tagged-template literal.
 * It does NOTHING at runtime — its only purpose is to let editor extensions
 * highlight the GraphQL string. Real libraries (Apollo, urql) use the same name.
 */
export function gql(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
}
