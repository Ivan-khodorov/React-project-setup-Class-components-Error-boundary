import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('displays the item name and description', () => {
    const onSelectItem = vi.fn();

    render(
      <Card
        item={{
          id: 'spock',
          name: 'Spock',
          description: 'Science officer aboard the USS Enterprise.',
        }}
        onSelectItem={onSelectItem}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Spock' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Science officer aboard the USS Enterprise.')
    ).toBeInTheDocument();

    screen.getByRole('button', { name: /view details/i }).click();

    expect(onSelectItem).toHaveBeenCalledWith('spock');
  });
});
