import { Outlet } from 'react-router';
import { Results } from '../components/Results';
import { Search } from '../components/Search';
import type { Item } from '../types';

interface HomePageProps {
  currentPage: number;
  error: string;
  isLoading: boolean;
  items: Item[];
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
  isLoading,
  items,
  onInitialSearchTerm,
  onPageChange,
  onSearch,
  onSelectItem,
  onThrowError,
  searchTerm,
  totalPages,
}: HomePageProps) {
  return (
    <div className="home-layout">
      <section className="master-panel">
        <Search
          currentSearchTerm={searchTerm}
          onInitialSearchTerm={onInitialSearchTerm}
          onSearch={onSearch}
        />
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
      </section>
      <Outlet />
    </div>
  );
}
