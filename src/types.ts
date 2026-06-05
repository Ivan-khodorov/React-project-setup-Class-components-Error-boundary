export interface Item {
  detailsId: string;
  id: string;
  name: string;
  description: string;
}

export interface SelectedItem extends Item {
  detailsUrl: string;
}

export interface CharacterDetailsData extends Item {
  gender: string;
  birthYear: string;
  deathYear: string;
}

export type ProfileFormSource = 'uncontrolled' | 'react-hook-form';

export type ProfileGender = 'female' | 'male' | 'other';

export interface PasswordStrength {
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialCharacter: boolean;
  hasUppercase: boolean;
}

export interface ProfileFormValues {
  age: string;
  confirmPassword: string;
  country: string;
  email: string;
  gender: ProfileGender | '';
  image: File | null;
  name: string;
  password: string;
  terms: boolean;
}

export interface ProfileSubmission {
  age: number;
  country: string;
  createdAt: string;
  email: string;
  gender: ProfileGender;
  id: string;
  imageBase64: string;
  imageName: string;
  name: string;
  source: ProfileFormSource;
}
