import { Outlet } from 'react-router';
import { Results } from '../components/Results';
import { Search } from '../components/Search';
import type { Item } from '../types';

interface HomePageProps {
  currentPage: number;
  error: string;
  isDetailsOpen: boolean;
  isLoading: boolean;
  items: Item[];
  onCloseDetails: () => void;
  onInitialSearchTerm: (searchTerm: string) => void;
  onPageChange: (page: number) => void;
  onSearch: (searchTerm: string) => void;
  onSelectItem: (itemId: string) => void;
  onThrowError: () => void;
  searchTerm: string;
  totalPages: number;
}

export function HomePage({
  currentPage,
  error,
  isDetailsOpen,
  isLoading,
  items,
  onCloseDetails,
  onInitialSearchTerm,
  onPageChange,
  onSearch,
  onSelectItem,
  onThrowError,
  searchTerm,
  totalPages,
}: HomePageProps) {
  const contentLayoutClassName = isDetailsOpen
    ? 'content-layout content-layout--with-details'
    : 'content-layout';

  return (
    <div className="home-layout" onClick={onCloseDetails}>
      <Search
        currentSearchTerm={searchTerm}
        onInitialSearchTerm={onInitialSearchTerm}
        onSearch={onSearch}
      />
      <div className={contentLayoutClassName}>
        <div
          className="main-panel"
          role="region"
          aria-label="Main panel"
          onClick={onCloseDetails}
        >
          <Results
            currentPage={currentPage}
            error={error}
            isLoading={isLoading}
            items={items}
            onPageChange={onPageChange}
            onSelectItem={onSelectItem}
            onThrowError={onThrowError}
            totalPages={totalPages}
          />
        </div>
        {isDetailsOpen && <Outlet />}
      </div>
    </div>
  );
}
