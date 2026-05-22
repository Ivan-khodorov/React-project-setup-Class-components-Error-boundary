import type { MouseEvent } from 'react';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
  const pages = new Set([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((firstPage, secondPage) => firstPage - secondPage);
};

export function Pagination({
  currentPage,
  onPageChange,
  totalPages,
}: PaginationProps) {
  const pages = getVisiblePages(currentPage, totalPages);
  const handlePaginationClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <nav
      className="pagination"
      aria-label="Pagination"
      onClick={handlePaginationClick}
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      {pages.map((page, index) => {
        const previousPage = pages[index - 1];
        const showGap = previousPage !== undefined && page - previousPage > 1;

        return (
          <span className="pagination-group" key={page}>
            {showGap && <span className="pagination-gap">...</span>}
            <button
              type="button"
              aria-current={page === currentPage ? 'page' : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </span>
        );
      })}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}
