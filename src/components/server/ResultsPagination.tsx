import { Link } from '@/i18n/navigation';

interface ResultsPaginationProps {
  currentPage: number;
  detailsId: string;
  searchTerm: string;
  totalPages: number;
  translations: {
    label: string;
    next: string;
    previous: string;
  };
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
  const pages = new Set([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort(
    (firstPage, secondPage) => firstPage - secondPage
  );
};

export function ResultsPagination({
  currentPage,
  detailsId,
  searchTerm,
  totalPages,
  translations,
}: ResultsPaginationProps) {
  const pages = getVisiblePages(currentPage, totalPages);
  const createHref = (page: number) => ({
    pathname: '/' as const,
    query: {
      ...(detailsId ? { details: detailsId } : {}),
      page,
      ...(searchTerm ? { query: searchTerm } : {}),
    },
  });

  return (
    <nav className="pagination" aria-label={translations.label}>
      {currentPage === 1 ? (
        <span className="pagination__disabled">{translations.previous}</span>
      ) : (
        <Link href={createHref(currentPage - 1)}>
          {translations.previous}
        </Link>
      )}
      {pages.map((page, index) => {
        const previousPage = pages[index - 1];
        const showGap = previousPage !== undefined && page - previousPage > 1;

        return (
          <span className="pagination-group" key={page}>
            {showGap && <span className="pagination-gap">...</span>}
            <Link
              aria-current={page === currentPage ? 'page' : undefined}
              href={createHref(page)}
            >
              {page}
            </Link>
          </span>
        );
      })}
      {currentPage === totalPages ? (
        <span className="pagination__disabled">{translations.next}</span>
      ) : (
        <Link href={createHref(currentPage + 1)}>{translations.next}</Link>
      )}
    </nav>
  );
}
