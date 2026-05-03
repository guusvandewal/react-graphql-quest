/**
 * useGraphQL — a generic React hook that wraps `graphqlRequest`.
 *
 * Returns a typed `AsyncState<T>` so the UI can render loading / error / data
 * branches without juggling three separate useState calls.
 */

import { useEffect, useRef, useState } from 'react';
import { graphqlRequest } from '@/lib/graphql';
import { reportError } from '@/lib/errorReporter';
import type { AsyncState } from '@/types';

interface Options {
  /** GraphQL endpoint URL */
  endpoint: string;
  /** The query string */
  query: string;
  /** Optional variables */
  variables?: Record<string, unknown>;
  /** How many times to retry on failure before settling on error (default 2) */
  retries?: number;
  /** Delay between retries in ms — exposed so tests can pass 0 (default 300) */
  retryDelay?: number;
}

export function useGraphQL<T>({
  endpoint,
  query,
  variables,
  retries = 2,
  retryDelay = 300,
}: Options): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  // Keep the latest variables object in a ref so the effect reads the current
  // value without needing it as a dep (objects would cause infinite re-renders).
  const variablesRef = useRef(variables);
  variablesRef.current = variables;

  // Serialize variables only to determine *when* to re-run the effect.
  const serializedVars = JSON.stringify(variables);

  useEffect(() => {
    const controller = new AbortController();

    const run = async (attempt: number): Promise<void> => {
      try {
        const data = await graphqlRequest<T>(endpoint, query, variablesRef.current, {
          signal: controller.signal,
        });
        setState({ status: 'success', data, error: null });
      } catch (err) {
        if (controller.signal.aborted) return; // component unmounted — discard
        if (attempt < retries) {
          await new Promise<void>(r => setTimeout(r, retryDelay * (attempt + 1)));
          if (!controller.signal.aborted) await run(attempt + 1);
        } else {
          const message = err instanceof Error ? err.message : 'Unknown error';
          reportError({ message, context: `useGraphQL(${endpoint})`, error: err });
          setState({ status: 'error', data: null, error: message });
        }
      }
    };

    setState({ status: 'loading', data: null, error: null });
    run(0);

    return () => controller.abort();
  }, [endpoint, query, serializedVars, retries, retryDelay]);

  return state;
}
