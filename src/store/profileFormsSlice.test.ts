import { describe, expect, it } from 'vitest';
import { countries } from '../data/countries';
import type { ProfileSubmission } from '../types';
import {
  addSubmission,
  clearLatestSubmissionId,
  profileFormsReducer,
  selectCountries,
  selectFormSubmissions,
  selectLatestSubmissionId,
} from './profileFormsSlice';
import type { RootState } from './store';

const submission: ProfileSubmission = {
  age: 32,
  country: 'Canada',
  createdAt: '2026-06-05T00:00:00.000Z',
  email: 'Jean@example.com',
  gender: 'female',
  id: 'submission-1',
  imageBase64: 'data:image/png;base64,image',
  imageName: 'profile.png',
  name: 'Jean',
  source: 'uncontrolled',
};

const createRootState = (
  state = profileFormsReducer(undefined, addSubmission(submission))
): RootState => ({
  profileForms: state,
  selectedItems: { items: [] },
});

describe('profileFormsSlice', () => {
  it('stores submissions and marks the latest submission', () => {
    const state = profileFormsReducer(undefined, addSubmission(submission));

    expect(state.submissions).toEqual([submission]);
    expect(state.latestSubmissionId).toBe('submission-1');
  });

  it('keeps a submission history with newest items first', () => {
    const nextSubmission: ProfileSubmission = {
      ...submission,
      id: 'submission-2',
      source: 'react-hook-form',
    };

    const state = profileFormsReducer(
      profileFormsReducer(undefined, addSubmission(submission)),
      addSubmission(nextSubmission)
    );

    expect(state.submissions).toEqual([nextSubmission, submission]);
    expect(state.latestSubmissionId).toBe('submission-2');
  });

  it('clears the latest submission marker without removing history', () => {
    const state = profileFormsReducer(
      profileFormsReducer(undefined, addSubmission(submission)),
      clearLatestSubmissionId()
    );

    expect(state.submissions).toEqual([submission]);
    expect(state.latestSubmissionId).toBeNull();
  });

  it('selects countries, submissions, and the latest submission id', () => {
    const state = createRootState();

    expect(selectCountries(state)).toContain('Canada');
    expect(selectFormSubmissions(state)).toEqual([submission]);
    expect(selectLatestSubmissionId(state)).toBe('submission-1');
  });

  it('exposes the expanded countries list from the shared data source', () => {
    const state = createRootState();

    expect(selectCountries(state)).toEqual([...countries]);
    expect(selectCountries(state)).toContain('Mexico');
    expect(selectCountries(state)).toContain('New Zealand');
    expect(selectCountries(state)).toContain('South Africa');
    expect(selectCountries(state).length).toBeGreaterThan(100);
  });
});
