import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, type RenderHookResult } from '@testing-library/react';
import type { ReactNode } from 'react';

/** Renders a hook with the providers it expects, and a fresh query cache per test. */
export function renderHookWithProviders<T>(hook: () => T): RenderHookResult<T, unknown> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(hook, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}
