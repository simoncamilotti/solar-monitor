import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { parseISO } from 'date-fns';
import { Plus } from 'lucide-react';
import { type FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DateRangePicker } from '../../home/components/date-range-picker.js';
import type { RangePeriod } from '../comparison.type.js';

type RangePeriodFormProps = {
  /** First and last days of the history, `yyyy-MM-dd`. */
  firstDay: string | undefined;
  lastDay: string | undefined;
  onAdd: (period: RangePeriod) => void;
};

/** Adds a free range of days, both bounds included, with an optional name. */
export const RangePeriodForm: FunctionComponent<RangePeriodFormProps> = ({
  firstDay,
  lastDay,
  onAdd,
}) => {
  const { t } = useTranslation();
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [name, setName] = useState('');

  const submit = () => {
    if (!start || !end) return;
    const trimmed = name.trim();
    onAdd({ start, end, ...(trimmed ? { name: trimmed } : {}) });
    setStart(null);
    setEnd(null);
    setName('');
  };

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <DateRangePicker
        startDate={start}
        endDate={end}
        minDate={firstDay ? parseISO(firstDay) : null}
        maxDate={lastDay ? parseISO(lastDay) : null}
        placeholder={t('compare.ranges.pick')}
        onChange={(from, to) => {
          setStart(from);
          setEnd(to);
        }}
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('compare.ranges.name')}
        aria-label={t('compare.ranges.name')}
        maxLength={40}
        className="h-9 w-44"
      />
      <Button type="submit" variant="outline" size="lg" disabled={!start || !end}>
        <Plus aria-hidden="true" />
        {t('compare.periods.add')}
      </Button>
    </form>
  );
};
