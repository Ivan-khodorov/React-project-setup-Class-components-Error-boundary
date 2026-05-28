import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_API_CACHE_TTL_SECONDS,
  getApiCacheTtlSeconds,
  getCharactersListCacheId,
  starTrekCharactersApi,
  type CharactersQueryArgs,
} from './starTrekCharactersApi';

const createTestStore = () =>
  configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(starTrekCharactersApi.middleware),
    reducer: {
      [starTrekCharactersApi.reducerPath]: starTrekCharactersApi.reducer,
    },
  });

const dispatchCharactersQuery = async (args: CharactersQueryArgs) => {
  const store = createTestStore();

  return store.dispatch(
    starTrekCharactersApi.endpoints.getCharacters.initiate(args)
  );
};

const dispatchCharacterDetailsQuery = async (characterId: string) => {
  const store = createTestStore();

  return store.dispatch(
    starTrekCharactersApi.endpoints.getCharacterDetails.initiate(characterId)
  );
};

describe('starTrekCharactersApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses a configurable cache TTL with a fallback value', () => {
    expect(getApiCacheTtlSeconds('60')).toBe(60);
    expect(getApiCacheTtlSeconds('0')).toBe(0);
    expect(getApiCacheTtlSeconds('invalid')).toBe(
      DEFAULT_API_CACHE_TTL_SECONDS
    );
    expect(getApiCacheTtlSeconds('-1')).toBe(DEFAULT_API_CACHE_TTL_SECONDS);
  });

  it('creates a stable list cache id from trimmed search term and page', () => {
    expect(
      getCharactersListCacheId({ page: 2, searchTerm: '  spock  ' })
    ).toBe('spock::2');
    expect(getCharactersListCacheId({ page: -1, searchTerm: '' })).toBe('::1');
  });

  it('sends a POST request with default pagination', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        characters: [],
        page: { totalPages: 1 },
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await dispatchCharactersQuery({ searchTerm: '' });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl, requestInit] = fetchMock.mock.calls[0];

    expect(requestUrl).toBeInstanceOf(URL);
    expect(requestUrl.searchParams.get('pageNumber')).toBe('0');
    expect(requestUrl.searchParams.get('pageSize')).toBe('10');
    expect(requestInit).toMatchObject({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });
  });

  it('trims the search term before sending the request body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        characters: [],
        page: { totalPages: 1 },
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await dispatchCharactersQuery({ searchTerm: '  spock  ' });

    const [, requestInit] = fetchMock.mock.calls[0];

    expect(requestInit.body).toBeInstanceOf(URLSearchParams);
    expect((requestInit.body as URLSearchParams).toString()).toBe(
      'name=spock'
    );
  });

  it('maps a successful response to item objects', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        characters: [
          {
            gender: 'Male',
            name: 'Spock',
            uid: 'spock',
            yearOfBirth: 2230,
          },
        ],
        page: { totalPages: 3 },
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      dispatchCharactersQuery({ searchTerm: 'spock' })
    ).resolves.toMatchObject({
      data: {
        items: [
          {
            description:
              'Gender: Male. Birth year: 2230. Death year: unknown.',
            detailsId: 'spock',
            id: 'spock-0',
            name: 'Spock',
          },
        ],
        totalPages: 3,
      },
      isSuccess: true,
    });
  });

  it('uses unknown for missing response fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        characters: [
          {
            name: 'Unknown Crew Member',
            uid: 'unknown-crew-member',
          },
        ],
        page: { totalPages: 1 },
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      dispatchCharactersQuery({ searchTerm: 'unknown' })
    ).resolves.toMatchObject({
      data: {
        items: [
          {
            description:
              'Gender: unknown. Birth year: unknown. Death year: unknown.',
            detailsId: 'unknown-crew-member',
            id: 'unknown-crew-member-0',
            name: 'Unknown Crew Member',
          },
        ],
        totalPages: 1,
      },
    });
  });

  it('uses unknown for null response fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        characters: [
          {
            gender: null,
            name: 'Null Crew Member',
            uid: 'null-crew-member',
            yearOfBirth: null,
            yearOfDeath: null,
          },
        ],
        page: { totalPages: 1 },
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      dispatchCharactersQuery({ searchTerm: 'null' })
    ).resolves.toMatchObject({
      data: {
        items: [
          {
            description:
              'Gender: unknown. Birth year: unknown. Death year: unknown.',
            detailsId: 'null-crew-member',
            id: 'null-crew-member-0',
            name: 'Null Crew Member',
          },
        ],
      },
    });
  });

  it('uses a fallback id when uid is missing', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        characters: [
          {
            name: 'Unknown Crew Member',
          },
          {
            name: 'Unknown Crew Member',
          },
        ],
        page: { totalPages: 1 },
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      dispatchCharactersQuery({ searchTerm: 'unknown' })
    ).resolves.toMatchObject({
      data: {
        items: [
          {
            detailsId: 'Unknown Crew Member-0',
            id: 'Unknown Crew Member-0',
          },
          {
            detailsId: 'Unknown Crew Member-1',
            id: 'Unknown Crew Member-1',
          },
        ],
      },
    });
  });

  it('returns a readable error on non-ok list responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      dispatchCharactersQuery({ searchTerm: 'spock' })
    ).resolves.toMatchObject({
      error: { message: 'Request failed with status 503.' },
      isError: true,
    });
  });

  it('returns a readable error on unexpected list response formats', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        characters: null,
        page: { totalPages: 1 },
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      dispatchCharactersQuery({ searchTerm: 'spock' })
    ).resolves.toMatchObject({
      error: { message: 'Unexpected response format.' },
      isError: true,
    });
  });

  it('converts UI page number to zero-based API page number', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        characters: [],
        page: { totalPages: 4 },
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await dispatchCharactersQuery({ page: 3, searchTerm: '' });

    const [requestUrl] = fetchMock.mock.calls[0];

    expect(requestUrl.searchParams.get('pageNumber')).toBe('2');
  });

  it('fetches character details by uid', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        character: {
          gender: 'Male',
          name: 'Spock',
          uid: 'spock',
          yearOfBirth: 2230,
        },
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(dispatchCharacterDetailsQuery('spock')).resolves.toMatchObject({
      data: {
        birthYear: '2230',
        deathYear: 'unknown',
        description: 'Gender: Male. Birth year: 2230. Death year: unknown.',
        detailsId: 'spock',
        gender: 'Male',
        id: 'spock-0',
        name: 'Spock',
      },
      isSuccess: true,
    });

    const [requestUrl] = fetchMock.mock.calls[0];

    expect(requestUrl.searchParams.get('uid')).toBe('spock');
  });

  it('returns a readable error on unexpected details response formats', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        character: null,
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(dispatchCharacterDetailsQuery('spock')).resolves.toMatchObject({
      error: { message: 'Unexpected response format.' },
      isError: true,
    });
  });
});
