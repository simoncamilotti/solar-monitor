import type { RouteObject } from 'react-router';
import { redirect } from 'react-router';

import { isAuthenticated, login } from '../modules/auth/auth';
import { Layout } from '../modules/layout/components/Layout';
import { ComparePage } from '../pages/ComparePage';
import { HistoryPage } from '../pages/HistoryPage';
import { HomePage } from '../pages/HomePage';
import { SettingsPage } from '../pages/SettingsPage';
import { RoutePaths } from './paths.const';

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
        element: <HomePage />,
      },
      {
        path: RoutePaths.COMPARE,
        element: <ComparePage />,
      },
      {
        path: RoutePaths.HISTORY,
        element: <HistoryPage />,
      },
      {
        path: RoutePaths.SETTINGS,
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    loader: () => redirect(RoutePaths.HOME),
  },
];
