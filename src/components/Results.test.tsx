import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { Results } from './Results';
import { selectedItemsReducer } from '../store/selectedItemsSlice';

const renderWithStore = (ui: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      selectedItems: selectedItemsReducer,
    },
  });

  return render(<Provider store={store}>{ui}</Provider>);
};

describe('Results', () => {
  it('displays the loading state', () => {
    renderWithStore(
      <Results
        currentPage={1}
        error=""
        isLoading={true}
        items={[]}
        onPageChange={vi.fn()}
        onRefresh={vi.fn()}
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

  it('displays items and calls the error callback without bubbling the click', () => {
    const onThrowError = vi.fn();
    const onRefresh = vi.fn();
    const onContainerClick = vi.fn();

    renderWithStore(
      <div onClick={onContainerClick}>
        <Results
          currentPage={1}
          error=""
          isLoading={false}
          items={[
            {
              detailsId: 'spock',
              id: 'spock',
              name: 'Spock',
              description: 'Science officer aboard the USS Enterprise.',
            },
          ]}
          onPageChange={vi.fn()}
          onRefresh={onRefresh}
          onSelectItem={vi.fn()}
          onThrowError={onThrowError}
          totalPages={1}
        />
      </div>
    );

    expect(
      screen.getByRole('heading', { name: 'Spock' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Science officer aboard the USS Enterprise.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /test error/i }));

    expect(onThrowError).toHaveBeenCalledTimes(1);
    expect(onContainerClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('displays the error state', () => {
    renderWithStore(
      <Results
        currentPage={1}
        error="Unable to load characters."
        isLoading={false}
        items={[]}
        onPageChange={vi.fn()}
        onRefresh={vi.fn()}
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

    renderWithStore(
      <Results
        currentPage={2}
        error=""
        isLoading={false}
        items={[
          {
            detailsId: 'spock',
            id: 'spock',
            name: 'Spock',
            description: 'Science officer aboard the USS Enterprise.',
          },
        ]}
        onPageChange={onPageChange}
        onRefresh={vi.fn()}
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
