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

  it('transitions to error when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));

    const { result } = renderHook(() =>
      useGraphQL({ endpoint: COUNTRIES_ENDPOINT, query: '{ test }' })
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Network down');
    expect(result.current.data).toBeNull();
  });

  it('transitions to error on a non-ok HTTP response', async () => {
    vi.stubGlobal('fetch', makeFetch({}, false));

    const { result } = renderHook(() =>
      useGraphQL({ endpoint: COUNTRIES_ENDPOINT, query: '{ test }' })
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/Network error/);
  });

  it('transitions to error when the response contains GraphQL errors', async () => {
    vi.stubGlobal('fetch', makeFetch({ errors: [{ message: 'Resolver failed' }] }));

    const { result } = renderHook(() =>
      useGraphQL({ endpoint: COUNTRIES_ENDPOINT, query: '{ test }' })
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Resolver failed');
  });

  it('re-fetches when deps change', async () => {
    const fetch = makeFetch({ data: { value: 1 } });
    vi.stubGlobal('fetch', fetch);

    const { rerender } = renderHook(
      ({ id }: { id: number }) =>
        useGraphQL({ endpoint: COUNTRIES_ENDPOINT, query: '{ test }', deps: [id] }),
      { initialProps: { id: 1 } }
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    rerender({ id: 2 });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });
});
