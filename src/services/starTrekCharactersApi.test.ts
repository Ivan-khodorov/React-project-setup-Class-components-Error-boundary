import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchCharacters } from './starTrekCharactersApi';

describe('fetchCharacters', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a POST request with default pagination', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ characters: [] }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await fetchCharacters('');

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
      json: vi.fn().mockResolvedValue({ characters: [] }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await fetchCharacters('  spock  ');

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
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCharacters('spock')).resolves.toEqual([
      {
        description:
          'Gender: Male. Birth year: 2230. Death year: unknown.',
        id: 'spock',
        name: 'Spock',
      },
    ]);
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
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCharacters('unknown')).resolves.toEqual([
      {
        description:
          'Gender: unknown. Birth year: unknown. Death year: unknown.',
        id: 'unknown-crew-member',
        name: 'Unknown Crew Member',
      },
    ]);
  });

  it('throws on non-ok responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCharacters('spock')).rejects.toThrow(
      'Request failed with status 503.'
    );
  });

  it('throws on unexpected response formats', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        characters: null,
      }),
      ok: true,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCharacters('spock')).rejects.toThrow(
      'Unexpected response format.'
    );
  });
});
