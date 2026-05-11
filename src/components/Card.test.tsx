import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('displays the item name and description', () => {
    render(
      <Card
        item={{
          id: 'spock',
          name: 'Spock',
          description: 'Science officer aboard the USS Enterprise.',
        }}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Spock' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Science officer aboard the USS Enterprise.')
    ).toBeInTheDocument();
  });
});
