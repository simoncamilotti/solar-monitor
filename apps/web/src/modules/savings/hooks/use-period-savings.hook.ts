import { useMemo } from 'react';

import type { LifetimeDay, Tariff } from '@repo/contracts';

import type { DashboardFilterState } from '../../home/dashboard.type.js';
import {
  filterCurrentPeriod,
  filterPreviousPeriod,
} from '../../home/hooks/use-dashboard-kpis.hook.js';
import { computeSavings, type Savings } from '../savings-computation.js';

export type PeriodSavings = Savings & {
  savingsDelta: number | null;
  revenueDelta: number | null;
  totalDelta: number | null;
};

const delta = (current: number, previous: number): number | null =>
  previous > 0 ? ((current - previous) / previous) * 100 : null;

/** Euros of the period chosen on the dashboard, and their change against the previous period. */
export const usePeriodSavings = (
  data: LifetimeDay[],
  filters: DashboardFilterState,
  tariffs: Tariff[],
): PeriodSavings =>
  useMemo(() => {
    const current = computeSavings(filterCurrentPeriod(data, filters), tariffs);
    // The whole history has no previous period to compare with.
    const previousDays = filters.viewMode === 'full' ? [] : filterPreviousPeriod(data, filters);
    const previous = computeSavings(previousDays, tariffs);

    return {
      ...current,
      savingsDelta: delta(current.savings, previous.savings),
      revenueDelta: delta(current.revenue, previous.revenue),
      totalDelta: delta(current.total, previous.total),
    };
  }, [data, filters, tariffs]);
