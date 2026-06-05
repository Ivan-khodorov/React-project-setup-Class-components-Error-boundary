import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProfileSubmission } from '../types';
import type { RootState } from './store';

interface ProfileFormsState {
  countries: string[];
  latestSubmissionId: string | null;
  submissions: ProfileSubmission[];
}

const initialState: ProfileFormsState = {
  countries: [
    'Argentina',
    'Australia',
    'Brazil',
    'Canada',
    'France',
    'Germany',
    'India',
    'Japan',
    'United Kingdom',
    'United States',
  ],
  latestSubmissionId: null,
  submissions: [],
};

const profileFormsSlice = createSlice({
  initialState,
  name: 'profileForms',
  reducers: {
    addSubmission(state, action: PayloadAction<ProfileSubmission>) {
      state.submissions.unshift(action.payload);
      state.latestSubmissionId = action.payload.id;
    },
    clearLatestSubmissionId(state) {
      state.latestSubmissionId = null;
    },
  },
});

export const { addSubmission, clearLatestSubmissionId } =
  profileFormsSlice.actions;

export const selectCountries = (state: RootState) =>
  state.profileForms.countries;

export const selectFormSubmissions = (state: RootState) =>
  state.profileForms.submissions;

export const selectLatestSubmissionId = (state: RootState) =>
  state.profileForms.latestSubmissionId;

export const profileFormsReducer = profileFormsSlice.reducer;
