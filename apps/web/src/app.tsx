import type { QueryClient } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useState } from 'react';
import { type AuthContextProps, useAuth } from 'react-oidc-context';

import { createAppRouter } from './router.js';

export function App({ queryClient }: { queryClient: QueryClient }) {
  const auth = useAuth();

  // The routes decide on access: wait until the OIDC state is known, including the return
  // from the identity provider.
  if (auth.isLoading) {
    return null;
  }
  return <AppRouter queryClient={queryClient} auth={auth} />;
}

function AppRouter({ queryClient, auth }: { queryClient: QueryClient; auth: AuthContextProps }) {
  // Created once the sign-in callback has restored the requested URL, so it starts there.
  const [router] = useState(() => createAppRouter(queryClient));
  return <RouterProvider router={router} context={{ auth }} />;
}
