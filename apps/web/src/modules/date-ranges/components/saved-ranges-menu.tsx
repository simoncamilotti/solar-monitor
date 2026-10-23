import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover';
import { Separator } from '@repo/ui/components/separator';
import { format, parseISO } from 'date-fns';
import { Bookmark, BookmarkPlus, Check, Pencil, Trash2, X } from 'lucide-react';
import { type FormEvent, type FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ApiError, useDateRangesFindAll } from '@repo/api-client';
import type { DateRange } from '@repo/contracts';

import { useDateLocale } from '../../../i18n/date-locale.js';
import {
  useDeleteDateRangeMutation,
  useUpdateDateRangeMutation,
} from '../hooks/use-date-range-mutations.hook.js';
import { useSaveDateRange } from '../hooks/use-save-date-range.hook.js';

type SavedRangesMenuProps = {
  /** Called with the range clicked in the list. */
  onApply: (range: DateRange) => void;
  /** The range on screen: when complete, the menu offers to save it under a name. */
  current?: { startDate: string | null; endDate: string | null };
};

const triggerClasses =
  'flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground hover:bg-muted aria-expanded:bg-muted transition-smooth focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20';

/** The household's saved ranges in a popover: apply one in a click, rename or delete it. */
export const SavedRangesMenu: FunctionComponent<SavedRangesMenuProps> = ({ onApply, current }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data, isPending, isError } = useDateRangesFindAll();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={triggerClasses}>
        <Bookmark className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <span>{t('savedRanges.title')}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        {current?.startDate && current.endDate && (
          <>
            <SaveCurrentForm startDate={current.startDate} endDate={current.endDate} />
            <Separator />
          </>
        )}
        {isPending && <div className="h-16 bg-muted animate-pulse rounded-lg" />}
        {isError && <p className="text-destructive text-xs p-2">{t('savedRanges.loadError')}</p>}
        {data?.length === 0 && (
          <p className="text-xs text-muted-foreground p-2">{t('savedRanges.empty')}</p>
        )}
        {data && data.length > 0 && (
          <ul className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
            {data.map((range) => (
              <SavedRangeItem
                key={range.id}
                range={range}
                onApply={() => {
                  onApply(range);
                  setOpen(false);
                }}
              />
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

const SaveCurrentForm: FunctionComponent<{ startDate: string; endDate: string }> = ({
  startDate,
  endDate,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const { save, canSave, isPending } = useSaveDateRange();
  const input = { name, startDate, endDate };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    save(input, () => setName(''));
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-1">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('savedRanges.namePlaceholder')}
        aria-label={t('savedRanges.name')}
        maxLength={60}
        className="h-8"
      />
      <Button type="submit" variant="outline" size="sm" disabled={isPending || !canSave(input)}>
        <BookmarkPlus aria-hidden="true" />
        {t('savedRanges.save')}
      </Button>
    </form>
  );
};

const SavedRangeItem: FunctionComponent<{ range: DateRange; onApply: () => void }> = ({
  range,
  onApply,
}) => {
  const { t } = useTranslation();
  const locale = useDateLocale();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(range.name);
  const update = useUpdateDateRangeMutation();
  const remove = useDeleteDateRangeMutation();
  const day = (value: string) => format(parseISO(value), 'd MMM yyyy', { locale });

  const rename = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === range.name) {
      setEditing(false);
      return;
    }
    update.mutate(
      { id: range.id, data: { name: trimmed } },
      {
        onSuccess: () => setEditing(false),
        onError: (error) =>
          toast.error(
            error instanceof ApiError && error.status === 409
              ? t('savedRanges.duplicate')
              : t('savedRanges.renameError'),
          ),
      },
    );
  };

  const handleDelete = () =>
    remove.mutate({ id: range.id }, { onError: () => toast.error(t('savedRanges.deleteError')) });

  if (editing) {
    return (
      <li>
        <form onSubmit={rename} className="flex items-center gap-1 p-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label={t('savedRanges.name')}
            maxLength={60}
            className="h-8"
            autoFocus
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            disabled={update.isPending}
            aria-label={t('savedRanges.confirmRename')}
          >
            <Check aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setName(range.name);
              setEditing(false);
            }}
            aria-label={t('savedRanges.cancelRename')}
          >
            <X aria-hidden="true" />
          </Button>
        </form>
      </li>
    );
  }

  return (
    <li className="group flex items-center gap-1 rounded-md hover:bg-muted">
      <button
        type="button"
        onClick={onApply}
        className="flex-1 min-w-0 text-left px-2 py-1.5 rounded-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <span className="block truncate text-sm font-medium text-foreground">{range.name}</span>
        <span className="block text-xs text-muted-foreground">
          {range.startDate === range.endDate
            ? day(range.startDate)
            : `${day(range.startDate)} — ${day(range.endDate)}`}
        </span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setEditing(true)}
        aria-label={t('savedRanges.rename', { name: range.name })}
      >
        <Pencil aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleDelete}
        disabled={remove.isPending}
        aria-label={t('savedRanges.delete', { name: range.name })}
        className="hover:text-destructive"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </li>
  );
};
