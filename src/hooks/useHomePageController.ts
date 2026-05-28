import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  getCharactersListCacheId,
  starTrekCharactersApi,
  useGetCharactersQuery,
  type StarTrekApiError,
} from '../services/starTrekCharactersApi';
import { useAppDispatch } from '../store/hooks';

interface HomePageState {
  hasInitializedSearch: boolean;
  searchTerm: string;
  shouldThrowError: boolean;
}

const PAGE_PARAM = 'page';
const DETAILS_PARAM = 'details';

const getValidPage = (pageValue: string | null): number => {
  const page = Number(pageValue);

  return Number.isInteger(page) && page > 0 ? page : 1;
};

export function useHomePageController() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = getValidPage(searchParams.get(PAGE_PARAM));
  const [state, setState] = useState<HomePageState>({
    hasInitializedSearch: false,
    searchTerm: '',
    shouldThrowError: false,
  });
  const charactersQueryArgs = useMemo(
    () => ({
      page: currentPage,
      searchTerm: state.searchTerm,
    }),
    [currentPage, state.searchTerm]
  );
  const charactersQuery = useGetCharactersQuery(charactersQueryArgs, {
    skip: !state.hasInitializedSearch,
  });
  const charactersError = charactersQuery.error as StarTrekApiError | undefined;
  const items = charactersQuery.data?.items ?? [];
  const totalPages = charactersQuery.data?.totalPages ?? 0;
  const isLoading = charactersQuery.isLoading && !charactersQuery.data;
  const error = charactersError?.message ?? '';

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

  const handleSearch = useCallback(
    (searchTerm: string) => {
      setState((prevState) => ({
        ...prevState,
        hasInitializedSearch: true,
        searchTerm,
      }));
      updatePageParam(1);
    },
    [updatePageParam]
  );

  const handleInitialSearchTerm = useCallback(
    (searchTerm: string) => {
      setState((prevState) => ({
        ...prevState,
        hasInitializedSearch: true,
        searchTerm,
      }));
      updatePageParam(currentPage);
    },
    [currentPage, updatePageParam]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams);
        nextSearchParams.set(PAGE_PARAM, String(page));

        return nextSearchParams;
      });
    },
    [setSearchParams]
  );

  const handleRefreshCharacters = useCallback(() => {
    dispatch(
      starTrekCharactersApi.util.invalidateTags([
        {
          type: 'CharactersList',
          id: getCharactersListCacheId(charactersQueryArgs),
        },
      ])
    );
  }, [charactersQueryArgs, dispatch]);

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

  const handleCloseDetails = useCallback(() => {
    setSearchParams((prevSearchParams) => {
      const nextSearchParams = new URLSearchParams(prevSearchParams);
      nextSearchParams.delete(DETAILS_PARAM);

      return nextSearchParams;
    });
  }, [setSearchParams]);

  const handleThrowError = useCallback(() => {
    setState((prevState) => ({ ...prevState, shouldThrowError: true }));
  }, []);

  return {
    currentPage,
    error,
    isDetailsOpen: Boolean(searchParams.get(DETAILS_PARAM)),
    isLoading,
    items,
    onCloseDetails: handleCloseDetails,
    onInitialSearchTerm: handleInitialSearchTerm,
    onPageChange: handlePageChange,
    onRefreshCharacters: handleRefreshCharacters,
    onSearch: handleSearch,
    onSelectItem: handleSelectItem,
    onThrowError: handleThrowError,
    searchTerm: state.searchTerm,
    shouldThrowError: state.shouldThrowError,
    totalPages,
  };
}
