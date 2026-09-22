import type { ReactElement } from 'react';
import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { redirect } from 'react-router';

import { isAuthenticated, login } from '../modules/auth/auth';
import { Layout } from '../modules/layout/components/Layout';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { RoutePaths } from './paths.const';

// Each page pulls its own heavy dependencies (echarts, ag-grid...): loading them on demand, per
// route, keeps the first paint from paying for every page's dependencies at once.
const ComparePage = lazy(() => import('../pages/ComparePage').then(m => ({ default: m.ComparePage })));
const HistoryPage = lazy(() => import('../pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const HomePage = lazy(() => import('../pages/HomePage').then(m => ({ default: m.HomePage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

const withSuspense = (element: ReactElement): ReactElement => (
  <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>
);

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    hydrateFallbackElement: <div>Loading...</div>,
    loader: async ({ request }) => {
      if (!isAuthenticated()) {
        await login(request.url);
      }

      return null;
    },
    children: [
      {
        path: RoutePaths.HOME,
        element: withSuspense(<HomePage />),
      },
      {
        path: RoutePaths.COMPARE,
        element: withSuspense(<ComparePage />),
      },
      {
        path: RoutePaths.HISTORY,
        element: withSuspense(<HistoryPage />),
      },
      {
        path: RoutePaths.SETTINGS,
        element: withSuspense(<SettingsPage />),
      },
    ],
  },
  // Deliberately outside the `Layout` route above: it carries the auth-gate loader that redirects
  // to Keycloak when unauthenticated, which would bounce a session-expired visitor straight back
  // into a login loop instead of letting them see why they landed here.
  {
    path: RoutePaths.ERROR_FORBIDDEN,
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    loader: () => redirect(RoutePaths.HOME),
  },
];
