import { Languages, LogOut, Moon, Sun } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';

import { LANGUAGES } from '../../../i18n/i18n.js';
import { Logo } from '../../ui/logo.js';
import { useTheme } from '../hooks/use-theme.hook.js';

const iconButton =
  'w-11 h-11 flex items-center justify-center rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-smooth';

/** Top bar below 768 px: the logo, and the sidebar actions that are not pages. */
export const MobileHeader: FunctionComponent = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const auth = useAuth();
  const nextLanguage = LANGUAGES.find((language) => language !== i18n.language) ?? 'fr';

  return (
    <header className="md:hidden sticky top-0 z-50 flex items-center gap-2 bg-sidebar px-4 py-2">
      <Logo />
      <span className="flex-1 text-sm font-semibold text-sidebar-foreground">
        {t('sidebar.title')}
      </span>
      <button
        type="button"
        onClick={() => void i18n.changeLanguage(nextLanguage)}
        aria-label={t(`language.${nextLanguage}`)}
        className={iconButton}
      >
        <Languages className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
        className={iconButton}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={() => void auth.signoutRedirect()}
        aria-label={t('sidebar.nav.logout')}
        className={iconButton}
      >
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  );
};
