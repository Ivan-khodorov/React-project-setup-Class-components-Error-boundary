export interface Item {
  id: string;
  name: string;
  description: string;
}

export interface CharacterDetailsData extends Item {
  gender: string;
  birthYear: string;
  deathYear: string;
}
