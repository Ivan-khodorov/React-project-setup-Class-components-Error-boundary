import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CharacterDetails } from './CharacterDetails';
import { starTrekCharactersApi } from '../services/starTrekCharactersApi';

const createStore = () =>
  configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(starTrekCharactersApi.middleware),
    reducer: {
      [starTrekCharactersApi.reducerPath]: starTrekCharactersApi.reducer,
    },
  });

const renderDetails = (initialEntry = '/?page=1&details=spock') =>
  render(
    <Provider store={createStore()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <CharacterDetails />
      </MemoryRouter>
    </Provider>
  );

const createDetailsResponse = () => ({
  json: vi.fn().mockResolvedValue({
    character: {
      gender: 'Male',
      name: 'Spock',
      uid: 'spock',
      yearOfBirth: 2230,
    },
  }),
  ok: true,
  status: 200,
});

describe('CharacterDetails', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders nothing when details param is absent', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { container } = renderDetails('/?page=1');

    expect(container).toBeEmptyDOMElement();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows loading and renders loaded character details', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createDetailsResponse());
    vi.stubGlobal('fetch', fetchMock);

    renderDetails();

    expect(screen.getByRole('status')).toHaveTextContent('Loading details...');

    expect(
      await screen.findByRole('heading', { name: 'Spock' })
    ).toBeInTheDocument();
    expect(screen.getByText('2230')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl] = fetchMock.mock.calls[0];

    expect((requestUrl as URL).searchParams.get('uid')).toBe('spock');
  });

  it('displays a readable error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn(),
        ok: false,
        status: 503,
      })
    );

    renderDetails();

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Request failed with status 503.');
  });

  it('closes the details panel', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createDetailsResponse()));

    const { container } = renderDetails();

    screen.getByRole('button', { name: /close/i }).click();

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('reuses cached details while the same store is mounted', async () => {
    const store = createStore();
    const fetchMock = vi.fn().mockResolvedValue(createDetailsResponse());
    vi.stubGlobal('fetch', fetchMock);

    const { rerender } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/?page=1&details=spock']}>
          <CharacterDetails />
        </MemoryRouter>
      </Provider>
    );

    expect(
      await screen.findByRole('heading', { name: 'Spock' })
    ).toBeInTheDocument();

    rerender(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/?page=1&details=spock']}>
          <CharacterDetails />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('heading', { name: 'Spock' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
