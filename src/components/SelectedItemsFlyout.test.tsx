import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SelectedItemsFlyout } from './SelectedItemsFlyout';
import {
  selectedItemsReducer,
  selectItem,
} from '../store/selectedItemsSlice';
import type { SelectedItem } from '../types';

const spock: SelectedItem = {
  description: 'Science officer',
  detailsUrl: '/?details=spock',
  id: 'spock',
  name: 'Spock',
};

const kirk: SelectedItem = {
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('downloads selected items as csv', () => {
    const createObjectUrl = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:csv');
    const revokeObjectUrl = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});
    const click = vi.fn();
    const anchor = document.createElement('a');
    vi.spyOn(anchor, 'click').mockImplementation(click);
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return anchor;
      }

      return originalCreateElement(tagName);
    });

    renderFlyout([spock, kirk]);

    screen.getByRole('button', { name: /download/i }).click();

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(anchor.href).toBe('blob:csv');
    expect(anchor.download).toBe('2_items.csv');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:csv');
  });
});
