import { ApiError } from '@repo/api-client';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

const FORBIDDEN_PATH = '/forbidden';

// A token the API refuses (401) is not recoverable by retrying: show why instead.
const onApiError = (error: unknown) => {
  if (
    error instanceof ApiError &&
    error.status === 401 &&
    window.location.pathname !== FORBIDDEN_PATH
  ) {
    window.location.href = FORBIDDEN_PATH;
  }
};

export const createQueryClient = (): QueryClient =>
  new QueryClient({
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
