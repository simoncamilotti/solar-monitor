import { LogOut, Settings } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

import { logout } from '../../auth/auth';

export const SidebarFooter: FunctionComponent = () => {
  const { t } = useTranslation('web');

  return (
    <div className="px-3 pb-4 space-y-1">
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth w-full ${
            isActive
              ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
              : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent'
          }`
        }
      >
        <Settings className="w-4 h-4" />
        {t('sidebar.nav.settings')}
      </NavLink>
      <button
        onClick={() => logout()}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-smooth w-full"
      >
        <LogOut className="w-4 h-4" />
        {t('sidebar.nav.logout')}
      </button>
    </div>
  );
};
