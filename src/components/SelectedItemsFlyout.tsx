'use client';

import { clearSelectedItems } from '../store/selectedItemsSlice';
import {
  selectSelectedItems,
  selectSelectedItemsCount,
} from '../store/selectedItemsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

interface SelectedItemsFlyoutProps {
  translations?: {
    clear: string;
    count: (count: number) => string;
    download: string;
    label: string;
  };
}

const defaultTranslations = {
  clear: 'Unselect all',
  count: (count: number) => `${count} selected`,
  download: 'Download',
  label: 'Selected items',
};

export function SelectedItemsFlyout({
  translations = defaultTranslations,
}: SelectedItemsFlyoutProps) {
  const dispatch = useAppDispatch();
  const selectedItems = useAppSelector(selectSelectedItems);
  const selectedItemsCount = useAppSelector(selectSelectedItemsCount);

  if (selectedItemsCount === 0) {
    return null;
  }

  const handleUnselectAll = () => {
    dispatch(clearSelectedItems());
  };

  return (
    <aside
      className="selected-items-flyout"
      aria-label={translations.label}
    >
      <p>{translations.count(selectedItemsCount)}</p>
      <div>
        <button type="button" onClick={handleUnselectAll}>
          {translations.clear}
        </button>
        <form action="/api/csv" method="post">
          <input
            name="items"
            type="hidden"
            value={JSON.stringify(selectedItems)}
          />
          <button type="submit">{translations.download}</button>
        </form>
      </div>
    </aside>
  );
}
