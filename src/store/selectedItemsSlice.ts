import { createSlice } from '@reduxjs/toolkit';

interface SelectedItemsState {
  items: [];
}

const initialState: SelectedItemsState = {
  items: [],
};

const selectedItemsSlice = createSlice({
  name: 'selectedItems',
  initialState,
  reducers: {},
});

export const selectedItemsReducer = selectedItemsSlice.reducer;
