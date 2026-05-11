import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Loader } from './Loader';

describe('Loader', () => {
  it('displays an accessible loading status', () => {
    render(<Loader />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });
});
