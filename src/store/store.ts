import { configureStore } from '@reduxjs/toolkit';
import { starTrekCharactersApi } from '../services/starTrekCharactersApi';
import { profileFormsReducer } from './profileFormsSlice';
import { selectedItemsReducer } from './selectedItemsSlice';

const reducer = {
  profileForms: profileFormsReducer,
  selectedItems: selectedItemsReducer,
  [starTrekCharactersApi.reducerPath]: starTrekCharactersApi.reducer,
};

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(starTrekCharactersApi.middleware),
  reducer,
});

type StoreState = ReturnType<typeof store.getState>;

export type RootState = Pick<StoreState, 'profileForms' | 'selectedItems'> &
  Partial<Pick<StoreState, typeof starTrekCharactersApi.reducerPath>>;
export type AppDispatch = typeof store.dispatch;
