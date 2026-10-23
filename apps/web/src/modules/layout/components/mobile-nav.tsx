import { Calendar, GitCompare, LayoutDashboard, Settings } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';

/** Bottom navigation below 768 px, where the sidebar does not fit. */
export const MobileNav: FunctionComponent = () => {
  const { t } = useTranslation();
  const navItems = [
    { icon: LayoutDashboard, label: t('sidebar.nav.home'), to: '/' },
    { icon: GitCompare, label: t('sidebar.nav.compare'), to: '/compare' },
    { icon: Calendar, label: t('sidebar.nav.history'), to: '/history' },
    { icon: Settings, label: t('sidebar.nav.settings'), to: '/settings' },
  ] as const;

  return (
    <nav
      aria-label={t('sidebar.nav.label')}
      className="md:hidden fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-card px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to === '/' }}
          className="flex-1 min-h-13 flex flex-col items-center justify-center gap-1 rounded-lg text-[11px] transition-smooth"
          activeProps={{ className: 'text-primary-text font-semibold', 'aria-current': 'page' }}
          inactiveProps={{ className: 'text-muted-foreground hover:text-foreground' }}
        >
          <item.icon className="w-5 h-5" aria-hidden="true" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
