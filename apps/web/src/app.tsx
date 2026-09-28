import type { FunctionComponent } from 'react';
import React from 'react';
import type { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';

import { ThemeProvider } from './modules/layout/providers/theme-provider.js';
import { ReactQueryProvider } from './modules/providers/react-query-provider.js';

export const App: FunctionComponent<{
  router: ReturnType<typeof createBrowserRouter>;
}> = ({ router }) => {
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
