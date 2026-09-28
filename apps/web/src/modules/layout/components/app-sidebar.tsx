import type { FunctionComponent } from 'react';

import { SidebarFooter } from './sidebar-footer.js';
import { SidebarLanguageSwitcher } from './sidebar-language-switcher.js';
import { SidebarLogo } from './sidebar-logo.js';
import { SidebarNav } from './sidebar-nav.js';
import { SidebarThemeToggle } from './sidebar-theme-toggle.js';

export const AppSidebar: FunctionComponent = () => (
  <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar flex flex-col z-50">
    <SidebarLogo />
    <SidebarNav />
    <SidebarLanguageSwitcher />
    <SidebarThemeToggle />
    <SidebarFooter />
  </aside>
);
