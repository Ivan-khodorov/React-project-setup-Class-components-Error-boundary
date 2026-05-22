import { type MouseEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { fetchCharacterDetails } from '../services/starTrekCharactersApi';
import type { CharacterDetailsData } from '../types';

const DETAILS_PARAM = 'details';
const UNKNOWN_VALUE = 'unknown';

interface CharacterDetailsState {
  data: CharacterDetailsData | null;
  detailsId: string | null;
  error: string;
}

export function CharacterDetails() {
  const [searchParams, setSearchParams] = useSearchParams();
  const detailsId = searchParams.get(DETAILS_PARAM);
  const [state, setState] = useState<CharacterDetailsState>({
    data: null,
    detailsId: null,
    error: '',
  });

  useEffect(() => {
    if (!detailsId) {
      return;
    }

    let isCurrent = true;

    void fetchCharacterDetails(detailsId)
      .then((data) => {
        if (!isCurrent) return;
        setState({ data, detailsId, error: '' });
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to load character details.';

        setState({ data: null, detailsId, error: message });
      });

    return () => {
      isCurrent = false;
    };
  }, [detailsId]);

  if (!detailsId) {
    return null;
  }

  const isLoading = state.detailsId !== detailsId;

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

  const panelTitle = state.data?.name ?? 'Character details';

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
      {!isLoading && state.error && <div role="alert">{state.error}</div>}
      {!isLoading && state.data && (
        <article>
          <dl className="details-list">
            <div className="details-list__item">
              <dt>Gender</dt>
              <dd className={getValueClassName(state.data.gender)}>
                {state.data.gender}
              </dd>
            </div>
            <div className="details-list__item">
              <dt>Birth year</dt>
              <dd className={getValueClassName(state.data.birthYear)}>
                {state.data.birthYear}
              </dd>
            </div>
            <div className="details-list__item">
              <dt>Death year</dt>
              <dd className={getValueClassName(state.data.deathYear)}>
                {state.data.deathYear}
              </dd>
            </div>
          </dl>
        </article>
      )}
    </aside>
  );
}
