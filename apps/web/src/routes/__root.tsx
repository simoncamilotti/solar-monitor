import { Toaster } from '@repo/ui/components/sonner';
import {
  createRootRouteWithContext,
  type ErrorComponentProps,
  Navigate,
  Outlet,
} from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { RouterContext } from '../router.js';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  // An unknown path lands on the dashboard.
  notFoundComponent: () => <Navigate to="/" />,
  errorComponent: RouteError,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="bottom-right" />
    </>
  );
}

function RouteError({ error }: ErrorComponentProps) {
  const { t } = useTranslation();
  console.error(error);
  return <p className="p-6 text-destructive">{t('errors.generic')}</p>;
}
