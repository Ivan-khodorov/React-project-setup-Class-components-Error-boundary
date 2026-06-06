import { useId, useRef, useState } from 'react';
import type {
  PasswordStrength,
  ProfileFormDraft,
  ProfileFormValues,
  ProfileGender,
} from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addSubmission,
  selectCountries,
} from '../store/profileFormsSlice';
import {
  createProfileFormSchema,
  createProfileSubmission,
  fileToBase64,
  getPasswordStrength,
} from '../utils/profileFormValidation';
import {
  clearProfileFormDraft,
  createProfileFormDraftFromForm,
  readProfileFormDraft,
  saveProfileFormDraft,
} from '../utils/profileFormDraft';
import { CountryAutocomplete } from './CountryAutocomplete';

type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>;

interface UncontrolledProfileFormProps {
  onSuccess: () => void;
}

const emptyPasswordStrength: PasswordStrength = {
  hasLowercase: false,
  hasNumber: false,
  hasSpecialCharacter: false,
  hasUppercase: false,
};

const passwordStrengthItems: Array<{
  key: keyof PasswordStrength;
  label: string;
}> = [
  { key: 'hasNumber', label: '1 number' },
  { key: 'hasUppercase', label: '1 uppercase' },
  { key: 'hasLowercase', label: '1 lowercase' },
  { key: 'hasSpecialCharacter', label: '1 special character' },
];

const getStringValue = (formData: FormData, fieldName: string): string => {
  const value = formData.get(fieldName);

  return typeof value === 'string' ? value : '';
};

const getImageValue = (form: HTMLFormElement): File | null => {
  const element = form.elements.namedItem('image');

  if (element instanceof HTMLInputElement && element.files?.[0]) {
    return element.files[0];
  }

  return null;
};

const createValuesFromForm = (form: HTMLFormElement): ProfileFormValues => {
  const formData = new FormData(form);

  return {
    age: getStringValue(formData, 'age'),
    confirmPassword: getStringValue(formData, 'confirmPassword'),
    country: getStringValue(formData, 'country'),
    email: getStringValue(formData, 'email'),
    gender: getStringValue(formData, 'gender') as ProfileGender | '',
    image: getImageValue(form),
    name: getStringValue(formData, 'name'),
    password: getStringValue(formData, 'password'),
    terms: formData.get('terms') === 'on',
  };
};

const createErrorsFromIssues = (
  issues: Array<{ message: string; path: PropertyKey[] }>
): ProfileFormErrors =>
  issues.reduce<ProfileFormErrors>((errors, issue) => {
    const [fieldName] = issue.path;

    if (typeof fieldName === 'string' && !(fieldName in errors)) {
      return {
        ...errors,
        [fieldName]: issue.message,
      };
    }

    return errors;
  }, {});

export function UncontrolledProfileForm({
  onSuccess,
}: UncontrolledProfileFormProps) {
  const countries = useAppSelector(selectCountries);
  const dispatch = useAppDispatch();
  const femaleGenderRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const maleGenderRef = useRef<HTMLInputElement>(null);
  const formId = useId();
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(
    emptyPasswordStrength
  );
  const draft = readProfileFormDraft('uncontrolled');

  const getFieldId = (fieldName: string) => `${formId}-${fieldName}`;
  const schema = createProfileFormSchema(countries);

  const handleGenderKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    direction: 'female-to-male' | 'male-to-female'
  ) => {
    if (event.key !== 'Tab') {
      return;
    }

    if (direction === 'female-to-male' && !event.shiftKey) {
      event.preventDefault();
      maleGenderRef.current?.focus();
      return;
    }

    if (direction === 'male-to-female' && event.shiftKey) {
      event.preventDefault();
      femaleGenderRef.current?.focus();
    }
  };

  const saveDraftFromForm = (
    form: HTMLFormElement,
    overrides?: Partial<ProfileFormDraft>
  ) => {
    saveProfileFormDraft(
      'uncontrolled',
      createProfileFormDraftFromForm(form, overrides)
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const values = createValuesFromForm(event.currentTarget);
    const result = schema.safeParse(values);

    if (!result.success) {
      setErrors(createErrorsFromIssues(result.error.issues));
      return;
    }

    const imageBase64 = await fileToBase64(result.data.image);

    dispatch(
      addSubmission(
        createProfileSubmission({
          imageBase64,
          imageName: result.data.image.name,
          source: 'uncontrolled',
          values,
        })
      )
    );
    setErrors({});
    setPasswordStrength(emptyPasswordStrength);
    clearProfileFormDraft('uncontrolled');
    formRef.current?.reset();
    onSuccess();
  };

  return (
    <form
      className="profile-form"
      noValidate
      ref={formRef}
      onChange={(event) => saveDraftFromForm(event.currentTarget)}
      onSubmit={handleSubmit}
    >
      <div className="profile-form__grid">
        <div className="profile-form__field">
          <label htmlFor={getFieldId('name')}>Name</label>
          <input
            defaultValue={draft.name}
            id={getFieldId('name')}
            name="name"
            type="text"
          />
          <p className="profile-form__error">{errors.name}</p>
        </div>

        <div className="profile-form__field">
          <label htmlFor={getFieldId('age')}>Age</label>
          <input
            defaultValue={draft.age}
            id={getFieldId('age')}
            name="age"
            type="number"
          />
          <p className="profile-form__error">{errors.age}</p>
        </div>

        <div className="profile-form__field">
          <label htmlFor={getFieldId('email')}>Email</label>
          <input
            defaultValue={draft.email}
            id={getFieldId('email')}
            name="email"
            type="email"
          />
          <p className="profile-form__error">{errors.email}</p>
        </div>

        <fieldset className="profile-form__field profile-form__radio-group">
          <legend>Gender</legend>
          <label htmlFor={getFieldId('gender-female')}>
            <input
              defaultChecked={draft.gender === 'female'}
              id={getFieldId('gender-female')}
              name="gender"
              ref={femaleGenderRef}
              tabIndex={0}
              type="radio"
              value="female"
              onKeyDown={(event) =>
                handleGenderKeyDown(event, 'female-to-male')
              }
            />
            Female
          </label>
          <label htmlFor={getFieldId('gender-male')}>
            <input
              defaultChecked={draft.gender === 'male'}
              id={getFieldId('gender-male')}
              name="gender"
              ref={maleGenderRef}
              tabIndex={0}
              type="radio"
              value="male"
              onKeyDown={(event) =>
                handleGenderKeyDown(event, 'male-to-female')
              }
            />
            Male
          </label>
          <p className="profile-form__error">{errors.gender}</p>
        </fieldset>

        <div className="profile-form__field">
          <label htmlFor={getFieldId('image')}>Profile image</label>
          <input
            accept="image/png,image/jpeg"
            id={getFieldId('image')}
            name="image"
            type="file"
          />
          <p className="profile-form__error">{errors.image}</p>
        </div>

        <div className="profile-form__field">
          <label htmlFor={getFieldId('country')}>Country</label>
          <CountryAutocomplete
            countries={countries}
            defaultValue={draft.country}
            id={getFieldId('country')}
            name="country"
            onValueChange={(country) => {
              if (formRef.current) {
                saveDraftFromForm(formRef.current, { country });
              }
            }}
          />
          <p className="profile-form__error">{errors.country}</p>
        </div>

        <div className="profile-form__field profile-form__password-field">
          <label htmlFor={getFieldId('password')}>Password</label>
          <input
            id={getFieldId('password')}
            name="password"
            type="password"
            onChange={(event) =>
              setPasswordStrength(getPasswordStrength(event.currentTarget.value))
            }
          />
          <ul className="password-strength" aria-label="Password strength">
            {passwordStrengthItems.map((item) => (
              <li
                className={
                  passwordStrength[item.key]
                    ? 'password-strength__item password-strength__item--met'
                    : 'password-strength__item'
                }
                key={item.key}
              >
                {item.label}
              </li>
            ))}
          </ul>
          <p className="profile-form__error">{errors.password}</p>
        </div>

        <div className="profile-form__field profile-form__confirm-password-field">
          <label htmlFor={getFieldId('confirmPassword')}>
            Confirm password
          </label>
          <input
            id={getFieldId('confirmPassword')}
            name="confirmPassword"
            type="password"
          />
          <p className="profile-form__error">{errors.confirmPassword}</p>
        </div>
      </div>

      <div className="profile-form__field profile-form__terms">
        <label htmlFor={getFieldId('terms')}>
          <input
            defaultChecked={draft.terms}
            id={getFieldId('terms')}
            name="terms"
            type="checkbox"
          />
          Accept Terms and Conditions
        </label>
        <p className="profile-form__error">{errors.terms}</p>
      </div>

      <button className="profile-form__submit" type="submit">
        Submit uncontrolled form
      </button>
    </form>
  );
}
