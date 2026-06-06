import { describe, expect, it } from 'vitest';
import {
  clearSelectedItems,
  selectIsItemSelected,
  selectItem,
  selectedItemsReducer,
  selectSelectedItemIds,
  selectSelectedItems,
  selectSelectedItemsCount,
  toggleItem,
  unselectItem,
} from './selectedItemsSlice';
import type { RootState } from './store';
import type { SelectedItem } from '../types';

const spock: SelectedItem = {
  detailsId: 'spock',
  description: 'Vulcan science officer',
  detailsUrl: '/?page=1&details=spock',
  id: 'spock',
  name: 'Spock',
};

const kirk: SelectedItem = {
  detailsId: 'kirk',
  description: 'Captain of the Enterprise',
  detailsUrl: '/?page=1&details=kirk',
  id: 'kirk',
  name: 'Kirk',
};

const createRootState = (items: SelectedItem[]): RootState => ({
  profileForms: {
    countries: [],
    latestSubmissionId: null,
    submissions: [],
  },
  selectedItems: { items },
});

describe('selectedItemsSlice', () => {
  it('selects an item once', () => {
    const withSelectedItem = selectedItemsReducer(
      undefined,
      selectItem(spock)
    );
    const withDuplicateSelect = selectedItemsReducer(
      withSelectedItem,
      selectItem(spock)
    );

    expect(withDuplicateSelect.items).toEqual([spock]);
  });

  it('unselects an item by id', () => {
    const state = selectedItemsReducer(
      { items: [spock, kirk] },
      unselectItem('spock')
    );

    expect(state.items).toEqual([kirk]);
  });

  it('toggles an item on and off', () => {
    const selectedState = selectedItemsReducer(undefined, toggleItem(spock));
    const unselectedState = selectedItemsReducer(
      selectedState,
      toggleItem(spock)
    );

    expect(selectedState.items).toEqual([spock]);
    expect(unselectedState.items).toEqual([]);
  });

  it('clears all selected items', () => {
    const state = selectedItemsReducer(
      { items: [spock, kirk] },
      clearSelectedItems()
    );

    expect(state.items).toEqual([]);
  });

  it('selects items with selectors', () => {
    const state = createRootState([spock, kirk]);

    expect(selectSelectedItems(state)).toEqual([spock, kirk]);
    expect(selectSelectedItemsCount(state)).toBe(2);
    expect(selectSelectedItemIds(state)).toEqual(['spock', 'kirk']);
    expect(selectIsItemSelected(state, 'spock')).toBe(true);
    expect(selectIsItemSelected(state, 'uhura')).toBe(false);
  });
});
