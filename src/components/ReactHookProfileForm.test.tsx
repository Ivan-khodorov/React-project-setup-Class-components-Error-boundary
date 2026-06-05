import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { profileFormsReducer } from '../store/profileFormsSlice';
import { selectedItemsReducer } from '../store/selectedItemsSlice';
import { ReactHookProfileForm } from './ReactHookProfileForm';

const createImage = (options?: { name?: string; type?: string }) =>
  new File(['profile image'], options?.name ?? 'profile.png', {
    type: options?.type ?? 'image/png',
  });

const createTestStore = () =>
  configureStore({
    reducer: {
      profileForms: profileFormsReducer,
      selectedItems: selectedItemsReducer,
    },
  });

const renderForm = (onSuccess = vi.fn()) => {
  const store = createTestStore();

  render(
    <Provider store={store}>
      <ReactHookProfileForm onSuccess={onSuccess} />
    </Provider>
  );

  return { onSuccess, store };
};

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Jean' },
  });
  fireEvent.change(screen.getByLabelText('Age'), {
    target: { value: '32' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'Jean@example.com' },
  });
  fireEvent.click(screen.getByLabelText('Other'));
  fireEvent.change(screen.getByLabelText('Profile image'), {
    target: { files: [createImage()] },
  });
  fireEvent.change(screen.getByLabelText('Country'), {
    target: { value: 'Canada' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'Password1!' },
  });
  fireEvent.change(screen.getByLabelText('Confirm password'), {
    target: { value: 'Password1!' },
  });
  fireEvent.click(screen.getByLabelText('Accept Terms and Conditions'));
};

describe('ReactHookProfileForm', () => {
  it('renders all required fields with accessible labels', () => {
    renderForm();

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Female')).toBeInTheDocument();
    expect(screen.getByLabelText('Male')).toBeInTheDocument();
    expect(screen.getByLabelText('Other')).toBeInTheDocument();
    expect(screen.getByLabelText('Profile image')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Accept Terms and Conditions')
    ).toBeInTheDocument();
  });

  it('disables submit while live validation has errors', async () => {
    renderForm();

    const submitButton = screen.getByRole('button', {
      name: 'Submit React Hook Form',
    });

    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'jean' },
    });

    expect(
      await screen.findByText('Name must start with an uppercase letter.')
    ).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('shows live validation errors for invalid values', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'jean' },
    });
    fireEvent.change(screen.getByLabelText('Age'), {
      target: { value: '-1' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'invalid' },
    });
    fireEvent.change(screen.getByLabelText('Profile image'), {
      target: { files: [createImage({ name: 'profile.gif', type: 'image/gif' })] },
    });
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'Francee' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password1!' },
    });

    expect(
      await screen.findByText('Name must start with an uppercase letter.')
    ).toBeInTheDocument();
    expect(screen.getByText('Age cannot be negative.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(
      screen.getByText('Image must be a PNG or JPEG file up to 1 MB.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Choose a country from the list.')
    ).toBeInTheDocument();
  });

  it('shows a live validation error for mismatched passwords', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Jean' },
    });
    fireEvent.change(screen.getByLabelText('Age'), {
      target: { value: '32' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'Jean@example.com' },
    });
    fireEvent.click(screen.getByLabelText('Other'));
    fireEvent.change(screen.getByLabelText('Profile image'), {
      target: { files: [createImage()] },
    });
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'Canada' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password1!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'Mismatch1!' },
    });
    fireEvent.click(screen.getByLabelText('Accept Terms and Conditions'));

    expect(await screen.findByText('Passwords must match.')).toBeInTheDocument();
  });

  it('updates password strength from the watched password value', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password1!' },
    });

    await waitFor(() =>
      expect(screen.getByText('1 number')).toHaveClass(
        'password-strength__item--met'
      )
    );
    expect(screen.getByText('1 uppercase')).toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 lowercase')).toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 special character')).toHaveClass(
      'password-strength__item--met'
    );
  });

  it('submits valid data to Redux, resets the form, and closes through onSuccess', async () => {
    const { onSuccess, store } = renderForm();
    const submitButton = screen.getByRole('button', {
      name: 'Submit React Hook Form',
    });

    fillValidForm();

    await waitFor(() => expect(submitButton).toBeEnabled());
    fireEvent.click(submitButton);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    const [submission] = store.getState().profileForms.submissions;

    expect(submission).toMatchObject({
      age: 32,
      country: 'Canada',
      email: 'Jean@example.com',
      gender: 'other',
      imageName: 'profile.png',
      name: 'Jean',
      source: 'react-hook-form',
    });
    expect(submission.imageBase64).toMatch(/^data:image\/png;base64,/);
    expect(store.getState().profileForms.latestSubmissionId).toBe(
      submission.id
    );
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });
});
