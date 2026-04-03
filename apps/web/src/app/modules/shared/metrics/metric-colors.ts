import type { MetricKey } from './metric.type';

export const metricColors: Record<MetricKey, string> = {
  kwhProduced: 'hsl(280, 80%, 55%)',
  kwhConsumed: 'hsl(310, 40%, 65%)',
  kwhImported: 'hsl(200, 70%, 55%)',
  kwhExported: 'hsl(142, 71%, 45%)',
  autonomy: 'hsl(45, 80%, 50%)',
  selfConsumption: 'hsl(25, 75%, 55%)',
  gridDependency: 'hsl(0, 60%, 55%)',
};
