import { CharacterDetailsPanel } from '@/components/server/CharacterDetailsPanel';
import { SearchForm } from '@/components/server/SearchForm';
import { SearchResults } from '@/components/server/SearchResults';
import {
  requestCharacters,
  type CharactersResult,
} from '@/services/starTrekCharacters';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    details?: string | string[];
    page?: string | string[];
    query?: string | string[];
  }>;
}

const getSingleParam = (value: string | string[] | undefined): string =>
  typeof value === 'string' ? value : '';

const getValidPage = (value: string): number => {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
};

export default async function HomePage({
  params,
  searchParams,
}: HomePageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);

  const translations = await getTranslations('Home');
  const currentPage = getValidPage(getSingleParam(resolvedSearchParams.page));
  const detailsId = getSingleParam(resolvedSearchParams.details);
  const searchTerm = getSingleParam(resolvedSearchParams.query).trim();
  let result: CharactersResult | null = null;

  try {
    result = await requestCharacters({
      page: currentPage,
      searchTerm,
    });
  } catch {
    result = null;
  }

  return (
    <div className="home-layout">
      <h1 className="page-title">{translations('title')}</h1>
      <SearchForm
        detailsId={detailsId}
        locale={locale}
        searchTerm={searchTerm}
        translations={{
          inputLabel: translations('search.inputLabel'),
          submit: translations('search.submit'),
        }}
      />
      <div className="content-layout content-layout--with-details">
        <div
          className="main-panel"
          role="region"
          aria-label={translations('results.label')}
        >
          <SearchResults
            currentPage={currentPage}
            detailsId={detailsId}
            locale={locale}
            result={result}
            searchTerm={searchTerm}
            translations={{
              empty: translations('results.empty'),
              error: translations('results.error'),
              pagination: {
                label: translations('pagination.label'),
                next: translations('pagination.next'),
                previous: translations('pagination.previous'),
              },
              select: translations('results.select'),
              viewDetails: translations('results.viewDetails'),
            }}
          />
        </div>
        <CharacterDetailsPanel
          currentPage={currentPage}
          detailsId={detailsId}
          searchTerm={searchTerm}
          translations={{
            birthYear: translations('details.birthYear'),
            close: translations('details.close'),
            deathYear: translations('details.deathYear'),
            empty: translations('details.empty'),
            error: translations('details.error'),
            gender: translations('details.gender'),
            title: translations('details.title'),
          }}
        />
      </div>
    </div>
  );
}
