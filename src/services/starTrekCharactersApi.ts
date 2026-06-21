import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  requestCharacterDetails,
  requestCharacters,
  type CharactersQueryArgs,
  type CharactersResult,
} from './starTrekCharacters';
import type { CharacterDetailsData } from '../types';

export const DEFAULT_API_CACHE_TTL_SECONDS = 300;

export interface StarTrekApiError {
  message: string;
}

export const getApiCacheTtlSeconds = (
  value = process.env.API_CACHE_TTL_SECONDS
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

export type { CharactersQueryArgs, CharactersResult };
