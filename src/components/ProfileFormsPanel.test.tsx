import { configureStore } from '@reduxjs/toolkit';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi, afterEach } from 'vitest';
import type { ProfileSubmission } from '../types';
import { profileFormsReducer } from '../store/profileFormsSlice';
import { selectedItemsReducer } from '../store/selectedItemsSlice';
import { ProfileFormsPanel } from './ProfileFormsPanel';

const createImage = (options?: { name?: string; type?: string }) =>
  new File(['profile image'], options?.name ?? 'profile.png', {
    type: options?.type ?? 'image/png',
  });

const createTestStore = (preloadedProfileForms?: {
  countries: string[];
  latestSubmissionId: string | null;
  submissions: ProfileSubmission[];
}) =>
  configureStore({
    preloadedState: preloadedProfileForms
      ? {
          profileForms: preloadedProfileForms,
        }
      : undefined,
    reducer: {
      profileForms: profileFormsReducer,
      selectedItems: selectedItemsReducer,
    },
  });

const renderPanel = (
  preloadedProfileForms?: Parameters<typeof createTestStore>[0]
) => {
  const store = createTestStore(preloadedProfileForms);

  render(
    <Provider store={store}>
      <ProfileFormsPanel />
    </Provider>
  );

  return store;
};

const fillValidForm = (options?: { country?: string; name?: string }) => {
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: options?.name ?? 'Jean' },
  });
  fireEvent.change(screen.getByLabelText('Age'), {
    target: { value: '32' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'Jean@example.com' },
  });
  fireEvent.click(screen.getByLabelText('Female'));
  fireEvent.change(screen.getByLabelText('Profile image'), {
    target: { files: [createImage()] },
  });
  fireEvent.change(screen.getByLabelText('Country'), {
    target: { value: options?.country ?? 'Canada' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'Password1!' },
  });
  fireEvent.change(screen.getByLabelText('Confirm password'), {
    target: { value: 'Password1!' },
  });
  fireEvent.click(screen.getByLabelText('Accept Terms and Conditions'));
};

describe('ProfileFormsPanel', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens the uncontrolled form in the universal modal and displays the submission', async () => {
    const store = renderPanel();

    fireEvent.click(
      screen.getByRole('button', { name: 'Open uncontrolled form' })
    );

    expect(
      screen.getByRole('dialog', { name: 'Uncontrolled profile form' })
    ).toBeInTheDocument();

    fillValidForm();
    fireEvent.click(
      screen.getByRole('button', { name: 'Submit uncontrolled form' })
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    const card = screen.getByRole('article');

    expect(within(card).getByText('Uncontrolled')).toBeInTheDocument();
    expect(within(card).getByRole('heading', { name: 'Jean' })).toBeInTheDocument();
    expect(within(card).getByText('Jean@example.com')).toBeInTheDocument();
    expect(within(card).getByText('Canada')).toBeInTheDocument();
    expect(within(card).getByRole('img', { name: 'Jean profile' })).toHaveAttribute(
      'src',
      expect.stringMatching(/^data:image\/png;base64,/)
    );
    expect(card).toHaveClass('profile-submission-card--latest');
    expect(store.getState().profileForms.submissions).toHaveLength(1);
  });

  it('opens the React Hook Form modal and keeps all successful submissions in history', async () => {
    renderPanel();

    fireEvent.click(
      screen.getByRole('button', { name: 'Open uncontrolled form' })
    );
    fillValidForm({ name: 'Jean' });
    fireEvent.click(
      screen.getByRole('button', { name: 'Submit uncontrolled form' })
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Open React Hook Form' })
    );

    expect(
      screen.getByRole('dialog', { name: 'React Hook Form profile form' })
    ).toBeInTheDocument();

    fillValidForm({ country: 'France', name: 'Beverly' });

    const submitButton = screen.getByRole('button', {
      name: 'Submit React Hook Form',
    });

    await waitFor(() => expect(submitButton).toBeEnabled());
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    const cards = screen.getAllByRole('article');

    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByText('React Hook Form')).toBeInTheDocument();
    expect(
      within(cards[0]).getByRole('heading', { name: 'Beverly' })
    ).toBeInTheDocument();
    expect(within(cards[0]).getByText('France')).toBeInTheDocument();
    expect(within(cards[1]).getByText('Uncontrolled')).toBeInTheDocument();
  });

  it('clears the latest submission marker after the highlight duration', () => {
    vi.useFakeTimers();

    const submission: ProfileSubmission = {
      age: 32,
      country: 'Canada',
      createdAt: '2026-06-05T00:00:00.000Z',
      email: 'Jean@example.com',
      gender: 'female',
      id: 'profile-submission-1',
      imageBase64: 'data:image/png;base64,cHJvZmlsZQ==',
      imageName: 'profile.png',
      name: 'Jean',
      source: 'uncontrolled',
    };
    const store = renderPanel({
      countries: ['Canada'],
      latestSubmissionId: submission.id,
      submissions: [submission],
    });

    expect(screen.getByRole('article')).toHaveClass(
      'profile-submission-card--latest'
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(store.getState().profileForms.latestSubmissionId).toBeNull();
    expect(screen.getByRole('article')).not.toHaveClass(
      'profile-submission-card--latest'
    );
  });
});
