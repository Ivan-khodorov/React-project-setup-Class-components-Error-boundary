import type { ChangeEvent, MouseEvent } from 'react';
import {
  selectIsItemSelected,
  toggleItem,
} from '../store/selectedItemsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { Item } from '../types';

interface CardProps {
  item: Item;
  onSelectItem: (itemId: string) => void;
}

export function Card({ item, onSelectItem }: CardProps) {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector((state) =>
    selectIsItemSelected(state, item.id)
  );

  const selectedItem = {
    ...item,
    detailsUrl: `/?details=${encodeURIComponent(item.detailsId)}`,
  };

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onSelectItem(item.detailsId);
  };

  const handleSelectionChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    dispatch(toggleItem(selectedItem));
  };

  return (
    <article
      className={isSelected ? 'result-card result-card--selected' : 'result-card'}
      onClick={handleCardClick}
    >
      <label
        className="selection-control"
        onClick={(event: MouseEvent<HTMLLabelElement>) => event.stopPropagation()}
      >
        <input
          aria-label={`Select ${item.name}`}
          checked={isSelected}
          type="checkbox"
          onChange={handleSelectionChange}
        />
        <span aria-hidden="true" className="selection-control__box" />
      </label>
      <h2>{item.name}</h2>
      <p>{item.description}</p>
      <button type="button">
        View details
      </button>
    </article>
  );
}
