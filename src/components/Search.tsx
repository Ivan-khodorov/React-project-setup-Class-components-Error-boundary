import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SEARCH_STORAGE_KEY = 'searchTerm';

interface SearchProps {
  currentSearchTerm: string;
  onInitialSearchTerm: (searchTerm: string) => void;
  onSearch: (searchTerm: string) => void;
}

export function Search({
  currentSearchTerm,
  onInitialSearchTerm,
  onSearch,
}: SearchProps) {
  const [savedSearchTerm, setSavedSearchTerm] = useLocalStorage(
    SEARCH_STORAGE_KEY,
    ''
  );
  const initialSearchTerm = useRef(savedSearchTerm);
  const didRunInitialSearch = useRef(false);
  const [value, setValue] = useState(savedSearchTerm);

  useEffect(() => {
    if (didRunInitialSearch.current) {
      return;
    }

    didRunInitialSearch.current = true;
    onInitialSearchTerm(initialSearchTerm.current);
  }, [onInitialSearchTerm]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedValue = value.trim();

    if (trimmedValue === currentSearchTerm) {
      return;
    }

    setSavedSearchTerm(trimmedValue);
    setValue(trimmedValue);
    onSearch(trimmedValue);
  };

  return (
    <section className="search-section">
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          aria-label="Search"
          type="search"
          value={value}
          onChange={handleChange}
        />
        <button type="submit">Search</button>
      </form>
    </section>
  );
}
