import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { Card } from './Card';
import { selectedItemsReducer } from '../store/selectedItemsSlice';
import type { Item } from '../types';

const item: Item = {
  id: 'spock',
  name: 'Spock',
  description: 'Science officer aboard the USS Enterprise.',
};

const renderCard = (onSelectItem = vi.fn()) => {
  const store = configureStore({
    reducer: {
      selectedItems: selectedItemsReducer,
    },
  });

  render(
    <Provider store={store}>
      <Card item={item} onSelectItem={onSelectItem} />
    </Provider>
  );

  return { onSelectItem, store };
};

describe('Card', () => {
  it('displays the item name and description', () => {
    renderCard();

    expect(
      screen.getByRole('heading', { name: 'Spock' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Science officer aboard the USS Enterprise.')
    ).toBeInTheDocument();
  });

  it('opens details when the item is clicked outside the checkbox', () => {
    const onSelectItem = vi.fn();

    renderCard(onSelectItem);

    screen.getByRole('button', { name: /view details/i }).click();
    expect(onSelectItem).toHaveBeenCalledWith('spock');
  });

  it('toggles selection without opening details', () => {
    const onSelectItem = vi.fn();
    const { store } = renderCard(onSelectItem);
    const checkbox = screen.getByRole('checkbox', { name: /select spock/i });

    checkbox.click();

    expect(onSelectItem).not.toHaveBeenCalled();
    expect(checkbox).toBeChecked();
    expect(store.getState().selectedItems.items).toEqual([
      {
        ...item,
        detailsUrl: '/?details=spock',
      },
    ]);

    checkbox.click();

    expect(checkbox).not.toBeChecked();
    expect(store.getState().selectedItems.items).toEqual([]);
  });
});
