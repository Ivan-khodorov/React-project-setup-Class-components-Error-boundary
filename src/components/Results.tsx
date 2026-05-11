import { Component } from 'react';
import { Card } from './Card';
import { ErrorMessage } from './ErrorMessage';
import { Loader } from './Loader';
import type { Item } from '../types';

interface ResultsProps {
  error: string;
  isLoading: boolean;
  items: Item[];
  onThrowError: () => void;
}

export class Results extends Component<ResultsProps> {
  renderTestButton() {
    return (
      <button
        className="test-error-button"
        type="button"
        onClick={this.props.onThrowError}
      >
        Test error
      </button>
    );
  }

  render() {
    if (this.props.isLoading) {
      return (
        <section className="results-section">
          <Loader />
          {this.renderTestButton()}
        </section>
      );
    }

    if (this.props.error) {
      return (
        <section className="results-section">
          <ErrorMessage message={this.props.error} />
          {this.renderTestButton()}
        </section>
      );
    }

    return (
      <section className="results-section">
        {this.props.items.map((item) => (
          <Card key={item.id} item={item} />
        ))}
        {this.renderTestButton()}
      </section>
    );
  }
}
