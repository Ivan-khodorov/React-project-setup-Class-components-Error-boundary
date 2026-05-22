import { clearSelectedItems } from '../store/selectedItemsSlice';
import {
  selectSelectedItems,
  selectSelectedItemsCount,
} from '../store/selectedItemsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createSelectedItemsCsv } from '../utils/csv';

export function SelectedItemsFlyout() {
  const dispatch = useAppDispatch();
  const selectedItems = useAppSelector(selectSelectedItems);
  const selectedItemsCount = useAppSelector(selectSelectedItemsCount);

  if (selectedItemsCount === 0) {
    return null;
  }

  const handleUnselectAll = () => {
    dispatch(clearSelectedItems());
  };

  const handleDownload = () => {
    const csv = createSelectedItemsCsv(selectedItems);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${selectedItemsCount}_items.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="selected-items-flyout" aria-label="Selected items">
      <p>{selectedItemsCount} selected</p>
      <div>
        <button type="button" onClick={handleUnselectAll}>
          Unselect all
        </button>
        <button type="button" onClick={handleDownload}>
          Download
        </button>
      </div>
    </aside>
  );
}
