import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { CharacterDetails } from './CharacterDetails';
import { fetchCharacterDetails } from '../services/starTrekCharactersApi';

vi.mock('../services/starTrekCharactersApi', () => ({
  fetchCharacterDetails: vi.fn(),
}));

describe('CharacterDetails', () => {
  it('renders nothing when details param is absent', () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterDetails />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows loading and renders loaded character details', async () => {
    vi.mocked(fetchCharacterDetails).mockResolvedValueOnce({
      birthYear: '2230',
      deathYear: 'unknown',
      description: 'Gender: Male. Birth year: 2230. Death year: unknown.',
      gender: 'Male',
      id: 'spock',
      name: 'Spock',
    });

    render(
      <MemoryRouter initialEntries={['/?page=1&details=spock']}>
        <CharacterDetails />
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading details...');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Spock' })).toBeInTheDocument();
    });

    expect(fetchCharacterDetails).toHaveBeenCalledWith('spock');
    expect(screen.getByText('2230')).toBeInTheDocument();
  });

  it('closes the details panel', async () => {
    vi.mocked(fetchCharacterDetails).mockResolvedValueOnce({
      birthYear: '2230',
      deathYear: 'unknown',
      description: 'Gender: Male. Birth year: 2230. Death year: unknown.',
      gender: 'Male',
      id: 'spock',
      name: 'Spock',
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/?page=1&details=spock']}>
        <CharacterDetails />
      </MemoryRouter>
    );

    screen.getByRole('button', { name: /close/i }).click();

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
