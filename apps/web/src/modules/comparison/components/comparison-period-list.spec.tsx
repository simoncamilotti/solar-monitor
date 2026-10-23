import { fireEvent, render, screen } from '@testing-library/react';

import { i18n } from '../../../i18n/i18n.js';
import { ComparisonPeriodList } from './comparison-period-list.js';

const renderList = (periods: Parameters<typeof ComparisonPeriodList>[0]['periods']) => {
  const onAdd = vi.fn();
  render(
    <ComparisonPeriodList
      periods={periods}
      granularity="ranges"
      availableYears={[2024, 2025]}
      availableDays={['2024-01-01', '2025-12-31']}
      onAdd={onAdd}
      onRemove={vi.fn()}
    />,
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
});
