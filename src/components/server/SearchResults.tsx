import { CharacterCard } from './CharacterCard';
import { ResultsPagination } from './ResultsPagination';
import type { CharactersResult } from '@/services/starTrekCharacters';

interface SearchResultsProps {
  currentPage: number;
  detailsId: string;
  locale: string;
  result: CharactersResult | null;
  searchTerm: string;
  translations: {
    empty: string;
    error: string;
    pagination: {
      label: string;
      next: string;
      previous: string;
    };
    select: string;
    viewDetails: string;
  };
}

export function SearchResults({
  currentPage,
  detailsId,
  locale,
  result,
  searchTerm,
  translations,
}: SearchResultsProps) {
  if (!result) {
    return (
      <section className="results-section">
        <div role="alert">{translations.error}</div>
      </section>
    );
  }

  return (
    <section className="results-section">
      {result.items.length === 0 ? (
        <p className="results-section__empty">{translations.empty}</p>
      ) : (
        result.items.map((item) => (
          <CharacterCard
            currentPage={currentPage}
            item={item}
            key={item.id}
            locale={locale}
            searchTerm={searchTerm}
            selectLabel={translations.select}
            viewDetailsLabel={translations.viewDetails}
          />
        ))
      )}
      {result.totalPages > 1 && (
        <ResultsPagination
          currentPage={currentPage}
          detailsId={detailsId}
          searchTerm={searchTerm}
          totalPages={result.totalPages}
          translations={translations.pagination}
        />
      )}
    </section>
  );
}
