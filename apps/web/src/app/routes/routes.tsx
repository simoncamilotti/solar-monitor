import type { RouteObject } from 'react-router';
import { redirect } from 'react-router';

import { isAuthenticated, login } from '../modules/auth/auth';
import { Layout } from '../modules/layout/Layout';
import { Navbar } from '../modules/layout/Navbar';
import { HomePage } from '../pages/HomePage';
import { SettingsPage } from '../pages/SettingsPage';
import { RoutePaths } from './paths.const';

export const routes: RouteObject[] = [
  {
    element: <Layout navBar={<Navbar />} />,
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
