import { useCallback, useRef, useState } from 'react';
import { Link, Route, Routes, useSearchParams } from 'react-router';
import './App.css';
import { CharacterDetails } from './components/CharacterDetails';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { fetchCharacters } from './services/starTrekCharactersApi';
import type { Item } from './types';

interface AppState {
  error: string;
  isLoading: boolean;
  items: Item[];
  searchTerm: string;
  shouldThrowError: boolean;
  totalPages: number;
}

const PAGE_PARAM = 'page';
const DETAILS_PARAM = 'details';

const getValidPage = (pageValue: string | null): number => {
  const page = Number(pageValue);

  return Number.isInteger(page) && page > 0 ? page : 1;
};

export default function App() {
  const latestRequestId = useRef(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = getValidPage(searchParams.get(PAGE_PARAM));
  const [state, setState] = useState<AppState>({
    error: '',
    isLoading: false,
    items: [],
    searchTerm: '',
    shouldThrowError: false,
    totalPages: 0,
  });

  const updatePageParam = useCallback(
    (page: number) => {
      setSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams);
        nextSearchParams.set(PAGE_PARAM, String(page));

        return nextSearchParams;
      });
    },
    [setSearchParams]
  );

  const loadCharacters = useCallback(
    async (searchTerm: string, page: number) => {
      const requestId = latestRequestId.current + 1;

      latestRequestId.current = requestId;
      setState((prevState) => ({
        ...prevState,
        error: '',
        isLoading: true,
      }));

      try {
        const result = await fetchCharacters(searchTerm, page);

        if (requestId !== latestRequestId.current) {
          return;
        }

        setState((prevState) => ({
          ...prevState,
          items: result.items,
          isLoading: false,
          totalPages: result.totalPages,
        }));
      } catch (error) {
        if (requestId !== latestRequestId.current) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Failed to load results.';

        setState((prevState) => ({
          ...prevState,
          error: message,
          isLoading: false,
          items: [],
          totalPages: 0,
        }));
      }
    },
    []
  );

  const handleSearch = useCallback(
    (searchTerm: string) => {
      setState((prevState) => ({ ...prevState, searchTerm }));
      updatePageParam(1);
      void loadCharacters(searchTerm, 1);
    },
    [loadCharacters, updatePageParam]
  );

  const handleInitialSearchTerm = useCallback(
    (searchTerm: string) => {
      setState((prevState) => ({ ...prevState, searchTerm }));
      updatePageParam(currentPage);
      void loadCharacters(searchTerm, currentPage);
    },
    [currentPage, loadCharacters, updatePageParam]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams);
        nextSearchParams.set(PAGE_PARAM, String(page));

        return nextSearchParams;
      });
      void loadCharacters(state.searchTerm, page);
    },
    [loadCharacters, setSearchParams, state.searchTerm]
  );

  const handleSelectItem = useCallback(
    (itemId: string) => {
      setSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams);
        nextSearchParams.set(PAGE_PARAM, String(currentPage));
        nextSearchParams.set(DETAILS_PARAM, itemId);

        return nextSearchParams;
      });
    },
    [currentPage, setSearchParams]
  );

  const handleThrowError = useCallback(() => {
    setState((prevState) => ({ ...prevState, shouldThrowError: true }));
  }, []);

  if (state.shouldThrowError) {
    throw new Error('Test application error');
  }

  const homePage = (
    <HomePage
      currentPage={currentPage}
      error={state.error}
      isLoading={state.isLoading}
      items={state.items}
      onInitialSearchTerm={handleInitialSearchTerm}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      onSelectItem={handleSelectItem}
      onThrowError={handleThrowError}
      searchTerm={state.searchTerm}
      totalPages={state.totalPages}
    />
  );

  return (
    <div className="app">
      <header className="app-header">
        <nav className="app-nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={homePage}>
            <Route index element={<CharacterDetails />} />
          </Route>
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
