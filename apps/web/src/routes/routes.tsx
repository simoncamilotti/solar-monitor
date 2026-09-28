import type { ReactElement } from 'react';
import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { redirect } from 'react-router';

import { RequireAuth } from '../auth/require-auth.js';
import { Layout } from '../modules/layout/components/layout.js';
import { ForbiddenPage } from '../pages/forbidden-page.js';
import { RoutePaths } from './paths.const.js';

// Each page pulls its own heavy dependencies (echarts, ag-grid...): loading them on demand, per
// route, keeps the first paint from paying for every page's dependencies at once.
const ComparePage = lazy(() =>
  import('../pages/compare-page.js').then((m) => ({ default: m.ComparePage })),
);
const HistoryPage = lazy(() =>
  import('../pages/history-page.js').then((m) => ({ default: m.HistoryPage })),
);
const HomePage = lazy(() => import('../pages/home-page.js').then((m) => ({ default: m.HomePage })));
const SettingsPage = lazy(() =>
  import('../pages/settings-page.js').then((m) => ({ default: m.SettingsPage })),
);

const withSuspense = (element: ReactElement): ReactElement => (
  <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>
);

export const routes: RouteObject[] = [
  {
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
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
  // Deliberately outside the `Layout` route above: its auth gate redirects to the identity
  // provider when unauthenticated, which would bounce a rejected visitor straight back into a
  // login loop instead of letting them see why they landed here.
  {
    path: RoutePaths.ERROR_FORBIDDEN,
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    loader: () => redirect(RoutePaths.HOME),
  },
];
