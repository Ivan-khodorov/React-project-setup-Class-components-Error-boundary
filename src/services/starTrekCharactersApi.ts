import type { Item } from '../types';

const CHARACTERS_API_URL = 'https://stapi.co/api/v1/rest/character/search';
const FIRST_PAGE = '0';
const PAGE_SIZE = '10';

interface CharactersApiResponse {
  characters: CharacterApiItem[];
}

interface CharacterApiItem {
  uid: string;
  name: string;
  gender?: string;
  yearOfBirth?: number;
  yearOfDeath?: number;
}

const formatValue = (value: string | number | undefined): string =>
  value === undefined || value === '' ? 'unknown' : String(value);

const toItem = (character: CharacterApiItem): Item => ({
  id: character.uid,
  name: character.name,
  description: `Gender: ${formatValue(character.gender)}. Birth year: ${formatValue(character.yearOfBirth)}. Death year: ${formatValue(character.yearOfDeath)}.`,
});

export const fetchCharacters = async (searchTerm: string): Promise<Item[]> => {
  const url = new URL(CHARACTERS_API_URL);
  const trimmedSearchTerm = searchTerm.trim();

  url.searchParams.set('pageNumber', FIRST_PAGE);
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

  if (!Array.isArray(data.characters)) {
    throw new Error('Unexpected response format.');
  }

  return data.characters.map(toItem);
};
