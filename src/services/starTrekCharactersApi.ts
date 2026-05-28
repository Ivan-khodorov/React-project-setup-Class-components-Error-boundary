import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { CharacterDetailsData, Item } from '../types';

const CHARACTERS_API_URL = 'https://stapi.co/api/v1/rest/character/search';
const CHARACTER_DETAILS_API_URL = 'https://stapi.co/api/v1/rest/character';
const PAGE_SIZE = '10';
export const DEFAULT_API_CACHE_TTL_SECONDS = 300;

interface CharactersApiResponse {
  characters: CharacterApiItem[];
  page: {
    totalPages: number;
  };
}

interface CharacterApiItem {
  uid: string;
  name: string;
  gender?: string | null;
  yearOfBirth?: number | null;
  yearOfDeath?: number | null;
}

interface CharacterDetailsApiResponse {
  character: CharacterApiItem;
}

export interface CharactersQueryArgs {
  searchTerm: string;
  page?: number;
}

export interface StarTrekApiError {
  message: string;
}

export interface CharactersResult {
  items: Item[];
  totalPages: number;
}

const formatValue = (value: string | number | null | undefined): string =>
  value === null || value === undefined || value === ''
    ? 'unknown'
    : String(value);

const toItem = (character: CharacterApiItem, index = 0): Item => {
  const fallbackId = `${character.name}-${index}`;
  const detailsId = character.uid || fallbackId;

  return {
    detailsId,
    id: character.uid ? `${character.uid}-${index}` : fallbackId,
    name: character.name,
    description: `Gender: ${formatValue(character.gender)}. Birth year: ${formatValue(character.yearOfBirth)}. Death year: ${formatValue(character.yearOfDeath)}.`,
  };
};

const toCharacterDetails = (
  character: CharacterApiItem
): CharacterDetailsData => ({
  ...toItem(character),
  birthYear: formatValue(character.yearOfBirth),
  deathYear: formatValue(character.yearOfDeath),
  gender: formatValue(character.gender),
});

export const getApiCacheTtlSeconds = (
  value = import.meta.env.VITE_API_CACHE_TTL_SECONDS
): number => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : DEFAULT_API_CACHE_TTL_SECONDS;
};

export const getCharactersListCacheId = ({
  page = 1,
  searchTerm,
}: CharactersQueryArgs): string => `${searchTerm.trim()}::${Math.max(page, 1)}`;

const toApiError = (error: unknown, fallbackMessage: string): StarTrekApiError =>
  error instanceof Error
    ? { message: error.message }
    : { message: fallbackMessage };

const requestCharacters = async ({
  page = 1,
  searchTerm,
}: CharactersQueryArgs): Promise<CharactersResult> => {
  const url = new URL(CHARACTERS_API_URL);
  const trimmedSearchTerm = searchTerm.trim();
  const apiPage = Math.max(page, 1) - 1;

  url.searchParams.set('pageNumber', String(apiPage));
  url.searchParams.set('pageSize', PAGE_SIZE);

  const body = new URLSearchParams();

  if (trimmedSearchTerm) {
    body.set('name', trimmedSearchTerm);
  }

  const response = await fetch(url, {
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as CharactersApiResponse;

  if (
    !Array.isArray(data.characters) ||
    typeof data.page?.totalPages !== 'number'
  ) {
    throw new Error('Unexpected response format.');
  }

  return {
    items: data.characters.map(toItem),
    totalPages: data.page.totalPages,
  };
};

const requestCharacterDetails = async (
  characterId: string
): Promise<CharacterDetailsData> => {
  const url = new URL(CHARACTER_DETAILS_API_URL);
  url.searchParams.set('uid', characterId);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as CharacterDetailsApiResponse;

  if (!data.character?.uid || !data.character.name) {
    throw new Error('Unexpected response format.');
  }

  return toCharacterDetails(data.character);
};

export const fetchCharacters = (searchTerm: string, page = 1) =>
  requestCharacters({ page, searchTerm });

export const starTrekCharactersApi = createApi({
  baseQuery: fakeBaseQuery<StarTrekApiError>(),
  endpoints: (build) => ({
    getCharacterDetails: build.query<CharacterDetailsData, string>({
      keepUnusedDataFor: getApiCacheTtlSeconds(),
      providesTags: (_result, _error, characterId) => [
        { type: 'CharacterDetails', id: characterId },
      ],
      queryFn: async (characterId) => {
        try {
          return { data: await requestCharacterDetails(characterId) };
        } catch (error) {
          return {
            error: toApiError(error, 'Failed to load character details.'),
          };
        }
      },
    }),
    getCharacters: build.query<CharactersResult, CharactersQueryArgs>({
      keepUnusedDataFor: getApiCacheTtlSeconds(),
      providesTags: (_result, _error, args) => [
        { type: 'CharactersList', id: getCharactersListCacheId(args) },
      ],
      queryFn: async (args) => {
        try {
          return { data: await requestCharacters(args) };
        } catch (error) {
          return { error: toApiError(error, 'Failed to load results.') };
        }
      },
    }),
  }),
  reducerPath: 'starTrekCharactersApi',
  tagTypes: ['CharactersList', 'CharacterDetails'],
});

export const {
  useGetCharacterDetailsQuery,
  useGetCharactersQuery,
} = starTrekCharactersApi;
