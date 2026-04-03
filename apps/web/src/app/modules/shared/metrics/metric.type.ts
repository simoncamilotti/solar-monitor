export type EnergyMetricKey = 'kwhProduced' | 'kwhConsumed' | 'kwhImported' | 'kwhExported';

export type DerivedMetricKey = 'autonomy' | 'selfConsumption' | 'gridDependency';

export type MetricKey = EnergyMetricKey | DerivedMetricKey;
