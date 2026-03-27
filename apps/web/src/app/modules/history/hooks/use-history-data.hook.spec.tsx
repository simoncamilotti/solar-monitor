vi.mock('../history.service', () => ({
  HistoryService: {
    getAll: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../history.key', () => ({
  historyKey: { getAll: ['history', 'getAll'] },
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { HistoryService } from '../history.service';
import { useHistoryData } from './use-history-data.hook';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useHistoryData', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => useHistoryData(), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should return data after fetch', async () => {
    const mockResponse = [
      { date: '2024-01-01', kwhProduced: 10, kwhConsumed: 8, kwhImported: 2, kwhExported: 4, gridDependency: 20 },
    ];
    vi.mocked(HistoryService.getAll).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useHistoryData(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.isError).toBe(false);
  });

  it('should return error state on failure', async () => {
    vi.mocked(HistoryService.getAll).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useHistoryData(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });
});
