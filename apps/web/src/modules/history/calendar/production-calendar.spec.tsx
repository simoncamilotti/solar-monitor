import { getEnphaseGetAllMockHandler } from '@repo/api-client/mocks';
import { ThemeProvider } from '@repo/ui/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';

import type { LifetimeDay } from '@repo/contracts';

import { server } from '../../../test/setup.js';
import { HistoryPage } from '../history-page.js';

const navigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }));

// ECharts needs a canvas, which jsdom does not provide: the mock keeps the last props it got.
type ChartProps = {
  option: { series: { data: { value: [string, number]; kind: string }[] }[] };
  onEvents: { click: (params: unknown) => void };
};
let chart: ChartProps | undefined;
vi.mock('../../charts/components/chart.js', () => ({
  Chart: (props: ChartProps) => {
    chart = props;
    return null;
  },
}));

const day = (date: string, kwhProduced: number): LifetimeDay => ({
  date,
  kwhProduced,
  kwhConsumed: 10,
  kwhImported: 4,
  kwhExported: 2,
  gridDependency: 40,
});

const renderCalendar = async (days: LifetimeDay[]) => {
  server.use(getEnphaseGetAllMockHandler(days));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <HistoryPage view="calendar" />
      </QueryClientProvider>
    </ThemeProvider>,
  );
  await screen.findByRole('heading', { name: 'Calendrier de production' });
};

const items = () => chart?.option.series[0]?.data ?? [];

describe('Production calendar', () => {
  beforeEach(() => {
    chart = undefined;
    navigate.mockClear();
    localStorage.clear();
  });

  it('should show the stored days and the missing ones of the latest year', async () => {
    await renderCalendar([day('2023-12-31', 9), day('2024-03-01', 8), day('2024-03-03', 0)]);

    expect(items().map((i) => [i.value[0], i.kind])).toEqual([
      ['2024-01-01', 'missing'],
      ...Array.from({ length: 59 }, () => expect.anything()),
      ['2024-03-01', 'value'],
      ['2024-03-02', 'missing'],
      ['2024-03-03', 'value'],
    ]);
  });

  it('should switch to another metric', async () => {
    await renderCalendar([day('2024-03-01', 8)]);

    fireEvent.click(screen.getByRole('button', { name: 'Autonomie' }));

    expect(screen.getByRole('button', { name: 'Autonomie', pressed: true })).toBeDefined();
    expect(items()[0]?.value).toEqual(['2024-03-01', 60]);
  });

  it('should open the dashboard on the clicked day', async () => {
    await renderCalendar([day('2024-03-01', 8)]);

    chart?.onEvents.click({ data: { value: ['2024-03-01', 8], kind: 'value' } });

    expect(navigate).toHaveBeenCalledWith({ to: '/' });
    expect(JSON.parse(localStorage.getItem('dashboard-filters') ?? '{}')).toMatchObject({
      viewMode: 'custom',
      customStartDate: '2024-03-01',
      customEndDate: '2024-03-01',
    });
  });

  it('should not open a missing day', async () => {
    await renderCalendar([day('2024-03-01', 8), day('2024-03-03', 8)]);

    chart?.onEvents.click({ data: { value: ['2024-03-02', 0], kind: 'missing' } });

    expect(navigate).not.toHaveBeenCalled();
  });
});
