import { X } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import type { ComparisonGranularity, ComparisonPeriod } from '../comparison.type';
import { comparisonPeriodColors } from '../constants/comparison-colors';
import { isDayPeriod, isMonthPeriod, isYearPeriod } from '../hooks/use-comparison-filters.hook';
import { PeriodPicker } from './PeriodPicker';

type ComparisonPeriodListProps = {
  periods: ComparisonPeriod[];
  granularity: ComparisonGranularity;
  availableYears: number[];
  onAdd: (period: ComparisonPeriod) => void;
  onRemove: (period: ComparisonPeriod) => void;
};

const getPeriodChipLabel = (period: ComparisonPeriod, monthName: (i: number) => string): string => {
  if (isYearPeriod(period)) return `${period.year}`;
  if (isMonthPeriod(period)) return `${monthName(period.month)} ${period.year}`;
  if (isDayPeriod(period)) return period.date;
  return '';
};

export const ComparisonPeriodList: FunctionComponent<ComparisonPeriodListProps> = ({
  periods,
  granularity,
  availableYears,
  onAdd,
  onRemove,
}) => {
  const { t } = useTranslation('web');
  const monthName = (i: number) => t(`months.${i}`);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {periods.map((period, index) => {
        const color = comparisonPeriodColors[index % comparisonPeriodColors.length];
        const label = getPeriodChipLabel(period, monthName);

        return (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
              color,
            }}
          >
            {label}
            <button type="button" onClick={() => onRemove(period)} className="hover:opacity-70 transition-smooth">
              <X className="w-3 h-3" />
            </button>
          </span>
        );
      })}

      <PeriodPicker granularity={granularity} availableYears={availableYears} onAdd={onAdd} />

      {periods.length < 2 && <span className="text-xs text-muted-foreground">{t('compare.periods.empty')}</span>}
    </div>
  );
};
