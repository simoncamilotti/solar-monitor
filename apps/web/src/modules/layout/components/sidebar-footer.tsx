import { LogOut, Settings } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Link } from '@tanstack/react-router';

export const SidebarFooter: FunctionComponent = () => {
  const { t } = useTranslation();
  const auth = useAuth();

  return (
    <div className="px-3 pb-4 space-y-1">
      <Link
        to="/settings"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth w-full"
        activeProps={{ className: 'bg-sidebar-accent text-sidebar-foreground font-medium' }}
        inactiveProps={{
          className: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
        }}
      >
        <Settings className="w-4 h-4" />
        {t('sidebar.nav.settings')}
      </Link>
      <button
        onClick={() => void auth.signoutRedirect()}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-smooth w-full"
      >
        <LogOut className="w-4 h-4" />
        {t('sidebar.nav.logout')}
      </button>
    </div>
  );
};
