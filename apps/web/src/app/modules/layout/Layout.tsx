import type { FunctionComponent, ReactNode } from 'react';
import { Outlet } from 'react-router';

import { Toaster } from '../ui/Sonner';
import { Footer } from './Footer';

type LayoutProps = {
  navBar: ReactNode;
};

export const Layout: FunctionComponent<LayoutProps> = ({ navBar }) => {
  return (
    <div className="dark min-h-screen bg-background">
      {navBar}
      <div className="max-w-7xl mx-auto min-h-[calc(100vh-100.5px)] pt-[57px] pb-12">
        <Outlet />
      </div>
      <Footer />
      <Toaster />
    </div>
  );
};
