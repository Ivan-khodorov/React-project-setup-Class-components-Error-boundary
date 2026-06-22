import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

describe('ThemeProvider', () => {
  it('sets light theme by default', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'light' }).closest('.theme-root')
    ).toHaveAttribute('data-theme', 'light');
  });

  it('switches theme through context', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'light' }));

    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'dark' }).closest('.theme-root')
    ).toHaveAttribute('data-theme', 'dark');
  });
});
