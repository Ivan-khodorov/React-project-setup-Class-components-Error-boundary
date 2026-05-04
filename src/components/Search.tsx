import { Component, type ChangeEvent, type FormEvent } from 'react';

const SEARCH_STORAGE_KEY = 'searchTerm';

interface SearchState {
  value: string;
}

interface SearchProps {
  currentSearchTerm: string;
  onInitialSearchTerm: (searchTerm: string) => void;
  onSearch: (searchTerm: string) => void;
}

export class Search extends Component<SearchProps, SearchState> {
  state: SearchState = {
    value: '',
  };

  componentDidMount() {
    const savedSearchTerm =
      window.localStorage.getItem(SEARCH_STORAGE_KEY) ?? '';

    this.setState({ value: savedSearchTerm });
    this.props.onInitialSearchTerm(savedSearchTerm);
  }

  handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: event.target.value });
  };

  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedValue = this.state.value.trim();

    if (trimmedValue === this.props.currentSearchTerm) {
      return;
    }

    window.localStorage.setItem(SEARCH_STORAGE_KEY, trimmedValue);
    this.setState({ value: trimmedValue });
    this.props.onSearch(trimmedValue);
  };

  render() {
    return (
      <section className="search-section">
        <form className="search-form" onSubmit={this.handleSubmit}>
          <input
            aria-label="Search"
            type="search"
            value={this.state.value}
            onChange={this.handleChange}
          />
          <button type="submit">Search</button>
        </form>
      </section>
    );
  }
}
