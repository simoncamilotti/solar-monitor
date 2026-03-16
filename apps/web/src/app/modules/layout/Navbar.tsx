import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router';

import { RouteNames, RoutePaths } from '../../routes/paths.const';
import { logout } from '../auth/auth';
import { Braces } from '../ui/Braces';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

export const Navbar: FunctionComponent = () => {
  const { t } = useTranslation('web');

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/50 glass-nav no-print">
      <div className="max-w-7xl mx-auto h-14 flex items-center justify-between">
        <Link to={generatePath(RoutePaths.HOME)}>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            <Braces />
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to={generatePath(RoutePaths.HOME)}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {t(RouteNames.HOME)}
          </Link>

          <Link
            to={generatePath(RoutePaths.SETTINGS)}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {t(RouteNames.SETTINGS)}
          </Link>

          <LanguageSwitcher />

          <button
            onClick={() => logout()}
            className="text-[13px] px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </nav>
  );
};
