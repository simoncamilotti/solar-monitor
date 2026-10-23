import type { FunctionComponent } from 'react';
import { Outlet } from '@tanstack/react-router';

import { AppSidebar } from './app-sidebar.js';
import { MobileHeader } from './mobile-header.js';
import { MobileNav } from './mobile-nav.js';

export const Layout: FunctionComponent = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileHeader />
      <main className="md:ml-60 p-4 pb-24 md:p-6">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};
