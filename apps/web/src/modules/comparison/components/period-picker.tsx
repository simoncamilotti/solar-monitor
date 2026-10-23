import { format } from 'date-fns';
import type { FunctionComponent } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';

import { useDateLocale } from '../../../i18n/date-locale.js';

import { PickerDropdown } from '../../home/components/picker-dropdown.js';
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
          <DatePicker
            calendarClassName="helios-calendar"
            onChange={(date: Date | null) => {
              if (date) {
                onAdd({ year: Number(format(date, 'yyyy')) });
                close();
              }
            }}
            dateFormat="yyyy"
            showYearPicker
            inline
            yearItemNumber={availableYears.length}
            minDate={minDate}
            maxDate={maxDate}
          />
        )}
      </PickerDropdown>
    );
  }

  if (granularity === 'months') {
    return (
      <PickerDropdown label={label}>
        {({ close }) => (
          <DatePicker
            calendarClassName="helios-calendar"
            onChange={(date: Date | null) => {
              if (date) {
                onAdd({ year: date.getFullYear(), month: date.getMonth() });
                close();
              }
            }}
            inline
            showMonthYearPicker
            locale={locale}
            minDate={minDate}
            maxDate={maxDate}
          />
        )}
      </PickerDropdown>
    );
  }

  return (
    <PickerDropdown label={label}>
      {({ close }) => (
        <DatePicker
          calendarClassName="helios-calendar"
          onChange={(date: Date | null) => {
            if (date) {
              const dateStr = format(date, 'yyyy-MM-dd');
              onAdd({ date: dateStr });
              close();
            }
          }}
          inline
          locale={locale}
          minDate={minDate}
          maxDate={maxDate}
        />
      )}
    </PickerDropdown>
  );
};
