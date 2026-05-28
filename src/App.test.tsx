import { configureStore } from '@reduxjs/toolkit';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeProvider';
import { starTrekCharactersApi } from './services/starTrekCharactersApi';
import { selectedItemsReducer } from './store/selectedItemsSlice';
import type { Item } from './types';

interface CharacterApiMock {
  gender?: string | null;
  name: string;
  uid: string;
  yearOfBirth?: number | null;
  yearOfDeath?: number | null;
}

const spockItem: Item = {
  detailsId: 'spock',
  id: 'spock-0',
  name: 'Spock',
  description: 'Gender: Male. Birth year: 2230. Death year: unknown.',
};

const kirkItem: Item = {
  detailsId: 'kirk',
  id: 'kirk-0',
  name: 'Kirk',
  description: 'Gender: Male. Birth year: 2233. Death year: unknown.',
};

const toApiCharacter = (item: Item): CharacterApiMock => ({
  gender: 'Male',
  name: item.name,
  uid: item.detailsId,
  yearOfBirth: item.name === 'Kirk' ? 2233 : 2230,
});

const createListResponse = (items: Item[], totalPages = 1) => ({
  json: vi.fn().mockResolvedValue({
    characters: items.map(toApiCharacter),
    page: { totalPages },
  }),
  ok: true,
  status: 200,
});

const createDetailsResponse = (character: CharacterApiMock) => ({
  json: vi.fn().mockResolvedValue({ character }),
  ok: true,
  status: 200,
});

const createErrorResponse = (status: number) => ({
  json: vi.fn(),
  ok: false,
  status,
});

const createFetchMock = (
  listResponses: Array<ReturnType<typeof createListResponse>>,
  detailsResponses: Array<ReturnType<typeof createDetailsResponse>> = []
) =>
  vi.fn((input: URL | RequestInfo, init?: RequestInit) => {
    void init;
    const url = input instanceof URL ? input : new URL(String(input));
    const response = url.pathname.endsWith('/character/search')
      ? listResponses.shift()
      : detailsResponses.shift();

    if (!response) {
      throw new Error(`Unexpected request to ${url.toString()}`);
    }

    return Promise.resolve(response);
  });

describe('App Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderApp = (initialEntries = ['/']) => {
    const store = configureStore({
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(starTrekCharactersApi.middleware),
      reducer: {
        selectedItems: selectedItemsReducer,
        [starTrekCharactersApi.reducerPath]: starTrekCharactersApi.reducer,
      },
    });

    return render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
  };

  it('loads initial search term from localStorage on mount', async () => {
    window.localStorage.setItem('searchTerm', 'spock');
    const fetchMock = createFetchMock([createListResponse([])]);
    vi.stubGlobal('fetch', fetchMock);

    renderApp();

    expect(screen.getByLabelText('Search')).toHaveValue('spock');

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [, requestInit] = fetchMock.mock.calls[0];
    expect((requestInit?.body as URLSearchParams).toString()).toBe(
      'name=spock'
    );
  });

  it('shows loading state and then renders results', async () => {
    vi.stubGlobal(
      'fetch',
      createFetchMock([createListResponse([spockItem, kirkItem])])
    );

    renderApp();

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    expect(await screen.findByText('Spock')).toBeInTheDocument();
    expect(screen.getByText('Kirk')).toBeInTheDocument();
  });

  it('shows error message when API call fails', async () => {
    vi.stubGlobal('fetch', createFetchMock([createErrorResponse(503)]));

    renderApp();

    expect(
      await screen.findByText(/Request failed with status 503./i)
    ).toBeInTheDocument();
  });

  it('executes full search flow: input -> click -> results', async () => {
    const uhuraItem: Item = {
      detailsId: 'uhura',
      id: 'uhura-0',
      name: 'Uhura',
      description: 'Gender: Female. Birth year: unknown. Death year: unknown.',
    };
    const fetchMock = createFetchMock([
      createListResponse([]),
      createListResponse([uhuraItem]),
    ]);
    vi.stubGlobal('fetch', fetchMock);

    renderApp();

    const input = screen.getByLabelText('Search');
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'uhura' } });
    fireEvent.click(button);

    expect(await screen.findByText('Uhura')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [, requestInit] = fetchMock.mock.calls[1];
    expect((requestInit?.body as URLSearchParams).toString()).toBe(
      'name=uhura'
    );
  });

  it('shows error boundary fallback when "Test error" button is clicked', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', createFetchMock([createListResponse([])]));

    render(
      <ErrorBoundary>
        <Provider
          store={configureStore({
            middleware: (getDefaultMiddleware) =>
              getDefaultMiddleware().concat(starTrekCharactersApi.middleware),
            reducer: {
              selectedItems: selectedItemsReducer,
              [starTrekCharactersApi.reducerPath]:
                starTrekCharactersApi.reducer,
            },
          })}
        >
          <ThemeProvider>
            <MemoryRouter>
              <App />
            </MemoryRouter>
          </ThemeProvider>
        </Provider>
      </ErrorBoundary>
    );

    const errorButton = await screen.findByRole('button', {
      name: /test error/i,
    });
    fireEvent.click(errorButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('renders the About page from navigation', async () => {
    vi.stubGlobal('fetch', createFetchMock([createListResponse([])]));

    renderApp();

    fireEvent.click(screen.getByRole('link', { name: /about/i }));

    expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByText(/author: ivan khodorov/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /rs school react course/i })
    ).toHaveAttribute('href', 'https://rs.school/courses/reactjs');
  });

  it('renders the 404 page for unknown routes', () => {
    renderApp(['/missing-page']);

    expect(
      screen.getByRole('heading', { name: /page not found/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /return to the main app/i })
    ).toHaveAttribute('href', '/');
  });

  it('loads the page from the URL and changes pages from pagination', async () => {
    const fetchMock = createFetchMock([
      createListResponse([spockItem], 3),
      createListResponse([kirkItem], 3),
    ]);
    vi.stubGlobal('fetch', fetchMock);

    renderApp(['/?page=2']);

    await waitFor(() => {
      expect(screen.getByRole('button', { current: 'page' })).toHaveTextContent(
        '2'
      );
    });

    fireEvent.click(screen.getByRole('button', { name: '3' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { current: 'page' })).toHaveTextContent(
        '3'
      );
    });

    const [firstUrl] = fetchMock.mock.calls[0];
    const [secondUrl] = fetchMock.mock.calls[1];

    expect((firstUrl as URL).searchParams.get('pageNumber')).toBe('1');
    expect((secondUrl as URL).searchParams.get('pageNumber')).toBe('2');
  });

  it('reuses cached list pages and refresh invalidates the current list', async () => {
    const fetchMock = createFetchMock([
      createListResponse([spockItem], 2),
      createListResponse([kirkItem], 2),
      createListResponse([spockItem], 2),
    ]);
    vi.stubGlobal('fetch', fetchMock);

    renderApp(['/?page=1']);

    expect(await screen.findByText('Spock')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(await screen.findByText('Kirk')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '1' }));

    await waitFor(() => {
      expect(screen.getByText('Spock')).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  it('opens and closes character details from the results list', async () => {
    const fetchMock = createFetchMock(
      [createListResponse([spockItem], 1)],
      [
        createDetailsResponse({
          gender: 'Male',
          name: 'Spock',
          uid: 'spock',
          yearOfBirth: 2230,
        }),
        createDetailsResponse({
          gender: 'Male',
          name: 'Spock',
          uid: 'spock',
          yearOfBirth: 2230,
        }),
      ]
    );
    vi.stubGlobal('fetch', fetchMock);

    renderApp(['/?page=2']);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Spock' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /view details/i }));

    expect(screen.getByRole('status')).toHaveTextContent('Loading details...');

    await waitFor(() => {
      expect(
        screen.getByRole('complementary', { name: /character details/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('complementary', { name: /character details/i })
    );

    expect(
      screen.getByRole('complementary', { name: /character details/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('region', { name: /main panel/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole('complementary', { name: /character details/i })
      ).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /view details/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('complementary', { name: /character details/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole('complementary', { name: /character details/i })
      ).not.toBeInTheDocument();
    });
  });

  it('persists selected items across page navigation', async () => {
    vi.stubGlobal('fetch', createFetchMock([createListResponse([spockItem])]));

    renderApp();

    const checkbox = await screen.findByRole('checkbox', {
      name: /select spock/i,
    });
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });

    fireEvent.click(screen.getByRole('link', { name: /about/i }));

    expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /home/i }));

    expect(
      await screen.findByRole('checkbox', { name: /select spock/i })
    ).toBeChecked();
  });

  it('displays the count for multiple selected items', async () => {
    vi.stubGlobal(
      'fetch',
      createFetchMock([createListResponse([spockItem, kirkItem])])
    );

    renderApp();

    fireEvent.click(
      await screen.findByRole('checkbox', { name: /select spock/i })
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /select kirk/i }));

    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    expect(screen.getByRole('checkbox', { name: /select spock/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /select kirk/i })).toBeChecked();
  });
});
