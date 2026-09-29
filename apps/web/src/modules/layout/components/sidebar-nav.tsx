import { Calendar, GitCompare, Sun } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';

export const SidebarNav: FunctionComponent = () => {
  const { t } = useTranslation();
  const navItems = [
    { icon: Sun, label: t('sidebar.nav.home'), to: '/' },
    { icon: GitCompare, label: t('sidebar.nav.compare'), to: '/compare' },
    { icon: Calendar, label: t('sidebar.nav.history'), to: '/history' },
  ] as const;

  return (
    <nav className="flex-1 px-3 mt-4 space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          activeOptions={{ exact: item.to === '/' }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth"
          activeProps={{ className: 'bg-sidebar-accent text-sidebar-foreground font-medium' }}
          inactiveProps={{
            className: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
          }}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
