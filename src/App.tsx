import { Component } from 'react';
import './App.css';
import { Search } from './components/Search';
import { Results } from './components/Results';
import { fetchCharacters } from './services/starTrekCharactersApi';
import type { Item } from './types';

interface AppState {
  error: string;
  isLoading: boolean;
  items: Item[];
  latestRequestId: number;
  searchTerm: string;
  shouldThrowError: boolean;
}

export default class App extends Component<object, AppState> {
  state: AppState = {
    error: '',
    isLoading: false,
    items: [],
    latestRequestId: 0,
    searchTerm: '',
    shouldThrowError: false,
  };

  async loadCharacters(searchTerm: string) {
    const requestId = this.state.latestRequestId + 1;

    this.setState({
      error: '',
      isLoading: true,
      latestRequestId: requestId,
    });

    try {
      const items = await fetchCharacters(searchTerm);

      if (requestId !== this.state.latestRequestId) {
        return;
      }

      this.setState({
        items,
        isLoading: false,
      });
    } catch (error) {
      if (requestId !== this.state.latestRequestId) {
        return;
      }

      const message =
        error instanceof Error ? error.message : 'Failed to load results.';

      this.setState({
        error: message,
        isLoading: false,
        items: [],
      });
    }
  }

  handleSearch = (searchTerm: string) => {
    this.setState({ searchTerm });
    void this.loadCharacters(searchTerm);
  };

  handleInitialSearchTerm = (searchTerm: string) => {
    this.setState({ searchTerm });
    void this.loadCharacters(searchTerm);
  };

  handleThrowError = () => {
    this.setState({ shouldThrowError: true });
  };

  render() {
    if (this.state.shouldThrowError) {
      throw new Error('Test application error');
    }

    return (
      <main className="app">
        <Search
          currentSearchTerm={this.state.searchTerm}
          onInitialSearchTerm={this.handleInitialSearchTerm}
          onSearch={this.handleSearch}
        />
        <Results
          error={this.state.error}
          isLoading={this.state.isLoading}
          items={this.state.items}
          onThrowError={this.handleThrowError}
        />
      </main>
    );
  }
}
