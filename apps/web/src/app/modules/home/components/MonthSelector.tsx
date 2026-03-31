import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import type { LifetimeDataResponseDto } from '@/shared-models';

import { getMonthsForYear } from '../hooks/get-months-for-year';

type MonthSelectorProps = {
  data: LifetimeDataResponseDto;
  selectedYear: number;
  selectedMonth: number;
  onMonthChange: (month: number) => void;
};

export const MonthSelector: FunctionComponent<MonthSelectorProps> = ({
  data,
  selectedYear,
  selectedMonth,
  onMonthChange,
}) => {
  const { t } = useTranslation('web');

  const months = getMonthsForYear(data, selectedYear);

  return (
    <div className="mb-4">
      <label className="text-xs text-muted-foreground mb-2 block">Mois</label>
      <select
        value={selectedMonth}
        onChange={e => onMonthChange(Number(e.target.value))}
        className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
      >
        {months.map(m => (
          <option key={m} value={m}>
            {t(`months.${m}`)}
          </option>
        ))}
      </select>
    </div>
  );
};
