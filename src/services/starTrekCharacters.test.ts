import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  requestCharacterDetails,
  requestCharacters,
} from './starTrekCharacters';

describe('Star Trek character requests', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests and maps a page of characters', async () => {
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
      requestCharacters({ page: 2, searchTerm: '  spock  ' })
    ).resolves.toEqual({
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
    });

    const [requestUrl, requestInit] = fetchMock.mock.calls[0];

    expect(requestUrl.searchParams.get('pageNumber')).toBe('1');
    expect(requestUrl.searchParams.get('pageSize')).toBe('10');
    expect(requestInit.body.toString()).toBe('name=spock');
    expect(requestInit.method).toBe('POST');
  });

  it('uses localized generated labels without translating API values', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          characters: [
            {
              gender: 'Male',
              name: 'Spock',
              uid: 'spock',
            },
          ],
          page: { totalPages: 1 },
        }),
        ok: true,
      })
    );

    await expect(
      requestCharacters({
        descriptionLabels: {
          birthYear: 'Год рождения',
          deathYear: 'Год смерти',
          gender: 'Пол',
          unknown: 'неизвестно',
        },
        searchTerm: 'spock',
      })
    ).resolves.toMatchObject({
      items: [
        {
          description:
            'Пол: Male. Год рождения: неизвестно. Год смерти: неизвестно.',
          name: 'Spock',
        },
      ],
    });
  });

  it('fetches and maps character details without caching', async () => {
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

    await expect(requestCharacterDetails('spock')).resolves.toMatchObject({
      birthYear: '2230',
      deathYear: 'unknown',
      gender: 'Male',
      name: 'Spock',
    });

    const [requestUrl, requestInit] = fetchMock.mock.calls[0];

    expect(requestUrl.searchParams.get('uid')).toBe('spock');
    expect(requestInit).toEqual({ cache: 'no-store' });
  });

  it('rejects failed and malformed responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 503 })
        .mockResolvedValueOnce({
          json: vi.fn().mockResolvedValue({
            characters: null,
            page: { totalPages: 1 },
          }),
          ok: true,
        })
    );

    await expect(
      requestCharacters({ searchTerm: 'spock' })
    ).rejects.toThrow('Request failed with status 503.');
    await expect(
      requestCharacters({ searchTerm: 'spock' })
    ).rejects.toThrow('Unexpected response format.');
  });
});
