import { Card } from './Card';
import { ErrorMessage } from './ErrorMessage';
import { Loader } from './Loader';
import { Pagination } from './Pagination';
import type { Item } from '../types';

interface ResultsProps {
  currentPage: number;
  error: string;
  isLoading: boolean;
  items: Item[];
  onPageChange: (page: number) => void;
  onSelectItem: (itemId: string) => void;
  onThrowError: () => void;
  totalPages: number;
}

export function Results({
  currentPage,
  error,
  isLoading,
  items,
  onPageChange,
  onSelectItem,
  onThrowError,
  totalPages,
}: ResultsProps) {
  const renderTestButton = () => (
    <button
      className="test-error-button"
      type="button"
      onClick={onThrowError}
    >
      Test error
    </button>
  );

  if (isLoading) {
    return (
      <section className="results-section">
        <Loader />
        {renderTestButton()}
      </section>
    );
  }

  if (error) {
    return (
      <section className="results-section">
        <ErrorMessage message={error} />
        {renderTestButton()}
      </section>
    );
  }

  return (
    <section className="results-section">
      {items.map((item) => (
        <Card key={item.id} item={item} onSelectItem={onSelectItem} />
      ))}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          onPageChange={onPageChange}
          totalPages={totalPages}
        />
      )}
      {renderTestButton()}
    </section>
  );
}
