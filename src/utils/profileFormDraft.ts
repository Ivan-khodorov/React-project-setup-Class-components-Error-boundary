import type {
  ProfileFormDraft,
  ProfileFormSource,
  ProfileFormValues,
  ProfileGender,
} from '../types';

const draftKeys: Record<ProfileFormSource, string> = {
  'react-hook-form': 'profile-form-draft-react-hook-form',
  uncontrolled: 'profile-form-draft-uncontrolled',
};

export const emptyProfileFormDraft: ProfileFormDraft = {
  age: '',
  country: '',
  email: '',
  gender: '',
  name: '',
  terms: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isProfileGender = (value: unknown): value is ProfileGender =>
  value === 'female' || value === 'male';

const readStringField = (
  draft: Record<string, unknown>,
  fieldName: keyof Omit<ProfileFormDraft, 'gender' | 'terms'>
) => {
  const value = draft[fieldName];

  return typeof value === 'string' ? value : '';
};

const normalizeDraft = (draft: unknown): ProfileFormDraft => {
  if (!isRecord(draft)) {
    return emptyProfileFormDraft;
  }

  return {
    age: readStringField(draft, 'age'),
    country: readStringField(draft, 'country'),
    email: readStringField(draft, 'email'),
    gender: isProfileGender(draft.gender) ? draft.gender : '',
    name: readStringField(draft, 'name'),
    terms: draft.terms === true,
  };
};

export const readProfileFormDraft = (
  source: ProfileFormSource
): ProfileFormDraft => {
  const storedDraft = window.localStorage.getItem(draftKeys[source]);

  if (!storedDraft) {
    return emptyProfileFormDraft;
  }

  try {
    return normalizeDraft(JSON.parse(storedDraft));
  } catch {
    return emptyProfileFormDraft;
  }
};

export const saveProfileFormDraft = (
  source: ProfileFormSource,
  draft: ProfileFormDraft
) => {
  window.localStorage.setItem(draftKeys[source], JSON.stringify(draft));
};

export const clearProfileFormDraft = (source: ProfileFormSource) => {
  window.localStorage.removeItem(draftKeys[source]);
};

export const createProfileFormDraftFromValues = (
  values: ProfileFormValues
): ProfileFormDraft => ({
  age: values.age,
  country: values.country,
  email: values.email,
  gender: values.gender,
  name: values.name,
  terms: values.terms,
});

const getStringValue = (formData: FormData, fieldName: string): string => {
  const value = formData.get(fieldName);

  return typeof value === 'string' ? value : '';
};

export const createProfileFormDraftFromForm = (
  form: HTMLFormElement,
  overrides: Partial<ProfileFormDraft> = {}
): ProfileFormDraft => {
  const formData = new FormData(form);
  const gender = getStringValue(formData, 'gender');

  return {
    age: getStringValue(formData, 'age'),
    country: getStringValue(formData, 'country'),
    email: getStringValue(formData, 'email'),
    gender: isProfileGender(gender) ? gender : '',
    name: getStringValue(formData, 'name'),
    terms: formData.get('terms') === 'on',
    ...overrides,
  };
};
