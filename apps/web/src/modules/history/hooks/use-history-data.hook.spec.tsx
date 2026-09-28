import { getEnphaseGetAllMockHandler } from '@repo/api-client/mocks';
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { renderHookWithProviders } from '../../../test/render.js';
import { server } from '../../../test/setup.js';
import { useHistoryData } from './use-history-data.hook.js';

describe('useHistoryData', () => {
  it('should return loading state initially', () => {
    const { result } = renderHookWithProviders(() => useHistoryData());

    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should return data after fetch', async () => {
    const days = [
      {
        date: '2024-01-01',
        kwhProduced: 10,
        kwhConsumed: 8,
        kwhImported: 2,
        kwhExported: 4,
        gridDependency: 20,
      },
    ];
    server.use(getEnphaseGetAllMockHandler(days));

    const { result } = renderHookWithProviders(() => useHistoryData());

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.data).toEqual(days);
    expect(result.current.isError).toBe(false);
  });

  it('should return error state on failure', async () => {
    server.use(
      http.get('*/api/enphase/all', () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Internal Server Error', status: 500 },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHookWithProviders(() => useHistoryData());

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });
});
