import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { monthKey } from '../../../i18n/keys.js';

import type { LifetimeDay } from '@repo/contracts';

import type { DashboardFilterState } from '../dashboard.type.js';
import { type DashboardBucket, getDashboardBuckets } from './dashboard-buckets.js';

/** Buckets of the selected period, shared by the chart and the KPI sparklines. */
export const useDashboardBuckets = (
  data: LifetimeDay[],
  filters: DashboardFilterState,
): DashboardBucket[] => {
  const { t } = useTranslation();
  return useMemo(
    () => getDashboardBuckets(data, filters, (month) => t(monthKey(month))),
    [data, filters, t],
  );
};
