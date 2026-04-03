import type { LifetimeDataDto } from '@/shared-models';

import type { MetricKey } from './metric.type';

export type AggregatedMetrics = {
  produced: number;
  consumed: number;
  imported: number;
  exported: number;
  autonomy: number;
  selfConsumption: number;
  gridDependency: number;
};

export const aggregateEntries = (entries: LifetimeDataDto[]): AggregatedMetrics => {
  const produced = entries.reduce((s, e) => s + e.kwhProduced, 0);
  const consumed = entries.reduce((s, e) => s + e.kwhConsumed, 0);
  const imported = entries.reduce((s, e) => s + e.kwhImported, 0);
  const exported = entries.reduce((s, e) => s + e.kwhExported, 0);

  const autonomy = consumed > 0 ? (1 - imported / consumed) * 100 : 0;
  const selfConsumption = produced > 0 ? ((produced - exported) / produced) * 100 : 0;
  const gridDependency = consumed > 0 ? (imported / consumed) * 100 : 0;

  return { produced, consumed, imported, exported, autonomy, selfConsumption, gridDependency };
};

export const computeMetric = (metric: MetricKey, entries: LifetimeDataDto[]): number => {
  const agg = aggregateEntries(entries);

  switch (metric) {
    case 'kwhProduced':
      return agg.produced;
    case 'kwhConsumed':
      return agg.consumed;
    case 'kwhImported':
      return agg.imported;
    case 'kwhExported':
      return agg.exported;
    case 'autonomy':
      return agg.autonomy;
    case 'selfConsumption':
      return agg.selfConsumption;
    case 'gridDependency':
      return agg.gridDependency;
  }
};
