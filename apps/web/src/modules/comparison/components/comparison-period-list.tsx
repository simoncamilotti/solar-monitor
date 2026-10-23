import { X } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { monthKey } from '../../../i18n/keys.js';

import { getPeriodColor, useDisplayedTheme } from '../../shared/metrics/energy-colors.js';
import type { ComparisonGranularity, ComparisonPeriod } from '../comparison.type.js';
import { isDayPeriod, isMonthPeriod, isYearPeriod } from '../hooks/use-comparison-filters.hook.js';
import { PeriodPicker } from './period-picker.js';

type ComparisonPeriodListProps = {
  periods: ComparisonPeriod[];
  granularity: ComparisonGranularity;
  availableYears: number[];
  onAdd: (period: ComparisonPeriod) => void;
  onRemove: (period: ComparisonPeriod) => void;
};

const getPeriodChipLabel = (period: ComparisonPeriod, monthName: (i: number) => string): string => {
  if (isYearPeriod(period)) {
    return `${period.year}`;
  }
  if (isMonthPeriod(period)) {
    return `${monthName(period.month)} ${period.year}`;
  }
  if (isDayPeriod(period)) {
    return period.date;
  }
  return '';
};

export const ComparisonPeriodList: FunctionComponent<ComparisonPeriodListProps> = ({
  periods,
  granularity,
  availableYears,
  onAdd,
  onRemove,
}) => {
  const { t } = useTranslation();
  const theme = useDisplayedTheme();
  const monthName = (i: number) => t(monthKey(i));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {periods.map((period, index) => {
        const label = getPeriodChipLabel(period, monthName);

        return (
          <span
            key={label}
            className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full text-xs font-medium border border-border bg-background"
          >
            <span
              className="w-2.5 h-2.5 rounded-xs"
              style={{ backgroundColor: getPeriodColor(index, theme) }}
              aria-hidden="true"
            />
            {label}
            <button
              type="button"
              onClick={() => onRemove(period)}
              aria-label={t('compare.periods.remove', { period: label })}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        );
      })}

      <PeriodPicker granularity={granularity} availableYears={availableYears} onAdd={onAdd} />

      {periods.length < 2 && (
        <span className="text-xs text-muted-foreground">{t('compare.periods.empty')}</span>
      )}
    </div>
  );
};
