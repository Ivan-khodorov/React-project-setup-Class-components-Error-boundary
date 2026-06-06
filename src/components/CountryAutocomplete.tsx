import { useId, useMemo, useState } from 'react';

interface CountryAutocompleteProps {
  countries: string[];
  defaultValue?: string;
  id: string;
  name?: string;
  onBlur?: () => void;
  onValueChange?: (value: string) => void;
  value?: string;
}

const maxVisibleCountries = 60;

export function CountryAutocomplete({
  countries,
  defaultValue = '',
  id,
  name,
  onBlur,
  onValueChange,
  value,
}: CountryAutocompleteProps) {
  const generatedListId = useId();
  const [query, setQuery] = useState('');
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const isControlled = value !== undefined;
  const visibleQuery = isControlled ? value : query;
  const listId = `${id}-${generatedListId}-listbox`;
  const filteredCountries = useMemo(() => {
    const normalizedQuery = visibleQuery.trim().toLowerCase();
    const matches = normalizedQuery
      ? countries.filter((country) =>
          country.toLowerCase().includes(normalizedQuery)
        )
      : countries;

    return matches.slice(0, maxVisibleCountries);
  }, [countries, visibleQuery]);

  const updateValue = (nextValue: string) => {
    if (!isControlled) {
      setQuery(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const selectCountry = (country: string) => {
    if (!isControlled) {
      setSelectedValue(country);
    }

    updateValue(country);
    setIsOpen(false);
  };

  return (
    <div className="country-autocomplete">
      <input
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={isOpen}
        autoComplete="off"
        defaultValue={isControlled ? undefined : selectedValue}
        id={id}
        key={isControlled ? 'controlled-country' : selectedValue}
        name={name}
        role="combobox"
        type="text"
        value={isControlled ? value : undefined}
        onBlur={() => {
          setIsOpen(false);
          onBlur?.();
        }}
        onChange={(event) => {
          updateValue(event.currentTarget.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && filteredCountries.length > 0 && (
        <ul className="country-autocomplete__list" id={listId} role="listbox">
          {filteredCountries.map((country) => (
            <li key={country} role="presentation">
              <button
                className="country-autocomplete__option"
                role="option"
                type="button"
                onClick={() => selectCountry(country)}
                onMouseDown={(event) => event.preventDefault()}
              >
                {country}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
