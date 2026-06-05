import { z } from 'zod';
import type {
  PasswordStrength,
  ProfileFormSource,
  ProfileFormValues,
  ProfileSubmission,
} from '../types';

export const MAX_IMAGE_SIZE_BYTES = 1024 * 1024;

const allowedImageTypes = new Set(['image/jpeg', 'image/png']);
const allowedImageExtensions = ['.jpeg', '.jpg', '.png'];

export const validateBasicEmail = (email: string): boolean => {
  const parts = email.split('@');

  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  return localPart.length > 0 && domain.includes('.') && domain.length > 2;
};

export const getPasswordStrength = (password: string): PasswordStrength => ({
  hasLowercase: password.split('').some((character) => {
    const lower = character.toLowerCase();
    return lower !== character.toUpperCase() && character === lower;
  }),
  hasNumber: password.split('').some((character) => !Number.isNaN(Number(character)) && character.trim() !== ''),
  hasSpecialCharacter: password
    .split('')
    .some((character) => !/[A-Za-z0-9]/.test(character)),
  hasUppercase: password.split('').some((character) => {
    const upper = character.toUpperCase();
    return upper !== character.toLowerCase() && character === upper;
  }),
});

const hasAllowedImageExtension = (fileName: string): boolean => {
  const normalizedFileName = fileName.toLowerCase();
  return allowedImageExtensions.some((extension) =>
    normalizedFileName.endsWith(extension)
  );
};

export const validateImageFile = (file: File | null): string | null => {
  if (!file) {
    return 'Image is required.';
  }

  if (!allowedImageTypes.has(file.type) || !hasAllowedImageExtension(file.name)) {
    return 'Image must be a PNG or JPEG file.';
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be 1 MB or smaller.';
  }

  return null;
};

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to convert image to base64.'));
    });

    reader.addEventListener('error', () => {
      reject(new Error('Failed to read image file.'));
    });

    reader.readAsDataURL(file);
  });

export const normalizeCountry = (country: string): string => country.trim();

export const isStoredCountry = (country: string, countries: string[]): boolean =>
  countries.includes(normalizeCountry(country));

const isFile = (value: unknown): value is File =>
  typeof File !== 'undefined' && value instanceof File;

export const createProfileFormSchema = (countries: string[]) =>
  z
    .object({
      age: z
        .string()
        .trim()
        .min(1, 'Age is required.')
        .refine((age) => !Number.isNaN(Number(age)), 'Age must be a number.')
        .refine((age) => Number(age) >= 0, 'Age cannot be negative.'),
      confirmPassword: z.string().min(1, 'Confirm password is required.'),
      country: z
        .string()
        .trim()
        .min(1, 'Country is required.')
        .refine(
          (country) => isStoredCountry(country, countries),
          'Choose a country from the list.'
        ),
      email: z
        .string()
        .trim()
        .min(1, 'Email is required.')
        .refine(validateBasicEmail, 'Enter a valid email address.'),
      gender: z
        .union([z.enum(['female', 'male', 'other']), z.literal('')])
        .refine((gender) => gender !== '', 'Gender is required.'),
      image: z
        .custom<File | null>(
          (value) => value === null || isFile(value),
          'Image is required.'
        )
        .refine((file) => file !== null, 'Image is required.')
        .refine((file) => file === null || validateImageFile(file) === null, {
          message: 'Image must be a PNG or JPEG file up to 1 MB.',
        }),
      name: z
        .string()
        .trim()
        .min(1, 'Name is required.')
        .refine(
          (name) => name[0] === name[0]?.toUpperCase(),
          'Name must start with an uppercase letter.'
        ),
      password: z.string().min(1, 'Password is required.'),
      terms: z
        .boolean()
        .refine(Boolean, 'Terms and Conditions must be accepted.'),
    })
    .superRefine((values, context) => {
      if (values.password !== values.confirmPassword) {
        context.addIssue({
          code: 'custom',
          message: 'Passwords must match.',
          path: ['confirmPassword'],
        });
      }
    });

export const createProfileSubmission = (params: {
  imageBase64: string;
  imageName: string;
  source: ProfileFormSource;
  values: ProfileFormValues;
}): ProfileSubmission => ({
  age: Number(params.values.age),
  country: normalizeCountry(params.values.country),
  createdAt: new Date().toISOString(),
  email: params.values.email.trim(),
  gender: params.values.gender || 'other',
  id: crypto.randomUUID(),
  imageBase64: params.imageBase64,
  imageName: params.imageName,
  name: params.values.name.trim(),
  source: params.source,
});
