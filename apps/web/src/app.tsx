import type { FunctionComponent } from 'react';
import React, { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';

import { ThemeProvider } from './modules/layout/providers/theme-provider.js';
import { ReactQueryProvider } from './modules/providers/react-query-provider.js';
import { routes } from './routes/routes.js';

export const App: FunctionComponent = () => {
  const auth = useAuth();

  // The routes decide on access: wait until the OIDC state is known, including the return
  // from the identity provider.
  if (auth.isLoading) {
    return null;
  }
  return <AppRouter />;
};

const AppRouter: FunctionComponent = () => {
  // Created once the sign-in callback has restored the requested URL, so it starts there.
  const [router] = useState(() => createBrowserRouter(routes));

  return (
    <React.StrictMode>
      <ReactQueryProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </ReactQueryProvider>
    </React.StrictMode>
  );
};
