'use client';

import {
  selectIsItemSelected,
  toggleItem,
} from '../store/selectedItemsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { SelectedItem } from '../types';

interface SelectionControlProps {
  item: SelectedItem;
  label: string;
}

export function SelectionControl({ item, label }: SelectionControlProps) {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector((state) =>
    selectIsItemSelected(state, item.id)
  );

  return (
    <label className="selection-control">
      <input
        aria-label={label}
        checked={isSelected}
        type="checkbox"
        onChange={() => dispatch(toggleItem(item))}
      />
      <span aria-hidden="true" className="selection-control__box" />
    </label>
  );
}
