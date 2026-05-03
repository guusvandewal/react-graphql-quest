import { describe, it, expect, vi, afterEach } from 'vitest';
import { graphqlRequest, gql, COUNTRIES_ENDPOINT } from '@/lib/graphql';

function makeFetch(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: () => Promise.resolve(body),
  });
}

describe('graphqlRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns data on a successful response', async () => {
    vi.stubGlobal('fetch', makeFetch({ data: { countries: [{ code: 'DE' }] } }));

    const result = await graphqlRequest<{ countries: { code: string }[] }>(
      COUNTRIES_ENDPOINT,
      '{ countries { code } }'
    );

    expect(result).toEqual({ countries: [{ code: 'DE' }] });
  });

  it('sends a POST with JSON body containing query and variables', async () => {
    const fetch = makeFetch({ data: {} });
    vi.stubGlobal('fetch', fetch);

    await graphqlRequest(COUNTRIES_ENDPOINT, '{ countries }', { code: 'DE' }).catch(() => {});

    const [url, options] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(COUNTRIES_ENDPOINT);
    expect(options.method).toBe('POST');
    expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(JSON.parse(options.body as string)).toEqual({
      query: '{ countries }',
      variables: { code: 'DE' },
    });
  });

  it('throws on a non-ok HTTP status', async () => {
    vi.stubGlobal('fetch', makeFetch({}, false, 500));

    await expect(graphqlRequest(COUNTRIES_ENDPOINT, '{ countries }')).rejects.toThrow(
      'Network error: 500'
    );
  });

  it('throws when the response contains GraphQL errors', async () => {
    vi.stubGlobal('fetch', makeFetch({ errors: [{ message: 'Field not found' }] }));

    await expect(graphqlRequest(COUNTRIES_ENDPOINT, '{ bad }')).rejects.toThrow('Field not found');
  });

  it('joins multiple GraphQL errors into a single message', async () => {
    vi.stubGlobal('fetch', makeFetch({ errors: [{ message: 'Error A' }, { message: 'Error B' }] }));

    await expect(graphqlRequest(COUNTRIES_ENDPOINT, '{ bad }')).rejects.toThrow('Error A; Error B');
  });

  it('throws when data is missing from the response', async () => {
    vi.stubGlobal('fetch', makeFetch({}));

    await expect(graphqlRequest(COUNTRIES_ENDPOINT, '{ countries }')).rejects.toThrow(
      'no `data` field'
    );
  });

  it('throws when fetch itself rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));

    await expect(graphqlRequest(COUNTRIES_ENDPOINT, '{ countries }')).rejects.toThrow(
      'Network down'
    );
  });

  it('throws "Request timed out" when the timeout fires before a response', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        (_url: string, { signal }: { signal: AbortSignal }) =>
          new Promise((_, reject) => {
            signal.addEventListener('abort', () =>
              reject(new DOMException('The user aborted a request.', 'AbortError'))
            );
          })
      )
    );

    const promise = graphqlRequest(COUNTRIES_ENDPOINT, '{ countries }', undefined, {
      timeoutMs: 5_000,
    });

    vi.advanceTimersByTime(5_001);

    await expect(promise).rejects.toThrow('Request timed out');
  });
});

describe('gql', () => {
  it('returns the template string unchanged', () => {
    expect(gql`
      {
        countries {
          code
          name
        }
      }
    `).toBe('{ countries { code name } }');
  });

  it('interpolates values into the string', () => {
    const field = 'name';
    expect(gql`{ countries { ${field} } }`).toBe('{ countries { name } }');
  });
});
