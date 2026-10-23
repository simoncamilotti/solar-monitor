import type { LifetimeDay } from '@repo/contracts';

import type { DashboardFilterState } from '../dashboard.type.js';
import { getDashboardBuckets, getKpiSparklines } from './dashboard-buckets.js';
import { buildEnergyChartOptions } from './use-dashboard-chart.hook.js';

const day = (date: string, produced: number, consumed: number, imported = 0, exported = 0) =>
  ({
    date,
    kwhProduced: produced,
    kwhConsumed: consumed,
    kwhImported: imported,
    kwhExported: exported,
    gridDependency: 0,
  }) satisfies LifetimeDay;

const DATA = [
  day('2024-12-31', 1, 9, 8, 0),
  day('2025-01-10', 4, 10, 8, 2),
  day('2025-01-11', 6, 10, 6, 2),
  day('2025-02-01', 12, 8, 2, 6),
];

const filters = (overrides: Partial<DashboardFilterState>): DashboardFilterState => ({
  viewMode: 'yearly',
  selectedYear: 2025,
  selectedMonth: 0,
  customStartDate: null,
  customEndDate: null,
  ...overrides,
});

const monthLabel = (m: number) => `M${m}`;

describe('getDashboardBuckets', () => {
  it('should group a year by month, in order', () => {
    const buckets = getDashboardBuckets(DATA, filters({}), monthLabel);

    expect(buckets.map((b) => b.label)).toEqual(['M0', 'M1']);
    expect(buckets[0]!.title).toBe('M0 2025');
    expect(buckets[0]!.entries).toHaveLength(2);
  });

  it('should group the whole history by year', () => {
    const buckets = getDashboardBuckets(DATA, filters({ viewMode: 'full' }), monthLabel);

    expect(buckets.map((b) => b.label)).toEqual(['2024', '2025']);
  });

  it('should give one bucket per day of a custom range, bounds included', () => {
    const buckets = getDashboardBuckets(
      DATA,
      filters({ viewMode: 'custom', customStartDate: '2025-01-10', customEndDate: '2025-02-01' }),
      monthLabel,
    );

    expect(buckets).toHaveLength(3);
  });
});

describe('getKpiSparklines', () => {
  it('should give one point per bucket, at most twelve', () => {
    const many = Array.from({ length: 15 }, (_, i) => ({
      label: `${i}`,
      title: `${i}`,
      entries: [day('2025-01-01', i, 10)],
    }));

    const sparklines = getKpiSparklines(many);

    expect(sparklines.production).toHaveLength(12);
    expect(sparklines.production[11]).toBe(14);
  });
});

describe('buildEnergyChartOptions', () => {
  const palette = {
    production: '#f59e0b',
    consumption: 'C',
    import: 'I',
    export: 'E',
    text: 't',
    axis: 'a',
    grid: 'g',
    tooltip: 'w',
  };
  const labels = {
    produced: 'produced',
    consumed: 'consumed',
    selfConsumed: 'self',
    exported: 'exported',
    imported: 'imported',
  };

  it('should stack the sources above the axis and the uses below', () => {
    const buckets = getDashboardBuckets(DATA, filters({}), monthLabel);
    const options = buildEnergyChartOptions(buckets, palette, labels, 'en');
    const series = options.series as Array<{ name: string; stack?: string; data: number[] }>;

    expect(series.map((s) => s.name)).toEqual(['produced', 'imported', 'consumed', 'exported']);
    expect(series.every((s) => s.stack === 'energy')).toBe(true);
    // January: produced 10, consumed 20, exported 4 → 14 imported; 10 + 14 = 20 + 4.
    expect(series.map((s) => s.data[0])).toEqual([10, 14, -20, -4]);
    expect(series.map((s) => s.data[1])).toEqual([12, 2, -8, -6]);
  });

  it('should list every series in a clickable legend', () => {
    const buckets = getDashboardBuckets(DATA, filters({}), monthLabel);
    const options = buildEnergyChartOptions(buckets, palette, labels, 'en');
    const legend = options.legend as { data: Array<{ name: string }> };

    expect(legend.data.map((d) => d.name)).toEqual([
      'produced',
      'imported',
      'consumed',
      'exported',
    ]);
  });

  it('should label the axis with positive values on both sides', () => {
    const buckets = getDashboardBuckets(DATA, filters({}), monthLabel);
    const options = buildEnergyChartOptions(buckets, palette, labels, 'en');
    const yAxis = options.yAxis as { axisLabel: { formatter: (v: number) => string } };

    expect(yAxis.axisLabel.formatter(-20)).toBe('20');
  });

  it('should list the five values of a bucket in the tooltip', () => {
    const buckets = getDashboardBuckets(DATA, filters({}), monthLabel);
    const options = buildEnergyChartOptions(buckets, palette, labels, 'en');
    const tooltip = options.tooltip as { formatter: (p: unknown) => string };

    const html = tooltip.formatter([{ dataIndex: 0 }]);

    expect(html).toContain('M0 2025');
    for (const text of ['produced', 'consumed', 'self', 'exported', 'imported', '14.0\u00a0kWh']) {
      expect(html).toContain(text);
    }
  });
});
