import type { MetricKey } from '../home.type';

export const metricColors: Record<MetricKey, string> = {
  kwhConsumed: 'hsl(280, 80%, 55%)',
  kwhProduced: 'hsl(310, 40%, 65%)',
  kwhImported: 'hsl(200, 70%, 55%)',
  kwhExported: 'hsl(142, 71%, 45%)',
};
