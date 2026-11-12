import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';

import { getDateRangesFindAllMockHandler } from '@repo/api-client/mocks';

import { i18n } from '../../../i18n/i18n.js';
import { server } from '../../../test/setup.js';
import { ComparisonPeriodList } from './comparison-period-list.js';

const renderList = (periods: Parameters<typeof ComparisonPeriodList>[0]['periods']) => {
  const onAdd = vi.fn();
  // The range form lists the saved ranges.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ComparisonPeriodList
        periods={periods}
        granularity="ranges"
        availableYears={[2024, 2025]}
        availableDays={['2024-01-01', '2025-12-31']}
        onAdd={onAdd}
        onRemove={vi.fn()}
      />
    </QueryClientProvider>,
  );
  return onAdd;
};

describe('ComparisonPeriodList, ranges', () => {
  it('should show a named range by its name', () => {
    renderList([{ start: '2025-08-01', end: '2025-08-14', name: 'Vacances' }]);

    expect(screen.getByText('Vacances')).toBeDefined();
  });

  it('should add the same dates one year earlier', () => {
    const onAdd = renderList([{ start: '2025-08-01', end: '2025-08-14' }]);

    fireEvent.click(screen.getByRole('button', { name: i18n.t('compare.ranges.previousYear') }));

    expect(onAdd).toHaveBeenCalledWith({ start: '2024-08-01', end: '2024-08-14' });
  });

  it('should add the period just before the first one', () => {
    const onAdd = renderList([{ start: '2025-08-01', end: '2025-08-14' }]);

    fireEvent.click(screen.getByRole('button', { name: i18n.t('compare.ranges.justBefore') }));

    expect(onAdd).toHaveBeenCalledWith({ start: '2025-07-18', end: '2025-07-31' });
  });

  it('should offer no shortcut before a first range', () => {
    renderList([]);

    expect(screen.queryByRole('button', { name: i18n.t('compare.ranges.justBefore') })).toBeNull();
    expect(
      (screen.getByRole('button', { name: i18n.t('compare.periods.add') }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('should stop offering shortcuts at four periods', () => {
    renderList([
      { start: '2025-08-01', end: '2025-08-14' },
      { start: '2024-08-01', end: '2024-08-14' },
      { start: '2023-08-01', end: '2023-08-14' },
      { start: '2022-08-01', end: '2022-08-14' },
    ]);

    expect(
      screen.queryByRole('button', { name: i18n.t('compare.ranges.previousYear') }),
    ).toBeNull();
  });

  it('should add a saved range with its name', async () => {
    server.use(
      getDateRangesFindAllMockHandler([
        {
          id: '0b5c8c3e-5d2a-4a59-9a59-3f1f5c1e2a11',
          name: 'Été 2024',
          startDate: '2024-06-21',
          endDate: '2024-09-22',
        },
      ]),
    );
    const onAdd = renderList([]);

    fireEvent.click(screen.getByRole('button', { name: 'Plages enregistrées' }));
    fireEvent.click(await screen.findByText('Été 2024'));

    expect(onAdd).toHaveBeenCalledWith({
      start: '2024-06-21',
      end: '2024-09-22',
      name: 'Été 2024',
    });
  });
});
