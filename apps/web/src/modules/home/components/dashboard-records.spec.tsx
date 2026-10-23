import { getEnphaseGetAllMockHandler } from '@repo/api-client/mocks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';

import type { LifetimeDay } from '@repo/contracts';

import { server } from '../../../test/setup.js';
import { HomePage } from '../home-page.js';

// ECharts needs a canvas, which jsdom does not provide.
vi.mock('../../charts/components/chart.js', () => ({ Chart: () => null }));

const day = (date: string, kwhProduced: number, kwhImported: number): LifetimeDay => ({
  date,
  kwhProduced,
  kwhConsumed: 8,
  kwhImported,
  kwhExported: 2,
  gridDependency: 0,
});

const renderHome = (days: LifetimeDay[]) => {
  server.use(getEnphaseGetAllMockHandler(days));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>,
  );
};

const storedFilters = () => JSON.parse(localStorage.getItem('dashboard-filters') ?? '{}');

describe('Dashboard records', () => {
  beforeEach(() => localStorage.clear());

  it('should open the dashboard on the best day', async () => {
    renderHome([day('2024-05-01', 12, 0), day('2024-05-02', 20, 1), day('2024-06-01', 15, 0)]);

    fireEvent.click(await screen.findByRole('button', { name: /Meilleur jour/ }));

    expect(storedFilters()).toMatchObject({
      viewMode: 'custom',
      customStartDate: '2024-05-02',
      customEndDate: '2024-05-02',
    });
  });

  it('should open the dashboard on the best month', async () => {
    renderHome([day('2024-05-01', 12, 0), day('2024-06-01', 15, 0), day('2024-06-02', 15, 0)]);

    fireEvent.click(await screen.findByRole('button', { name: /Meilleur mois/ }));

    expect(storedFilters()).toMatchObject({
      viewMode: 'monthly',
      selectedYear: 2024,
      selectedMonth: 5,
    });
  });

  it('should open the dashboard on the longest surplus streak, despite night imports', async () => {
    renderHome([
      day('2024-05-01', 9, 3),
      day('2024-05-02', 6, 4),
      day('2024-05-03', 8, 3),
      day('2024-05-04', 12, 2),
      day('2024-05-05', 5, 5),
    ]);

    fireEvent.click(
      await screen.findByRole('button', { name: /Plus longue série de jours excédentaires/ }),
    );

    expect(storedFilters()).toMatchObject({
      viewMode: 'custom',
      customStartDate: '2024-05-03',
      customEndDate: '2024-05-04',
    });
  });

  it('should not show the card for an empty history', async () => {
    renderHome([]);

    await screen.findByText('Tableau de bord');
    // The dashboard renders its filters once the (empty) history has loaded.
    await screen.findByText('Personnalisé');
    expect(screen.queryByText('Records')).toBeNull();
  });
});
