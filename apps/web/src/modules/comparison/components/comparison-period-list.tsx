import { CalendarClock, History, X } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { useDateLocale } from '../../../i18n/date-locale.js';
import { monthKey } from '../../../i18n/keys.js';

import { getPeriodColor, useDisplayedTheme } from '../../shared/metrics/energy-colors.js';
import type { ComparisonGranularity, ComparisonPeriod } from '../comparison.type.js';
import { MAX_COMPARISON_PERIODS } from '../comparison-presets.js';
import { periodJustBefore, sameDatesPreviousYear } from '../comparison-ranges.js';
import { isRangePeriod } from '../hooks/use-comparison-filters.hook.js';
import { getPeriodLabel } from '../period-label.js';
import { PeriodPicker } from './period-picker.js';

type ComparisonPeriodListProps = {
  periods: ComparisonPeriod[];
  granularity: ComparisonGranularity;
  availableYears: number[];
  availableDays: string[];
  onAdd: (period: ComparisonPeriod) => void;
  onRemove: (period: ComparisonPeriod) => void;
};

export const ComparisonPeriodList: FunctionComponent<ComparisonPeriodListProps> = ({
  periods,
  granularity,
  availableYears,
  availableDays,
  onAdd,
  onRemove,
}) => {
  const { t } = useTranslation();
  const theme = useDisplayedTheme();
  const locale = useDateLocale();
  const monthName = (i: number) => t(monthKey(i));
  const isFull = periods.length >= MAX_COMPARISON_PERIODS;
  // Shortcuts derive a new range from the first one.
  const firstRange = granularity === 'ranges' ? periods.find(isRangePeriod) : undefined;
  const shortcuts = firstRange
    ? [
        {
          key: 'previousYear',
          icon: CalendarClock,
          label: t('compare.ranges.previousYear'),
          period: sameDatesPreviousYear(firstRange),
        },
        {
          key: 'justBefore',
          icon: History,
          label: t('compare.ranges.justBefore'),
          period: periodJustBefore(firstRange),
        },
      ]
    : [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {periods.map((period, index) => {
        const label = getPeriodLabel(period, monthName, locale);

        return (
          <span
            key={`${index}-${label}`}
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

      {!isFull && (
        <PeriodPicker
          granularity={granularity}
          availableYears={availableYears}
          availableDays={availableDays}
          onAdd={onAdd}
        />
      )}

      {!isFull &&
        shortcuts.map(({ key, icon: Icon, label, period }) => (
          <button
            key={key}
            type="button"
            onClick={() => onAdd(period)}
            disabled={periods.some(
              (p) => isRangePeriod(p) && p.start === period.start && p.end === period.end,
            )}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary transition-smooth disabled:opacity-50 disabled:pointer-events-none"
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}

      <span className="text-xs text-muted-foreground">
        {t('compare.periods.selected', {
          selected: periods.length,
          max: MAX_COMPARISON_PERIODS,
        })}
      </span>
    </div>
  );
};
