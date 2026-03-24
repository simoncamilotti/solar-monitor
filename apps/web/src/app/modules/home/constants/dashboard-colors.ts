import type { DashboardMetricKey } from '../dashboard.type';

export const dashboardMetricColors: Record<DashboardMetricKey, string> = {
  kwhProduced: 'hsl(280, 80%, 55%)',
  kwhConsumed: 'hsl(310, 40%, 65%)',
  kwhImported: 'hsl(200, 70%, 55%)',
  kwhExported: 'hsl(142, 71%, 45%)',
};
