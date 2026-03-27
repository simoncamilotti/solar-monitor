import { format, parseISO } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import type { FunctionComponent } from 'react';
import DatePicker from 'react-datepicker';

import { PickerDropdown } from './PickerDropdown';

type DateRangePickerProps = {
  startDate: string | null;
  endDate: string | null;
  minDate: Date | null;
  maxDate: Date | null;
  onChange: (startDate: string | null, endDate: string | null) => void;
};

const toDate = (dateStr: string | null): Date | null => (dateStr ? parseISO(dateStr) : null);
const toIso = (date: Date): string => format(date, 'yyyy-MM-dd');

const formatLabel = (from: Date | null, to: Date | null): string => {
  if (from && to) {
    return `${format(from, 'd MMM yyyy', { locale: frLocale })} — ${format(to, 'd MMM yyyy', { locale: frLocale })}`;
  }
  if (from) {
    return `${format(from, 'd MMM yyyy', { locale: frLocale })} — ...`;
  }
  return '—';
};

export const DateRangePicker: FunctionComponent<DateRangePickerProps> = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  onChange,
}) => {
  const from = toDate(startDate);
  const to = toDate(endDate);

  return (
    <PickerDropdown label={formatLabel(from, to)}>
      {({ close }) => (
        <DatePicker
          calendarClassName="helios-calendar"
          selected={from}
          onChange={(dates: [Date | null, Date | null]) => {
            const [start, end] = dates;
            onChange(start ? toIso(start) : null, end ? toIso(end) : null);
            if (start && end) close();
          }}
          startDate={from}
          endDate={to}
          selectsRange
          inline
          monthsShown={1}
          locale={frLocale}
          minDate={minDate ?? undefined}
          maxDate={maxDate ?? undefined}
        />
      )}
    </PickerDropdown>
  );
};
