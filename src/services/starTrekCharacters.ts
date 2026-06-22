import type { CharacterDetailsData, Item } from '../types';

const CHARACTERS_API_URL = 'https://stapi.co/api/v1/rest/character/search';
const CHARACTER_DETAILS_API_URL = 'https://stapi.co/api/v1/rest/character';
const PAGE_SIZE = '10';

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
  descriptionLabels?: CharacterValueLabels;
  searchTerm: string;
  page?: number;
}

export interface CharacterValueLabels {
  birthYear: string;
  deathYear: string;
  gender: string;
  unknown: string;
}

export interface CharactersResult {
  items: Item[];
  totalPages: number;
}

const defaultValueLabels: CharacterValueLabels = {
  birthYear: 'Birth year',
  deathYear: 'Death year',
  gender: 'Gender',
  unknown: 'unknown',
};

const formatValue = (
  value: string | number | null | undefined,
  unknownLabel = defaultValueLabels.unknown
): string =>
  value === null || value === undefined || value === ''
    ? unknownLabel
    : String(value);

const toItem = (
  character: CharacterApiItem,
  index = 0,
  labels = defaultValueLabels
): Item => {
  const fallbackId = `${character.name}-${index}`;
  const detailsId = character.uid || fallbackId;

  return {
    detailsId,
    id: character.uid ? `${character.uid}-${index}` : fallbackId,
    name: character.name,
    description: `${labels.gender}: ${formatValue(character.gender, labels.unknown)}. ${labels.birthYear}: ${formatValue(character.yearOfBirth, labels.unknown)}. ${labels.deathYear}: ${formatValue(character.yearOfDeath, labels.unknown)}.`,
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

export const requestCharacters = async ({
  descriptionLabels = defaultValueLabels,
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

  const data: unknown = await response.json();

  if (!isCharactersApiResponse(data)) {
    throw new Error('Unexpected response format.');
  }

  return {
    items: data.characters.map((character, index) =>
      toItem(character, index, descriptionLabels)
    ),
    totalPages: data.page.totalPages,
  };
};

export const requestCharacterDetails = async (
  characterId: string
): Promise<CharacterDetailsData> => {
  const url = new URL(CHARACTER_DETAILS_API_URL);
  url.searchParams.set('uid', characterId);

  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  const data: unknown = await response.json();

  if (!isCharacterDetailsApiResponse(data)) {
    throw new Error('Unexpected response format.');
  }

  return toCharacterDetails(data.character);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCharactersApiResponse = (
  value: unknown
): value is CharactersApiResponse => {
  if (!isRecord(value) || !Array.isArray(value.characters)) {
    return false;
  }

  return isRecord(value.page) && typeof value.page.totalPages === 'number';
};

const isCharacterDetailsApiResponse = (
  value: unknown
): value is CharacterDetailsApiResponse => {
  if (!isRecord(value) || !isRecord(value.character)) {
    return false;
  }

  return (
    typeof value.character.uid === 'string' &&
    Boolean(value.character.uid) &&
    typeof value.character.name === 'string' &&
    Boolean(value.character.name)
  );
};
