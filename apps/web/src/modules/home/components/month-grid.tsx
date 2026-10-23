import { Button } from '@repo/ui/components/button';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDateLocale } from '../../../i18n/date-locale.js';

import { PickerGrid } from './picker-grid.js';

type MonthGridProps = {
  /** Year and month (0-11) shown as selected. */
  selected?: { year: number; month: number };
  min: Date | undefined;
  max: Date | undefined;
  onSelect: (year: number, month: number) => void;
};

const monthIndex = (year: number, month: number) => year * 12 + month;
const dateIndex = (date: Date) => monthIndex(date.getFullYear(), date.getMonth());

/** The twelve months of a year, with arrows to the previous and next years. */
export const MonthGrid: FunctionComponent<MonthGridProps> = ({ selected, min, max, onSelect }) => {
  const { t } = useTranslation();
  const locale = useDateLocale();
  const [year, setYear] = useState(
    () => selected?.year ?? max?.getFullYear() ?? new Date().getFullYear(),
  );

  const items = Array.from({ length: 12 }, (_, month) => {
    const index = monthIndex(year, month);
    return {
      key: month,
      label: format(new Date(year, month, 1), 'MMM', { locale }),
      selected: selected?.year === year && selected.month === month,
      disabled:
        (min !== undefined && index < dateIndex(min)) ||
        (max !== undefined && index > dateIndex(max)),
      onSelect: () => onSelect(year, month),
    };
  });

  const header = (
    <div className="flex items-center justify-between">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t('picker.previousYear')}
        disabled={min !== undefined && year <= min.getFullYear()}
        onClick={() => setYear((y) => y - 1)}
      >
        <ChevronLeft />
      </Button>
      <span className="text-sm font-medium" aria-live="polite">
        {year}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t('picker.nextYear')}
        disabled={max !== undefined && year >= max.getFullYear()}
        onClick={() => setYear((y) => y + 1)}
      >
        <ChevronRight />
      </Button>
    </div>
  );

  return <PickerGrid items={items} header={header} />;
};
