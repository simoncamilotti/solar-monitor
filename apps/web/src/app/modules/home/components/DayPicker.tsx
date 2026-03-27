import { format, parseISO } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import type { FunctionComponent } from 'react';
import { useMemo } from 'react';
import DatePicker from 'react-datepicker';

import { PickerDropdown } from './PickerDropdown';

type DayPickerProps = {
  selectedDay: string | null;
  availableDays: string[];
  onChange: (day: string) => void;
};

export const DayPicker: FunctionComponent<DayPickerProps> = ({ selectedDay, availableDays, onChange }) => {
  const includeDates = useMemo(() => availableDays.map(d => parseISO(d)), [availableDays]);

  const current = selectedDay ? parseISO(selectedDay) : null;
  const minDate = includeDates.length ? includeDates[0] : undefined;
  const maxDate = includeDates.length ? includeDates[includeDates.length - 1] : undefined;

  const label = current ? format(current, 'd MMMM yyyy', { locale: frLocale }) : '—';

  return (
    <PickerDropdown label={label}>
      {({ close }) => (
        <DatePicker
          calendarClassName="helios-calendar"
          selected={current}
          onChange={(date: Date | null) => {
            if (date) {
              onChange(format(date, 'yyyy-MM-dd'));
              close();
            }
          }}
          inline
          locale={frLocale}
          includeDates={includeDates}
          minDate={minDate}
          maxDate={maxDate}
        />
      )}
    </PickerDropdown>
  );
};
