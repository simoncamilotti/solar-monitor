import { format } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import type { FunctionComponent } from 'react';
import DatePicker from 'react-datepicker';

import { PickerDropdown } from './picker-dropdown.js';

type MonthPickerProps = {
  inputYear: number;
  inputMonth: number;
  availableYears: number[];
  availableMonths?: number[];
  onChange: (date: string | null) => void;
};

export const MonthPicker: FunctionComponent<MonthPickerProps> = ({
  inputYear,
  inputMonth,
  availableYears,
  onChange,
}) => {
  const firstYear = availableYears[0];
  const lastYear = availableYears.at(-1);
  const min = firstYear !== undefined ? new Date(firstYear, 0, 1) : undefined;
  const max = lastYear !== undefined ? new Date(lastYear, 11, 31) : undefined;
  const current = new Date(inputYear, inputMonth, 1);

  return (
    <PickerDropdown label={format(current, 'MMMM yyyy', { locale: frLocale })}>
      {({ close }) => (
        <DatePicker
          calendarClassName="helios-calendar"
          selected={current}
          onChange={(date: Date | null) => {
            onChange(date ? format(date, 'yyyy-MM') : null);
            if (date) {
              close();
            }
          }}
          inline
          showMonthYearPicker
          locale={frLocale}
          minDate={min}
          maxDate={max}
        />
      )}
    </PickerDropdown>
  );
};
