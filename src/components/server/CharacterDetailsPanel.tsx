import { Link } from '@/i18n/navigation';
import { requestCharacterDetails } from '@/services/starTrekCharacters';
import type { CharacterDetailsData } from '@/types';

interface CharacterDetailsPanelProps {
  currentPage: number;
  detailsId: string;
  searchTerm: string;
  translations: {
    birthYear: string;
    close: string;
    deathYear: string;
    empty: string;
    error: string;
    gender: string;
    title: string;
  };
}

const UNKNOWN_VALUE = 'unknown';

const getValueClassName = (value: string) =>
  value === UNKNOWN_VALUE
    ? 'details-list__value details-list__value--empty'
    : 'details-list__value';

export async function CharacterDetailsPanel({
  currentPage,
  detailsId,
  searchTerm,
  translations,
}: CharacterDetailsPanelProps) {
  let details: CharacterDetailsData | null = null;
  let error = '';

  if (detailsId) {
    try {
      details = await requestCharacterDetails(detailsId);
    } catch {
      error = translations.error;
    }
  }

  const closeHref = {
    pathname: '/' as const,
    query: {
      page: currentPage,
      ...(searchTerm ? { query: searchTerm } : {}),
    },
  };

  return (
    <aside className="details-panel" aria-label={translations.title}>
      <header className="details-panel__header">
        <div>
          <p className="details-panel__eyebrow">{translations.title}</p>
          <h2>{details?.name ?? translations.title}</h2>
        </div>
        {detailsId && (
          <Link className="details-panel__button" href={closeHref}>
            {translations.close}
          </Link>
        )}
      </header>
      {!detailsId && <p className="details-panel__empty">{translations.empty}</p>}
      {error && <div role="alert">{error}</div>}
      {details && (
        <article>
          <dl className="details-list">
            <div className="details-list__item">
              <dt>{translations.gender}</dt>
              <dd className={getValueClassName(details.gender)}>
                {details.gender}
              </dd>
            </div>
            <div className="details-list__item">
              <dt>{translations.birthYear}</dt>
              <dd className={getValueClassName(details.birthYear)}>
                {details.birthYear}
              </dd>
            </div>
            <div className="details-list__item">
              <dt>{translations.deathYear}</dt>
              <dd className={getValueClassName(details.deathYear)}>
                {details.deathYear}
              </dd>
            </div>
          </dl>
        </article>
      )}
    </aside>
  );
}
