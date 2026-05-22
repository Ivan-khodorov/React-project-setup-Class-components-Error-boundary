import { useTheme } from '../context/useTheme';
import type { Theme } from '../context/themeContextValue';

const themes: Theme[] = ['light', 'dark'];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="theme-selector" aria-label="Theme selection">
      <legend>Theme</legend>
      {themes.map((themeOption) => (
        <label key={themeOption}>
          <input
            checked={theme === themeOption}
            name="theme"
            type="radio"
            value={themeOption}
            onChange={() => setTheme(themeOption)}
          />
          {themeOption}
        </label>
      ))}
    </fieldset>
  );
}
