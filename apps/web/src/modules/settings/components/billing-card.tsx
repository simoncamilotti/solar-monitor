import { format, parseISO } from 'date-fns';
import { CalendarClock, Loader2, Save, X } from 'lucide-react';
import { type FormEvent, type FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePricingGetBilling } from '@repo/api-client';
import { billingSchema } from '@repo/contracts';

import { useDateLocale } from '../../../i18n/date-locale.js';
import { billingPeriodOf, currentBillingYear } from '../../savings/billing-computation.js';
import { useUpdateBillingMutation } from '../hooks/use-tariff-mutations.hook.js';

/** Start of the yearly billing period of the surplus resale, to date the estimate on the dashboard. */
export const BillingCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const locale = useDateLocale();
  const { data, isPending, isError } = usePricingGetBilling();
  const mutation = useUpdateBillingMutation();
  // The stored day until the user edits it.
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? data?.startDate ?? '';

  const parsed = billingSchema.safeParse({ startDate: value === '' ? null : value });
  const hasChanged = draft !== null && parsed.success && parsed.data.startDate !== data?.startDate;

  const save = (startDate: string | null, successKey: 'success' | 'cleared') => {
    mutation.mutate(
      { data: { startDate } },
      {
        onSuccess: () => {
          toast.success(t(`billing.${successKey}`));
          setDraft(null);
        },
        onError: () => toast.error(t('billing.error')),
      },
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (parsed.success) save(parsed.data.startDate, parsed.data.startDate ? 'success' : 'cleared');
  };

  if (isPending) {
    return <div className="h-24 bg-muted animate-pulse rounded-xl" />;
  }

  const day = (date: string) => format(parseISO(date), 'd MMM yyyy', { locale });
  const storedStart = data?.startDate ?? null;
  // Today, in UTC like the stored days.
  const currentYear = storedStart
    ? currentBillingYear(storedStart, new Date().toISOString().slice(0, 10))
    : null;
  const current =
    storedStart && currentYear !== null ? billingPeriodOf(storedStart, currentYear) : null;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-medium text-foreground mb-1">{t('billing.title')}</h2>
        <p className="text-xs text-muted-foreground">{t('billing.description')}</p>
      </div>

      {isError && <p className="text-destructive text-sm">{t('billing.loadError')}</p>}

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-card"
      >
        <div className="flex items-center gap-3">
          <CalendarClock className="w-4 h-4 text-muted-foreground" />
          <label htmlFor="billing-start" className="text-sm font-medium text-foreground">
            {t('billing.startDate')}
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="billing-start"
            type="date"
            value={value}
            onChange={(e) => setDraft(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
          />
          <button
            type="submit"
            disabled={mutation.isPending || !hasChanged}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 rounded-lg border border-border bg-card"
          >
            {mutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {t('billing.save')}
          </button>
          {storedStart && (
            <button
              type="button"
              onClick={() => save(null, 'cleared')}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50 rounded-lg border border-border bg-card"
            >
              <X className="w-3.5 h-3.5" />
              {t('billing.clear')}
            </button>
          )}
        </div>
      </form>

      {storedStart && (
        <p className="text-xs text-muted-foreground">
          {current
            ? t('billing.currentPeriod', { from: day(current.start), to: day(current.end) })
            : t('billing.notStarted', { date: day(storedStart) })}
        </p>
      )}
    </div>
  );
};
