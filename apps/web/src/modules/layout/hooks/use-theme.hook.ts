import { useTheme as useThemeSetting } from '@repo/ui/components/theme-provider';

import type { Theme } from '../theme.type.js';

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** The theme actually shown (`system` resolved) and a toggle between light and dark. */
export const useTheme = () => {
  const { theme: setting, setTheme } = useThemeSetting();
  const theme: Theme =
    setting === 'system'
      ? window.matchMedia(COLOR_SCHEME_QUERY).matches
        ? 'dark'
        : 'light'
      : setting;

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return { theme, toggleTheme };
};
