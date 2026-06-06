import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CountryAutocomplete } from './CountryAutocomplete';

const countries = [
  'Canada',
  'France',
  'Germany',
  'South Africa',
  'United Kingdom',
  'United States',
];

describe('CountryAutocomplete', () => {
  it('renders a limited-height country list and selects a country', () => {
    const onValueChange = vi.fn();

    render(
      <>
        <label htmlFor="country">Country</label>
        <CountryAutocomplete
          countries={countries}
          id="country"
          onValueChange={onValueChange}
        />
      </>
    );

    fireEvent.focus(screen.getByLabelText('Country'));

    expect(screen.getByRole('listbox')).toHaveClass(
      'country-autocomplete__list'
    );
    expect(screen.getByRole('option', { name: 'South Africa' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'South Africa' }));

    expect(screen.getByLabelText('Country')).toHaveValue('South Africa');
    expect(onValueChange).toHaveBeenLastCalledWith('South Africa');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('filters country options by typed text', () => {
    render(
      <>
        <label htmlFor="country">Country</label>
        <CountryAutocomplete countries={countries} id="country" />
      </>
    );

    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'United' },
    });

    expect(
      screen.getByRole('option', { name: 'United Kingdom' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'United States' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Canada' })).not.toBeInTheDocument();
  });
});
