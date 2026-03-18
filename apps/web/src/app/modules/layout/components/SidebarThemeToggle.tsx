import { Moon, Sun } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../hooks/use-theme.hook';

export const SidebarThemeToggle: FunctionComponent = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation('web');

  return (
    <div className="px-3 mb-2">
      <button
        onClick={toggleTheme}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-smooth w-full"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        {theme === 'dark' ? t('theme.light') : t('theme.dark')}
      </button>
    </div>
  );
};
