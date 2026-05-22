import { useTheme } from '../context/useTheme';
import type { Theme } from '../context/themeContextValue';

const themes: Theme[] = ['light', 'dark'];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="theme-selector" aria-label="Theme selection">
      <legend className="theme-selector__legend">Theme</legend>
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
          <span>{themeOption}</span>
        </label>
      ))}
    </fieldset>
  );
}
