import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useGraphQL } from '@/hooks/useGraphQL';
import { COUNTRIES_ENDPOINT } from '@/lib/graphql';

function makeFetch(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Server Error',
    json: () => Promise.resolve(body),
  });
}

describe('useGraphQL', () => {
  afterEach(() => vi.restoreAllMocks());

  it('starts in loading state', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {}))); // never resolves

    const { result } = renderHook(() =>
      useGraphQL({ endpoint: COUNTRIES_ENDPOINT, query: '{ test }' })
    );

    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('transitions to success and exposes typed data', async () => {
    vi.stubGlobal('fetch', makeFetch({ data: { countries: [{ code: 'DE' }] } }));

    const { result } = renderHook(() =>
      useGraphQL<{ countries: { code: string }[] }>({
        endpoint: COUNTRIES_ENDPOINT,
        query: '{ countries { code } }',
      })
    );

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toEqual({ countries: [{ code: 'DE' }] });
    expect(result.current.error).toBeNull();
  });

  it('transitions to error after exhausting all retries', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));

    const { result } = renderHook(() =>
      useGraphQL({ endpoint: COUNTRIES_ENDPOINT, query: '{ test }', retries: 0 })
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Network down');
    expect(result.current.data).toBeNull();
  });

  it('transitions to error on a non-ok HTTP response', async () => {
    vi.stubGlobal('fetch', makeFetch({}, false));

    const { result } = renderHook(() =>
      useGraphQL({ endpoint: COUNTRIES_ENDPOINT, query: '{ test }', retries: 0 })
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/Network error/);
  });

  it('transitions to error when the response contains GraphQL errors', async () => {
    vi.stubGlobal('fetch', makeFetch({ errors: [{ message: 'Resolver failed' }] }));

    const { result } = renderHook(() =>
      useGraphQL({ endpoint: COUNTRIES_ENDPOINT, query: '{ test }', retries: 0 })
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Resolver failed');
  });

  it('retries on failure and succeeds on a later attempt', async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network down'))
      .mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ data: { countries: [] } }),
      });
    vi.stubGlobal('fetch', fetch);

    const { result } = renderHook(() =>
      useGraphQL<{ countries: [] }>({
        endpoint: COUNTRIES_ENDPOINT,
        query: '{ countries }',
        retries: 1,
        retryDelay: 0,
      })
    );

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('re-fetches when the query changes', async () => {
    const fetch = makeFetch({ data: {} });
    vi.stubGlobal('fetch', fetch);

    const { rerender } = renderHook(
      ({ query }: { query: string }) => useGraphQL({ endpoint: COUNTRIES_ENDPOINT, query }),
      { initialProps: { query: '{ query1 }' } }
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    rerender({ query: '{ query2 }' });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });
});
