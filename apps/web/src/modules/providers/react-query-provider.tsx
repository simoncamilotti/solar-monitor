import { ApiError } from '@repo/api-client';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FunctionComponent, PropsWithChildren } from 'react';

import { RoutePaths } from '../../routes/paths.const.js';

// A token the API refuses (401) is not recoverable by retrying: show why instead.
const onApiError = (error: unknown) => {
  if (
    error instanceof ApiError &&
    error.status === 401 &&
    window.location.pathname !== RoutePaths.ERROR_FORBIDDEN
  ) {
    window.location.href = RoutePaths.ERROR_FORBIDDEN;
  }
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onApiError }),
  mutationCache: new MutationCache({ onError: onApiError }),
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: false,
    },
  },
});

export const ReactQueryProvider: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
