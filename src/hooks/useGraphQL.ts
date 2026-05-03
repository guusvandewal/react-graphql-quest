/**
 * useGraphQL — a generic React hook that wraps `graphqlRequest`.
 *
 * Returns a typed `AsyncState<T>` so the UI can render loading / error / data
 * branches without juggling three separate useState calls.
 */

import { useEffect, useRef, useState } from "react";
import { graphqlRequest } from "@/lib/graphql";
import type { AsyncState } from "@/types";

interface Options {
  /** GraphQL endpoint URL */
  endpoint: string;
  /** The query string */
  query: string;
  /** Optional variables */
  variables?: Record<string, unknown>;
  /** Re-fetch when these change (like useEffect deps) */
  deps?: unknown[];
}

export function useGraphQL<T>({ endpoint, query, variables, deps = [] }: Options): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: "idle",
    data: null,
    error: null,
  });

  // Avoid setting state on an unmounted component (classic React gotcha).
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    setState({ status: "loading", data: null, error: null });

    graphqlRequest<T>(endpoint, query, variables)
      .then((data) => {
        if (!isMounted.current) return;
        setState({ status: "success", data, error: null });
      })
      .catch((err: unknown) => {
        if (!isMounted.current) return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setState({ status: "error", data: null, error: message });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
