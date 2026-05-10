import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { fetchCharacters } from './services/starTrekCharactersApi';

vi.mock('./services/starTrekCharactersApi', () => ({
  fetchCharacters: vi.fn(),
}));

describe('App Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('loads initial search term from localStorage on mount', async () => {
    window.localStorage.setItem('searchTerm', 'spock');
    vi.mocked(fetchCharacters).mockResolvedValueOnce([]);

    render(<App />);

    expect(fetchCharacters).toHaveBeenCalledWith('spock');
    expect(screen.getByLabelText('Search')).toHaveValue('spock');
  });

  it('shows loading state and then renders results', async () => {
    const mockItems = [
      { id: '1', name: 'Spock', description: 'Vulcan' },
      { id: '2', name: 'Kirk', description: 'Captain' },
    ];
    vi.mocked(fetchCharacters).mockResolvedValueOnce(mockItems);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Spock')).toBeInTheDocument();
      expect(screen.getByText('Kirk')).toBeInTheDocument();
    });
  });

  it('shows error message when API call fails', async () => {
    vi.mocked(fetchCharacters).mockRejectedValueOnce(new Error('API Error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    });
  });

  it('executes full search flow: input -> click -> results', async () => {
    const mockItems = [{ id: '3', name: 'Uhura', description: 'Communications' }];
    vi.mocked(fetchCharacters).mockResolvedValueOnce([]); // для initial mount
    vi.mocked(fetchCharacters).mockResolvedValueOnce(mockItems); // для поиска

    render(<App />);

    const input = screen.getByLabelText('Search');
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'uhura' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchCharacters).toHaveBeenCalledWith('uhura');
      expect(screen.getByText('Uhura')).toBeInTheDocument();
    });
  });

  it('shows error boundary fallback when "Test error" button is clicked', async () => {
    const { ErrorBoundary } = await import('./components/ErrorBoundary');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <App />
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
});
