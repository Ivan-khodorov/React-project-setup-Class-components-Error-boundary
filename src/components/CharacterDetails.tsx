import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { fetchCharacterDetails } from '../services/starTrekCharactersApi';
import type { CharacterDetailsData } from '../types';

const DETAILS_PARAM = 'details';

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

  return (
    <aside className="details-panel" aria-label="Character details">
      <button type="button" onClick={handleClose}>
        Close
      </button>
      {isLoading && <div role="status">Loading details...</div>}
      {!isLoading && state.error && <div role="alert">{state.error}</div>}
      {!isLoading && state.data && (
        <article>
          <h2>{state.data.name}</h2>
          <p>{state.data.description}</p>
          <dl>
            <div>
              <dt>Gender</dt>
              <dd>{state.data.gender}</dd>
            </div>
            <div>
              <dt>Birth year</dt>
              <dd>{state.data.birthYear}</dd>
            </div>
            <div>
              <dt>Death year</dt>
              <dd>{state.data.deathYear}</dd>
            </div>
          </dl>
        </article>
      )}
    </aside>
  );
}
