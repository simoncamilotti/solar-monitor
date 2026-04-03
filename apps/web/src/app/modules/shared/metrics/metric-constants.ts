import type { DerivedMetricKey, EnergyMetricKey, MetricKey } from './metric.type';

export const ENERGY_METRICS: EnergyMetricKey[] = ['kwhProduced', 'kwhConsumed', 'kwhImported', 'kwhExported'];

export const DERIVED_METRICS: DerivedMetricKey[] = ['autonomy', 'selfConsumption', 'gridDependency'];

export const ALL_METRICS: MetricKey[] = [...ENERGY_METRICS, ...DERIVED_METRICS];

export const PERCENTAGE_METRICS: MetricKey[] = ['autonomy', 'selfConsumption', 'gridDependency'];

export const getMetricUnit = (metric: MetricKey): string => (PERCENTAGE_METRICS.includes(metric) ? '%' : 'kWh');
