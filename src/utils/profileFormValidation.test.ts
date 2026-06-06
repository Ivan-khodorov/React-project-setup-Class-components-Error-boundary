import { describe, expect, it, vi } from 'vitest';
import { countries as expandedCountries } from '../data/countries';
import type { ProfileFormValues } from '../types';
import {
  createProfileFormSchema,
  createProfileSubmission,
  fileToBase64,
  getPasswordStrength,
  isStoredCountry,
  MAX_IMAGE_SIZE_BYTES,
  normalizeCountry,
  validateBasicEmail,
  validateImageFile,
} from './profileFormValidation';

const countries = ['Canada', 'United States'];

const createImage = (options?: {
  name?: string;
  size?: number;
  type?: string;
}): File => {
  const size = options?.size ?? 12;
  const content = new Uint8Array(size);

  return new File([content], options?.name ?? 'profile.png', {
    type: options?.type ?? 'image/png',
  });
};

const validValues = (image = createImage()): ProfileFormValues => ({
  age: '32',
  confirmPassword: 'Password1!',
  country: 'Canada',
  email: 'Jean@example.com',
  gender: 'female',
  image,
  name: 'Jean',
  password: 'Password1!',
  terms: true,
});

describe('profileFormValidation utilities', () => {
  it('validates basic email without regex behavior', () => {
    expect(validateBasicEmail('User@example.com')).toBe(true);
    expect(validateBasicEmail('missing-domain@')).toBe(false);
    expect(validateBasicEmail('@missing-local.com')).toBe(false);
    expect(validateBasicEmail('too@many@example.com')).toBe(false);
    expect(validateBasicEmail('missing-dot@example')).toBe(false);
  });

  it('reports password strength checks independently', () => {
    expect(getPasswordStrength('Password1!')).toEqual({
      hasLowercase: true,
      hasNumber: true,
      hasSpecialCharacter: true,
      hasUppercase: true,
    });
    expect(getPasswordStrength('password')).toEqual({
      hasLowercase: true,
      hasNumber: false,
      hasSpecialCharacter: false,
      hasUppercase: false,
    });
  });

  it('validates required image type, extension, and size', () => {
    expect(validateImageFile(null)).toBe('Image is required.');
    expect(validateImageFile(createImage())).toBeNull();
    expect(
      validateImageFile(createImage({ name: 'profile.gif', type: 'image/gif' }))
    ).toBe('Image must be a PNG or JPEG file.');
    expect(
      validateImageFile(
        createImage({
          size: MAX_IMAGE_SIZE_BYTES + 1,
        })
      )
    ).toBe('Image must be 1 MB or smaller.');
  });

  it('converts files to base64 data urls', async () => {
    await expect(fileToBase64(createImage())).resolves.toMatch(
      /^data:image\/png;base64,/
    );
  });

  it('normalizes and checks countries against stored countries', () => {
    expect(normalizeCountry(' Canada ')).toBe('Canada');
    expect(isStoredCountry(' Canada ', countries)).toBe(true);
    expect(isStoredCountry('France', countries)).toBe(false);
  });

  it('accepts valid shared schema values', () => {
    const result = createProfileFormSchema(countries).safeParse(validValues());

    expect(result.success).toBe(true);
  });

  it('accepts countries from the expanded shared countries source', () => {
    const result = createProfileFormSchema([...expandedCountries]).safeParse({
      ...validValues(),
      country: 'South Africa',
    });

    expect(result.success).toBe(true);
  });

  it('rejects countries that are not in the expanded shared countries source', () => {
    const result = createProfileFormSchema([...expandedCountries]).safeParse({
      ...validValues(),
      country: 'Atlantis',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid shared schema values', () => {
    const result = createProfileFormSchema(countries).safeParse({
      ...validValues(createImage({ name: 'profile.gif', type: 'image/gif' })),
      age: '-1',
      country: 'France',
      email: 'invalid',
      name: 'jean',
      terms: false,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);

      expect(messages).toContain('Age cannot be negative.');
      expect(messages).toContain('Enter a valid email address.');
      expect(messages).toContain('Name must start with an uppercase letter.');
      expect(messages).toContain('Choose a country from the list.');
      expect(messages).toContain('Terms and Conditions must be accepted.');
    }
  });

  it('rejects mismatched passwords', () => {
    const result = createProfileFormSchema(countries).safeParse({
      ...validValues(),
      confirmPassword: 'Mismatch1!',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        'Passwords must match.'
      );
    }
  });

  it('creates stored submissions without passwords', () => {
    const randomUUID = vi
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('00000000-0000-4000-8000-000000000000');
    const submission = createProfileSubmission({
      imageBase64: 'data:image/png;base64,image',
      imageName: 'profile.png',
      source: 'react-hook-form',
      values: validValues(),
    });

    expect(submission).toMatchObject({
      age: 32,
      country: 'Canada',
      email: 'Jean@example.com',
      gender: 'female',
      id: '00000000-0000-4000-8000-000000000000',
      imageBase64: 'data:image/png;base64,image',
      imageName: 'profile.png',
      name: 'Jean',
      source: 'react-hook-form',
    });
    expect('password' in submission).toBe(false);
    randomUUID.mockRestore();
  });
});
