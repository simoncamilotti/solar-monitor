import { Calendar } from '@repo/ui/components/calendar';
import { format, isBefore, parseISO } from 'date-fns';
import type { Locale } from 'date-fns/locale';
import type { FunctionComponent } from 'react';

import { useDateLocale } from '../../../i18n/date-locale.js';

import { calendarBounds, initialMonth } from './date-bounds.js';
import { PickerDropdown } from './picker-dropdown.js';

type DateRangePickerProps = {
  startDate: string | null;
  endDate: string | null;
  minDate: Date | null;
  maxDate: Date | null;
  onChange: (startDate: string | null, endDate: string | null) => void;
  /** Shown while no date is chosen. */
  placeholder?: string;
};

const toDate = (dateStr: string | null): Date | undefined =>
  dateStr ? parseISO(dateStr) : undefined;
const toIso = (date: Date): string => format(date, 'yyyy-MM-dd');

const formatLabel = (
  from: Date | undefined,
  to: Date | undefined,
  locale: Locale,
  placeholder: string,
) => {
  if (from && to) {
    return `${format(from, 'd MMM yyyy', { locale })} — ${format(to, 'd MMM yyyy', { locale })}`;
  }
  if (from) {
    return `${format(from, 'd MMM yyyy', { locale })} — ...`;
  }
  return placeholder;
};

/**
 * Two clicks pick a range: the first sets its start, the second its end (or its start, when
 * before the first). A third click starts a new range.
 */
export const DateRangePicker: FunctionComponent<DateRangePickerProps> = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  onChange,
  placeholder = '—',
}) => {
  const locale = useDateLocale();
  const from = toDate(startDate);
  const to = toDate(endDate);
  const bounds = calendarBounds(minDate ?? undefined, maxDate ?? undefined);

  return (
    <PickerDropdown label={formatLabel(from, to, locale, placeholder)}>
      {({ close }) => (
        <Calendar
          mode="range"
          locale={locale}
          captionLayout="dropdown"
          selected={from ? { from, to } : undefined}
          defaultMonth={from ?? initialMonth(bounds.startMonth, bounds.endMonth)}
          {...bounds}
          onSelect={(_range, day) => {
            if (from && !to) {
              const [start, end] = isBefore(day, from) ? [day, from] : [from, day];
              onChange(toIso(start), toIso(end));
              close();
            } else {
              onChange(toIso(day), null);
            }
          }}
        />
      )}
    </PickerDropdown>
  );
};
