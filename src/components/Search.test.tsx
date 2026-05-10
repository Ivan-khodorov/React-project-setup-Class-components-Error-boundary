import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Search } from './Search';

describe('Search', () => {
  it('renders search input and submit button', () => {
    render(
      <Search
        currentSearchTerm=""
        onInitialSearchTerm={vi.fn()}
        onSearch={vi.fn()}
      />
    );

    expect(
      screen.getByRole('searchbox', { name: /search/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /search/i })
    ).toBeInTheDocument();
  });

  it('keeps the search input empty when localStorage has no saved term', () => {
    const onInitialSearchTerm = vi.fn();

    render(
      <Search
        currentSearchTerm=""
        onInitialSearchTerm={onInitialSearchTerm}
        onSearch={vi.fn()}
      />
    );

    expect(screen.getByRole('searchbox', { name: /search/i })).toHaveValue('');
    expect(onInitialSearchTerm).toHaveBeenCalledWith('');
  });

  it('loads a saved search term from localStorage on mount', () => {
    const onInitialSearchTerm = vi.fn();

    window.localStorage.setItem('searchTerm', 'spock');

    render(
      <Search
        currentSearchTerm=""
        onInitialSearchTerm={onInitialSearchTerm}
        onSearch={vi.fn()}
      />
    );

    expect(screen.getByRole('searchbox', { name: /search/i })).toHaveValue(
      'spock'
    );
    expect(onInitialSearchTerm).toHaveBeenCalledWith('spock');
  });

  it('updates the search input value when the user types', () => {
    render(
      <Search
        currentSearchTerm=""
        onInitialSearchTerm={vi.fn()}
        onSearch={vi.fn()}
      />
    );

    const searchInput = screen.getByRole('searchbox', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'kirk' } });

    expect(searchInput).toHaveValue('kirk');
  });

  it('trims and saves the search term on form submit', () => {
    const onSearch = vi.fn();

    render(
      <Search
        currentSearchTerm=""
        onInitialSearchTerm={vi.fn()}
        onSearch={onSearch}
      />
    );

    const searchInput = screen.getByRole('searchbox', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: '  uhura  ' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith('uhura');
    expect(window.localStorage.getItem('searchTerm')).toBe('uhura');
    expect(searchInput).toHaveValue('uhura');
  });

  it('does not search again when the submitted term matches the current term', () => {
    const onSearch = vi.fn();

    render(
      <Search
        currentSearchTerm="spock"
        onInitialSearchTerm={vi.fn()}
        onSearch={onSearch}
      />
    );

    const searchInput = screen.getByRole('searchbox', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'spock' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('searchTerm')).toBeNull();
    expect(searchInput).toHaveValue('spock');
  });
});
