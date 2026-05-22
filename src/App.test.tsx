import { configureStore } from '@reduxjs/toolkit';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import {
  fetchCharacterDetails,
  fetchCharacters,
} from './services/starTrekCharactersApi';
import { ThemeProvider } from './context/ThemeProvider';
import { selectedItemsReducer } from './store/selectedItemsSlice';

vi.mock('./services/starTrekCharactersApi', () => ({
  fetchCharacterDetails: vi.fn(),
  fetchCharacters: vi.fn(),
}));

describe('App Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  const renderApp = (initialEntries = ['/']) => {
    const store = configureStore({
      reducer: {
        selectedItems: selectedItemsReducer,
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
    vi.mocked(fetchCharacters).mockResolvedValueOnce({
      items: [],
      totalPages: 1,
    });

    renderApp();

    expect(fetchCharacters).toHaveBeenCalledWith('spock', 1);
    expect(screen.getByLabelText('Search')).toHaveValue('spock');
  });

  it('shows loading state and then renders results', async () => {
    const mockItems = [
      { detailsId: '1', id: '1', name: 'Spock', description: 'Vulcan' },
      { detailsId: '2', id: '2', name: 'Kirk', description: 'Captain' },
    ];
    vi.mocked(fetchCharacters).mockResolvedValueOnce({
      items: mockItems,
      totalPages: 1,
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Spock')).toBeInTheDocument();
      expect(screen.getByText('Kirk')).toBeInTheDocument();
    });
  });

  it('shows error message when API call fails', async () => {
    vi.mocked(fetchCharacters).mockRejectedValueOnce(new Error('API Error'));

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    });
  });

  it('executes full search flow: input -> click -> results', async () => {
    const mockItems = [
      { detailsId: '3', id: '3', name: 'Uhura', description: 'Communications' },
    ];
    vi.mocked(fetchCharacters).mockResolvedValueOnce({
      items: [],
      totalPages: 1,
    });
    vi.mocked(fetchCharacters).mockResolvedValueOnce({
      items: mockItems,
      totalPages: 1,
    });

    renderApp();

    const input = screen.getByLabelText('Search');
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'uhura' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchCharacters).toHaveBeenCalledWith('uhura', 1);
      expect(screen.getByText('Uhura')).toBeInTheDocument();
    });
  });

  it('shows error boundary fallback when "Test error" button is clicked', async () => {
    const { ErrorBoundary } = await import('./components/ErrorBoundary');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Provider
          store={configureStore({
            reducer: {
              selectedItems: selectedItemsReducer,
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

    const errorButton = screen.getByRole('button', { name: /test error/i });
    fireEvent.click(errorButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('renders the About page from navigation', async () => {
    vi.mocked(fetchCharacters).mockResolvedValueOnce({
      items: [],
      totalPages: 1,
    });

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
    const mockItems = [{ detailsId: '1', id: '1', name: 'Spock', description: 'Vulcan' }];
    vi.mocked(fetchCharacters).mockResolvedValueOnce({
      items: mockItems,
      totalPages: 3,
    });
    vi.mocked(fetchCharacters).mockResolvedValueOnce({
      items: mockItems,
      totalPages: 3,
    });

    renderApp(['/?page=2']);

    await waitFor(() => {
      expect(fetchCharacters).toHaveBeenCalledWith('', 2);
    });

    expect(screen.getByRole('button', { current: 'page' })).toHaveTextContent(
      '2'
    );

    fireEvent.click(screen.getByRole('button', { name: '3' }));

    await waitFor(() => {
      expect(fetchCharacters).toHaveBeenCalledWith('', 3);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { current: 'page' })).toHaveTextContent(
        '3'
      );
    });
  });

  it('opens and closes character details from the results list', async () => {
    const mockItems = [{ detailsId: 'spock', id: 'spock', name: 'Spock', description: 'Vulcan' }];
    vi.mocked(fetchCharacters).mockResolvedValueOnce({
      items: mockItems,
      totalPages: 1,
    });
    vi.mocked(fetchCharacterDetails).mockResolvedValueOnce({
      birthYear: '2230',
      deathYear: 'unknown',
      description: 'Gender: Male. Birth year: 2230. Death year: unknown.',
      detailsId: 'spock',
      gender: 'Male',
      id: 'spock',
      name: 'Spock',
    });
    vi.mocked(fetchCharacterDetails).mockResolvedValueOnce({
      birthYear: '2230',
      deathYear: 'unknown',
      description: 'Gender: Male. Birth year: 2230. Death year: unknown.',
      detailsId: 'spock',
      gender: 'Male',
      id: 'spock',
      name: 'Spock',
    });

    renderApp(['/?page=2']);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Spock' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /view details/i }));

    expect(screen.getByRole('status')).toHaveTextContent('Loading details...');

    await waitFor(() => {
      expect(fetchCharacterDetails).toHaveBeenCalledWith('spock');
    });

    expect(
      screen.getByRole('complementary', { name: /character details/i })
    ).toBeInTheDocument();

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
    const mockItems = [{ detailsId: 'spock', id: 'spock', name: 'Spock', description: 'Vulcan' }];
    vi.mocked(fetchCharacters).mockResolvedValue({
      items: mockItems,
      totalPages: 1,
    });

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
    const mockItems = [
      { detailsId: 'spock', id: 'spock', name: 'Spock', description: 'Vulcan' },
      { detailsId: 'kirk', id: 'kirk', name: 'Kirk', description: 'Captain' },
    ];
    vi.mocked(fetchCharacters).mockResolvedValueOnce({
      items: mockItems,
      totalPages: 1,
    });

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
