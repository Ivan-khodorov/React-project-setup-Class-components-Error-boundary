import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('displays an alert with the error message', () => {
    render(<ErrorMessage message="Unable to load characters." />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load characters.'
    );
  });
});
