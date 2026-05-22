import { Outlet } from 'react-router';
import { Results } from '../components/Results';
import { Search } from '../components/Search';
import { useHomePageController } from '../hooks/useHomePageController';

export function HomePage() {
  const {
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
    shouldThrowError,
    totalPages,
  } = useHomePageController();
  const contentLayoutClassName = isDetailsOpen
    ? 'content-layout content-layout--with-details'
    : 'content-layout';

  if (shouldThrowError) {
    throw new Error('Test application error');
  }

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
