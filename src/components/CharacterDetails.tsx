import { type MouseEvent } from 'react';
import { useSearchParams } from 'react-router';
import {
  useGetCharacterDetailsQuery,
  type StarTrekApiError,
} from '../services/starTrekCharactersApi';

const DETAILS_PARAM = 'details';
const UNKNOWN_VALUE = 'unknown';

export function CharacterDetails() {
  const [searchParams, setSearchParams] = useSearchParams();
  const detailsId = searchParams.get(DETAILS_PARAM);
  const detailsQuery = useGetCharacterDetailsQuery(detailsId ?? '', {
    skip: !detailsId,
  });
  const detailsError = detailsQuery.error as StarTrekApiError | undefined;

  if (!detailsId) {
    return null;
  }

  const isLoading = detailsQuery.isLoading && !detailsQuery.data;
  const error = detailsError?.message ?? '';

  const handleClose = () => {
    setSearchParams((prevSearchParams) => {
      const nextSearchParams = new URLSearchParams(prevSearchParams);
      nextSearchParams.delete(DETAILS_PARAM);

      return nextSearchParams;
    });
  };

  const handlePanelClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const getValueClassName = (value: string) =>
    value === UNKNOWN_VALUE
      ? 'details-list__value details-list__value--empty'
      : 'details-list__value';

  const panelTitle = detailsQuery.data?.name ?? 'Character details';

  return (
    <aside
      className="details-panel"
      aria-label="Character details"
      onClick={handlePanelClick}
    >
      <header className="details-panel__header">
        <div>
          <p className="details-panel__eyebrow">Character details</p>
          <h2>{panelTitle}</h2>
        </div>
        <button
          className="details-panel__close"
          type="button"
          onClick={handleClose}
        >
          Close
        </button>
      </header>
      {isLoading && <div role="status">Loading details...</div>}
      {!isLoading && error && <div role="alert">{error}</div>}
      {!isLoading && detailsQuery.data && (
        <article>
          <dl className="details-list">
            <div className="details-list__item">
              <dt>Gender</dt>
              <dd className={getValueClassName(detailsQuery.data.gender)}>
                {detailsQuery.data.gender}
              </dd>
            </div>
            <div className="details-list__item">
              <dt>Birth year</dt>
              <dd className={getValueClassName(detailsQuery.data.birthYear)}>
                {detailsQuery.data.birthYear}
              </dd>
            </div>
            <div className="details-list__item">
              <dt>Death year</dt>
              <dd className={getValueClassName(detailsQuery.data.deathYear)}>
                {detailsQuery.data.deathYear}
              </dd>
            </div>
          </dl>
        </article>
      )}
    </aside>
  );
}
