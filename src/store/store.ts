import { configureStore } from '@reduxjs/toolkit';
import { selectedItemsReducer } from './selectedItemsSlice';

const reducer = {
  selectedItems: selectedItemsReducer,
};

export const store = configureStore({
  reducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
