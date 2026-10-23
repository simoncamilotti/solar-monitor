import { Calendar } from '@repo/ui/components/calendar';
import { format } from 'date-fns';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { useDateLocale } from '../../../i18n/date-locale.js';

import { calendarBounds, initialMonth } from '../../home/components/date-bounds.js';
import { MonthGrid } from '../../home/components/month-grid.js';
import { PickerDropdown } from '../../home/components/picker-dropdown.js';
import { YearGrid } from '../../home/components/year-grid.js';
import type { ComparisonGranularity, ComparisonPeriod } from '../comparison.type.js';
import { RangePeriodForm } from './range-period-form.js';

type PeriodPickerProps = {
  granularity: ComparisonGranularity;
  availableYears: number[];
  /** Days of the history, `yyyy-MM-dd`, sorted. */
  availableDays: string[];
  onAdd: (period: ComparisonPeriod) => void;
};

export const PeriodPicker: FunctionComponent<PeriodPickerProps> = ({
  granularity,
  availableYears,
  availableDays,
  onAdd,
}) => {
  const { t } = useTranslation();
  const locale = useDateLocale();
  const firstYear = availableYears[0];
  const lastYear = availableYears.at(-1);
  const minDate = firstYear !== undefined ? new Date(firstYear, 0, 1) : undefined;
  const maxDate = lastYear !== undefined ? new Date(lastYear, 11, 31) : undefined;

  const label = t('compare.periods.add');

  if (granularity === 'ranges') {
    return (
      <RangePeriodForm firstDay={availableDays[0]} lastDay={availableDays.at(-1)} onAdd={onAdd} />
    );
  }

  if (granularity === 'years') {
    return (
      <PickerDropdown label={label}>
        {({ close }) => (
          <YearGrid
            years={availableYears}
            onSelect={(year) => {
              onAdd({ year });
              close();
            }}
          />
        )}
      </PickerDropdown>
    );
  }

  if (granularity === 'months') {
    return (
      <PickerDropdown label={label}>
        {({ close }) => (
          <MonthGrid
            min={minDate}
            max={maxDate}
            onSelect={(year, month) => {
              onAdd({ year, month });
              close();
            }}
          />
        )}
      </PickerDropdown>
    );
  }

  const bounds = calendarBounds(minDate, maxDate);

  return (
    <PickerDropdown label={label}>
      {({ close }) => (
        <Calendar
          mode="single"
          locale={locale}
          captionLayout="dropdown"
          defaultMonth={initialMonth(minDate, maxDate)}
          {...bounds}
          onSelect={(date) => {
            if (date) {
              onAdd({ date: format(date, 'yyyy-MM-dd') });
              close();
            }
          }}
        />
      )}
    </PickerDropdown>
  );
};
