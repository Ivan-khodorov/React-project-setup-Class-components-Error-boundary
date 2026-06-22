import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { selectedItemsReducer } from '../store/selectedItemsSlice';
import { SelectionControl } from './SelectionControl';
import type { SelectedItem } from '../types';

const spock: SelectedItem = {
  detailsId: 'spock',
  description: 'Science officer',
  detailsUrl: '/en?page=1&details=spock',
  id: 'spock',
  name: 'Spock',
};

describe('SelectionControl', () => {
  it('toggles a server-rendered item in the Redux selection', () => {
    const store = configureStore({
      reducer: {
        selectedItems: selectedItemsReducer,
      },
    });

    render(
      <Provider store={store}>
        <SelectionControl item={spock} label="Select Spock" />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Select Spock' });

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(store.getState().selectedItems.items).toEqual([spock]);

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(store.getState().selectedItems.items).toEqual([]);
  });
});
