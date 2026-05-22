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
  gender?: string;
  yearOfBirth?: number;
  yearOfDeath?: number;
}

interface CharacterDetailsApiResponse {
  character: CharacterApiItem;
}

const formatValue = (value: string | number | undefined): string =>
  value === undefined || value === '' ? 'unknown' : String(value);

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

export interface CharactersResult {
  items: Item[];
  totalPages: number;
}

export const fetchCharacters = async (
  searchTerm: string,
  page = 1
): Promise<CharactersResult> => {
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

export const fetchCharacterDetails = async (
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
