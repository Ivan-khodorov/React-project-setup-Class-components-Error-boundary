import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { SelectedItem } from '../types';

interface SelectedItemsState {
  items: SelectedItem[];
}

const initialState: SelectedItemsState = {
  items: [],
};

const selectedItemsSlice = createSlice({
  name: 'selectedItems',
  initialState,
  reducers: {
    clearSelectedItems(state) {
      state.items = [];
    },
    selectItem(state, action: PayloadAction<SelectedItem>) {
      const isSelected = state.items.some(
        (item) => item.id === action.payload.id
      );

      if (!isSelected) {
        state.items.push(action.payload);
      }
    },
    toggleItem(state, action: PayloadAction<SelectedItem>) {
      const selectedIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (selectedIndex === -1) {
        state.items.push(action.payload);
        return;
      }

      state.items.splice(selectedIndex, 1);
    },
    unselectItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const {
  clearSelectedItems,
  selectItem,
  toggleItem,
  unselectItem,
} = selectedItemsSlice.actions;

export const selectSelectedItems = (state: RootState) =>
  state.selectedItems.items;

export const selectSelectedItemsCount = (state: RootState) =>
  selectSelectedItems(state).length;

export const selectSelectedItemIds = (state: RootState) =>
  selectSelectedItems(state).map((item) => item.id);

export const selectIsItemSelected = (state: RootState, itemId: string) =>
  selectSelectedItems(state).some((item) => item.id === itemId);

export const selectedItemsReducer = selectedItemsSlice.reducer;
