import type { FunctionComponent } from 'react';
import { Outlet } from 'react-router';

import { AppSidebar } from './AppSidebar';

export const Layout: FunctionComponent = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60 p-6">
        <Outlet />
      </main>
    </div>
  );
};
