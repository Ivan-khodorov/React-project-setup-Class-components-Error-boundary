'use client';

import { useTheme } from '../context/useTheme';
import type { Theme } from '../context/themeContextValue';

const themes: Theme[] = ['light', 'dark'];

interface ThemeSelectorProps {
  translations?: {
    dark: string;
    label: string;
    light: string;
    selection: string;
  };
}

const defaultTranslations = {
  dark: 'Dark',
  label: 'Theme',
  light: 'Light',
  selection: 'Theme selection',
};

export function ThemeSelector({
  translations = defaultTranslations,
}: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset
      className="theme-selector"
      aria-label={translations.selection}
    >
      <legend className="theme-selector__legend">
        {translations.label}
      </legend>
      {themes.map((themeOption) => (
        <label
          className={
            theme === themeOption
              ? 'theme-selector__option theme-selector__option--active'
              : 'theme-selector__option'
          }
          key={themeOption}
        >
          <input
            checked={theme === themeOption}
            name="theme"
            type="radio"
            value={themeOption}
            onChange={() => setTheme(themeOption)}
          />
          <span>{translations[themeOption]}</span>
        </label>
      ))}
    </fieldset>
  );
}
