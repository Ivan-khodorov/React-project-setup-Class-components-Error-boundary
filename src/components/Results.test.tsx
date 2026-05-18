import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Results } from './Results';

describe('Results', () => {
  it('displays the loading state', () => {
    render(
      <Results
        currentPage={1}
        error=""
        isLoading={true}
        items={[]}
        onPageChange={vi.fn()}
        onSelectItem={vi.fn()}
        onThrowError={vi.fn()}
        totalPages={0}
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
        currentPage={1}
        error=""
        isLoading={false}
        items={[
          {
            id: 'spock',
            name: 'Spock',
            description: 'Science officer aboard the USS Enterprise.',
          },
        ]}
        onPageChange={vi.fn()}
        onSelectItem={vi.fn()}
        onThrowError={onThrowError}
        totalPages={1}
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
        currentPage={1}
        error="Unable to load characters."
        isLoading={false}
        items={[]}
        onPageChange={vi.fn()}
        onSelectItem={vi.fn()}
        onThrowError={vi.fn()}
        totalPages={0}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load characters.'
    );
    expect(
      screen.getByRole('button', { name: /test error/i })
    ).toBeInTheDocument();
  });

  it('displays pagination after items are loaded when multiple pages exist', () => {
    const onPageChange = vi.fn();

    render(
      <Results
        currentPage={2}
        error=""
        isLoading={false}
        items={[
          {
            id: 'spock',
            name: 'Spock',
            description: 'Science officer aboard the USS Enterprise.',
          },
        ]}
        onPageChange={onPageChange}
        onSelectItem={vi.fn()}
        onThrowError={vi.fn()}
        totalPages={3}
      />
    );

    expect(
      screen.getByRole('navigation', { name: /pagination/i })
    ).toBeInTheDocument();

    screen.getByRole('button', { name: '3' }).click();

    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
