import type { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import type { AuthContextProps } from 'react-oidc-context';
import { routeTree } from './route-tree.gen.js';

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthContextProps;
}

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    // `auth` is provided by <App /> once the OIDC state is known.
    context: { queryClient, auth: undefined as unknown as AuthContextProps },
    defaultPreload: 'intent',
    scrollRestoration: true,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
