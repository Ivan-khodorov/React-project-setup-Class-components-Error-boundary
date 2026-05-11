import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Results } from './Results';

describe('Results', () => {
  it('displays the loading state', () => {
    render(
      <Results
        error=""
        isLoading={true}
        items={[]}
        onThrowError={vi.fn()}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    expect(
      screen.getByRole('button', { name: /test error/i })
    ).toBeInTheDocument();
  });

  it('displays items and calls the error callback', () => {
    const onThrowError = vi.fn();

    render(
      <Results
        error=""
        isLoading={false}
        items={[
          {
            id: 'spock',
            name: 'Spock',
            description: 'Science officer aboard the USS Enterprise.',
          },
        ]}
        onThrowError={onThrowError}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Spock' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Science officer aboard the USS Enterprise.')
    ).toBeInTheDocument();

    screen.getByRole('button', { name: /test error/i }).click();

    expect(onThrowError).toHaveBeenCalledTimes(1);
  });

  it('displays the error state', () => {
    render(
      <Results
        error="Unable to load characters."
        isLoading={false}
        items={[]}
        onThrowError={vi.fn()}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load characters.'
    );
    expect(
      screen.getByRole('button', { name: /test error/i })
    ).toBeInTheDocument();
  });
});
