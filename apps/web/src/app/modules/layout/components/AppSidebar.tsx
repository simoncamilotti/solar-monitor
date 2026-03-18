import type { FunctionComponent } from 'react';

import { SidebarFooter } from './SidebarFooter';
import { SidebarLanguageSwitcher } from './SidebarLanguageSwitcher';
import { SidebarLogo } from './SidebarLogo';
import { SidebarNav } from './SidebarNav';
import { SidebarThemeToggle } from './SidebarThemeToggle';

export const AppSidebar: FunctionComponent = () => (
  <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar flex flex-col z-50">
    <SidebarLogo />
    <SidebarNav />
    <SidebarLanguageSwitcher />
    <SidebarThemeToggle />
    <SidebarFooter />
  </aside>
);
