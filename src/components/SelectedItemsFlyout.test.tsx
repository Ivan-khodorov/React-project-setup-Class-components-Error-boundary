import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { SelectedItemsFlyout } from './SelectedItemsFlyout';
import {
  selectedItemsReducer,
  selectItem,
} from '../store/selectedItemsSlice';
import type { SelectedItem } from '../types';

const spock: SelectedItem = {
  detailsId: 'spock',
  description: 'Science officer',
  detailsUrl: '/?details=spock',
  id: 'spock',
  name: 'Spock',
};

const kirk: SelectedItem = {
  detailsId: 'kirk',
  description: 'Captain',
  detailsUrl: '/?details=kirk',
  id: 'kirk',
  name: 'Kirk',
};

const renderFlyout = (items: SelectedItem[] = []) => {
  const store = configureStore({
    reducer: {
      selectedItems: selectedItemsReducer,
    },
  });

  items.forEach((item) => {
    store.dispatch(selectItem(item));
  });

  render(
    <Provider store={store}>
      <SelectedItemsFlyout />
    </Provider>
  );

  return store;
};

describe('SelectedItemsFlyout', () => {
  it('does not render when there are no selected items', () => {
    renderFlyout();

    expect(
      screen.queryByRole('complementary', { name: /selected items/i })
    ).not.toBeInTheDocument();
  });

  it('displays selected items count', () => {
    renderFlyout([spock, kirk]);

    expect(
      screen.getByRole('complementary', { name: /selected items/i })
    ).toBeInTheDocument();
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('unselects all items', () => {
    const store = renderFlyout([spock]);

    screen.getByRole('button', { name: /unselect all/i }).click();

    expect(store.getState().selectedItems.items).toEqual([]);
    return waitFor(() => {
      expect(
        screen.queryByRole('complementary', { name: /selected items/i })
      ).not.toBeInTheDocument();
    });
  });

  it('submits selected items to the server csv route', () => {
    renderFlyout([spock, kirk]);

    const form = screen.getByRole('button', { name: /download/i }).closest('form');
    const input = form?.querySelector<HTMLInputElement>('input[name="items"]');

    expect(form).toHaveAttribute('action', '/api/csv');
    expect(form).toHaveAttribute('method', 'post');
    expect(input?.value).toBe(JSON.stringify([spock, kirk]));
  });
});
