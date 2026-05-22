import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../context/ThemeProvider';
import { ThemeSelector } from './ThemeSelector';

const renderThemeSelector = () =>
  render(
    <ThemeProvider>
      <ThemeSelector />
    </ThemeProvider>
  );

describe('ThemeSelector', () => {
  it('renders accessible theme options', () => {
    renderThemeSelector();

    expect(
      screen.getByRole('group', { name: /theme selection/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /light/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /dark/i })).not.toBeChecked();
  });

  it('changes selected theme', () => {
    renderThemeSelector();

    fireEvent.click(screen.getByRole('radio', { name: /dark/i }));

    expect(screen.getByRole('radio', { name: /dark/i })).toBeChecked();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
});
