import { format } from 'date-fns';
import type { FunctionComponent } from 'react';
import DatePicker from 'react-datepicker';

import { PickerDropdown } from './PickerDropdown';

type YearPickerProps = {
  inputYear: number;
  availableYears?: number[];
  onChange: (year: number | null) => void;
};

export const YearPicker: FunctionComponent<YearPickerProps> = ({ inputYear, availableYears, onChange }) => {
  const min = availableYears?.length ? new Date(availableYears[0], 0, 1) : undefined;
  const max = availableYears?.length ? new Date(availableYears[availableYears.length - 1], 0, 1) : undefined;
  const current = new Date(inputYear, 0, 1);

  return (
    <PickerDropdown label={format(current, 'yyyy')}>
      {({ close }) => (
        <DatePicker
          calendarClassName="helios-calendar"
          selected={current}
          onChange={(date: Date | null) => {
            onChange(date ? Number(format(date, 'yyyy')) : null);
            if (date) {
              close();
            }
          }}
          dateFormat="yyyy"
          showYearPicker
          inline
          yearItemNumber={availableYears?.length}
          minDate={min}
          maxDate={max}
        />
      )}
    </PickerDropdown>
  );
};
