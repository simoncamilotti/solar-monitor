import { format } from 'date-fns';
import type { FunctionComponent } from 'react';

import { useDateLocale } from '../../../i18n/date-locale.js';

import { MonthGrid } from './month-grid.js';
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
  const locale = useDateLocale();
  const current = new Date(inputYear, inputMonth, 1);

  return (
    <PickerDropdown label={format(current, 'MMMM yyyy', { locale })}>
      {({ close }) => (
        <MonthGrid
          selected={{ year: inputYear, month: inputMonth }}
          min={min}
          max={max}
          onSelect={(year, month) => {
            onChange(format(new Date(year, month, 1), 'yyyy-MM'));
            close();
          }}
        />
      )}
    </PickerDropdown>
  );
};
