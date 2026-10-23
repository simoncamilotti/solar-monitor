import type { LifetimeDay } from '@repo/contracts';

import { getComparisonPresets } from './comparison-presets.js';

const day = (date: string, produced: number) =>
  ({
    date,
    kwhProduced: produced,
    kwhConsumed: 10,
    kwhImported: 5,
    kwhExported: 5,
    gridDependency: 50,
  }) satisfies LifetimeDay;

const preset = (data: LifetimeDay[], id: string) =>
  getComparisonPresets(data).find((p) => p.id === id);

describe('getComparisonPresets', () => {
  const DATA = [
    day('2021-06-01', 300),
    day('2022-06-01', 500),
    day('2023-06-01', 100),
    day('2024-06-01', 200),
    day('2025-05-01', 150),
    day('2025-06-15', 150),
  ];

  it('should compare the last year with the previous one', () => {
    expect(preset(DATA, 'thisYearVsLastYear')).toEqual({
      id: 'thisYearVsLastYear',
      granularity: 'years',
      periods: [{ year: 2025 }, { year: 2024 }],
    });
  });

  it('should compare the last month with the same month a year before', () => {
    expect(preset(DATA, 'thisMonthVsLastYear')?.periods).toEqual([
      { year: 2025, month: 5 },
      { year: 2024, month: 5 },
    ]);
  });

  it('should compare the best and worst years by production', () => {
    // 2022 produced 500 kWh; 2023 only 100.
    expect(preset(DATA, 'bestAndWorstYear')?.periods).toEqual([{ year: 2022 }, { year: 2023 }]);
  });

  it('should keep the four most recent years, latest first', () => {
    expect(preset(DATA, 'recentYears')?.periods).toEqual([
      { year: 2025 },
      { year: 2024 },
      { year: 2023 },
      { year: 2022 },
    ]);
  });

  it('should disable every preset on a single year of history', () => {
    const presets = getComparisonPresets([day('2024-01-15', 10), day('2024-06-15', 20)]);

    expect(presets.every((p) => p.periods === null)).toBe(true);
  });
});
