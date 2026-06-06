import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId, useMemo, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { PasswordStrength, ProfileFormValues } from '../types';
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
  createProfileFormDraftFromValues,
  readProfileFormDraft,
  saveProfileFormDraft,
} from '../utils/profileFormDraft';
import { CountryAutocomplete } from './CountryAutocomplete';

interface ReactHookProfileFormProps {
  onSuccess: () => void;
}

const passwordStrengthItems: Array<{
  key: keyof PasswordStrength;
  label: string;
}> = [
  { key: 'hasNumber', label: '1 number' },
  { key: 'hasUppercase', label: '1 uppercase' },
  { key: 'hasLowercase', label: '1 lowercase' },
  { key: 'hasSpecialCharacter', label: '1 special character' },
];

const defaultValues: ProfileFormValues = {
  age: '',
  confirmPassword: '',
  country: '',
  email: '',
  gender: '',
  image: null,
  name: '',
  password: '',
  terms: false,
};

const createDefaultValues = (): ProfileFormValues => ({
  ...defaultValues,
  ...readProfileFormDraft('react-hook-form'),
});

export function ReactHookProfileForm({ onSuccess }: ReactHookProfileFormProps) {
  const countries = useAppSelector(selectCountries);
  const dispatch = useAppDispatch();
  const femaleGenderRef = useRef<HTMLInputElement>(null);
  const formId = useId();
  const maleGenderRef = useRef<HTMLInputElement>(null);
  const initialValues = useMemo(() => createDefaultValues(), []);
  const {
    formState: { errors },
    handleSubmit,
    control,
    reset,
    setValue,
    trigger,
    register,
  } = useForm<ProfileFormValues>({
    defaultValues: initialValues,
    mode: 'onChange',
    resolver: zodResolver(createProfileFormSchema(countries)),
  });
  const watchedValues = useWatch({ control });
  const femaleGenderRegistration = register('gender');
  const maleGenderRegistration = register('gender');
  const passwordStrength = getPasswordStrength(watchedValues.password ?? '');
  const hasRequiredValues =
    Boolean(watchedValues.name?.trim()) &&
    Boolean(watchedValues.age?.trim()) &&
    Boolean(watchedValues.email?.trim()) &&
    Boolean(watchedValues.gender) &&
    watchedValues.image instanceof File &&
    Boolean(watchedValues.country?.trim()) &&
    Boolean(watchedValues.password) &&
    Boolean(watchedValues.confirmPassword) &&
    watchedValues.terms === true;
  const hasValidationErrors = Object.keys(errors).length > 0;
  const getFieldId = (fieldName: string) => `${formId}-${fieldName}`;

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

  useEffect(() => {
    saveProfileFormDraft(
      'react-hook-form',
      createProfileFormDraftFromValues({
        ...defaultValues,
        ...watchedValues,
      })
    );
  }, [watchedValues]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!values.image) {
      return;
    }

    const imageBase64 = await fileToBase64(values.image);

    dispatch(
      addSubmission(
        createProfileSubmission({
          imageBase64,
          imageName: values.image.name,
          source: 'react-hook-form',
          values,
        })
      )
    );
    reset(defaultValues);
    clearProfileFormDraft('react-hook-form');
    onSuccess();
  };

  return (
    <form
      className="profile-form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="profile-form__grid">
        <div className="profile-form__field">
          <label htmlFor={getFieldId('name')}>Name</label>
          <input id={getFieldId('name')} type="text" {...register('name')} />
          <p className="profile-form__error">{errors.name?.message}</p>
        </div>

        <div className="profile-form__field">
          <label htmlFor={getFieldId('age')}>Age</label>
          <input id={getFieldId('age')} type="number" {...register('age')} />
          <p className="profile-form__error">{errors.age?.message}</p>
        </div>

        <div className="profile-form__field">
          <label htmlFor={getFieldId('email')}>Email</label>
          <input id={getFieldId('email')} type="email" {...register('email')} />
          <p className="profile-form__error">{errors.email?.message}</p>
        </div>

        <fieldset className="profile-form__field profile-form__radio-group">
          <legend>Gender</legend>
          <label htmlFor={getFieldId('gender-female')}>
            <input
              id={getFieldId('gender-female')}
              name={femaleGenderRegistration.name}
              ref={(element) => {
                femaleGenderRegistration.ref(element);
                femaleGenderRef.current = element;
              }}
              tabIndex={0}
              type="radio"
              value="female"
              onBlur={femaleGenderRegistration.onBlur}
              onChange={femaleGenderRegistration.onChange}
              onKeyDown={(event) =>
                handleGenderKeyDown(event, 'female-to-male')
              }
            />
            Female
          </label>
          <label htmlFor={getFieldId('gender-male')}>
            <input
              id={getFieldId('gender-male')}
              name={maleGenderRegistration.name}
              ref={(element) => {
                maleGenderRegistration.ref(element);
                maleGenderRef.current = element;
              }}
              tabIndex={0}
              type="radio"
              value="male"
              onBlur={maleGenderRegistration.onBlur}
              onChange={maleGenderRegistration.onChange}
              onKeyDown={(event) =>
                handleGenderKeyDown(event, 'male-to-female')
              }
            />
            Male
          </label>
          <p className="profile-form__error">{errors.gender?.message}</p>
        </fieldset>

        <div className="profile-form__field">
          <label htmlFor={getFieldId('image')}>Profile image</label>
          <input
            accept="image/png,image/jpeg"
            id={getFieldId('image')}
            name="image"
            type="file"
            onBlur={() => {
              void trigger('image');
            }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setValue('image', event.currentTarget.files?.[0] ?? null, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
          />
          <p className="profile-form__error">{errors.image?.message}</p>
        </div>

        <div className="profile-form__field">
          <label htmlFor={getFieldId('country')}>Country</label>
          <CountryAutocomplete
            countries={countries}
            id={getFieldId('country')}
            value={watchedValues.country ?? ''}
            onBlur={() => {
              void trigger('country');
            }}
            onValueChange={(country) => {
              setValue('country', country, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
          />
          <p className="profile-form__error">{errors.country?.message}</p>
        </div>

        <div className="profile-form__field profile-form__password-field">
          <label htmlFor={getFieldId('password')}>Password</label>
          <input
            id={getFieldId('password')}
            type="password"
            {...register('password')}
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
          <p className="profile-form__error">{errors.password?.message}</p>
        </div>

        <div className="profile-form__field profile-form__confirm-password-field">
          <label htmlFor={getFieldId('confirmPassword')}>
            Confirm password
          </label>
          <input
            id={getFieldId('confirmPassword')}
            type="password"
            {...register('confirmPassword')}
          />
          <p className="profile-form__error">
            {errors.confirmPassword?.message}
          </p>
        </div>
      </div>

      <div className="profile-form__field profile-form__terms">
        <label htmlFor={getFieldId('terms')}>
          <input id={getFieldId('terms')} type="checkbox" {...register('terms')} />
          Accept Terms and Conditions
        </label>
        <p className="profile-form__error">{errors.terms?.message}</p>
      </div>

      <button
        className="profile-form__submit"
        disabled={!hasRequiredValues || hasValidationErrors}
        type="submit"
      >
        Submit React Hook Form
      </button>
    </form>
  );
}
