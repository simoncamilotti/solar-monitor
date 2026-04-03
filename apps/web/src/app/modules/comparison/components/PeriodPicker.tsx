import { format } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import type { FunctionComponent } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';

import { PickerDropdown } from '../../home/components/PickerDropdown';
import type { ComparisonGranularity, ComparisonPeriod } from '../comparison.type';

type PeriodPickerProps = {
  granularity: ComparisonGranularity;
  availableYears: number[];
  onAdd: (period: ComparisonPeriod) => void;
};

export const PeriodPicker: FunctionComponent<PeriodPickerProps> = ({ granularity, availableYears, onAdd }) => {
  const { t } = useTranslation('web');
  const minDate = availableYears.length ? new Date(availableYears[0], 0, 1) : undefined;
  const maxDate = availableYears.length ? new Date(availableYears[availableYears.length - 1], 11, 31) : undefined;

  const label = t('compare.periods.add');

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
            locale={frLocale}
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
          locale={frLocale}
          minDate={minDate}
          maxDate={maxDate}
        />
      )}
    </PickerDropdown>
  );
};
