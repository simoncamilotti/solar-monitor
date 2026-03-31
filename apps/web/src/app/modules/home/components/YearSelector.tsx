import type { FunctionComponent } from 'react';

import type { LifetimeDataResponseDto } from '@/shared-models';

type YearSelectorProps = {
  data: LifetimeDataResponseDto;
  selectedYear: number;
  onYearChange: (year: number) => void;
};

export const YearSelector: FunctionComponent<YearSelectorProps> = ({ data, selectedYear, onYearChange }) => {
  const years = [...new Set(data.map(x => new Date(x.date).getFullYear()))].sort();

  return (
    <div className="mb-4">
      <label className="text-xs text-muted-foreground mb-2 block">Année de référence</label>
      <select
        value={selectedYear}
        onChange={e => onYearChange(Number(e.target.value))}
        className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
      >
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};
