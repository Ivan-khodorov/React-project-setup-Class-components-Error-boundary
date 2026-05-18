import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders current page and handles page changes', () => {
    const onPageChange = vi.fn();

    render(
      <Pagination currentPage={2} onPageChange={onPageChange} totalPages={3} />
    );

    expect(screen.getByRole('button', { current: 'page' })).toHaveTextContent(
      '2'
    );

    screen.getByRole('button', { name: /previous/i }).click();
    screen.getByRole('button', { name: /next/i }).click();
    screen.getByRole('button', { name: '1' }).click();

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(3, 1);
  });

  it('disables boundary navigation buttons', () => {
    const onPageChange = vi.fn();

    const { rerender } = render(
      <Pagination currentPage={1} onPageChange={onPageChange} totalPages={3} />
    );

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();

    rerender(
      <Pagination currentPage={3} onPageChange={onPageChange} totalPages={3} />
    );

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('renders a compact page range with gaps', () => {
    render(
      <Pagination currentPage={50} onPageChange={vi.fn()} totalPages={162} />
    );

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '49' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '51' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '162' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '80' })).not.toBeInTheDocument();
    expect(screen.getAllByText('...')).toHaveLength(2);
  });
});
