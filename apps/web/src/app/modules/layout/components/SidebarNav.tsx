import { Sun } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

export const SidebarNav: FunctionComponent = () => {
  const { t } = useTranslation('web');
  const navItems = [{ icon: Sun, label: t('sidebar.nav.home'), to: '/' }];

  return (
    <nav className="flex-1 px-3 mt-4 space-y-1">
      {navItems.map(item => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth ${
              isActive
                ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent'
            }`
          }
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};
