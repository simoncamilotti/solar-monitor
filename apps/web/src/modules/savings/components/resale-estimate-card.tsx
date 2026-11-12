import { format, parseISO } from 'date-fns';
import { CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';
import { type FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { LifetimeDay, Tariff } from '@repo/contracts';

import { useDateLocale } from '../../../i18n/date-locale.js';
import { resaleBasisKey } from '../../../i18n/keys.js';
import {
  computePeriodResale,
  currentBillingYear,
  oldestBillingYear,
} from '../billing-computation.js';
import { formatEuros } from '../format-currency.js';

type ResaleEstimateCardProps = {
  data: LifetimeDay[];
  tariffs: Tariff[];
  billingStart: string;
  /** Start year of the period shown; the current one when absent, invalid or out of bounds. */
  year?: number;
  onYearChange: (year: number | undefined) => void;
  /** `yyyy-MM-dd`, UTC. A parameter so that tests and screenshots do not depend on the clock. */
  today?: string;
};

const navButtonClasses =
  'p-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:hover:bg-card';

/** What the surplus resale of a billing period amounts to, and an estimate for the current one. */
export const ResaleEstimateCard: FunctionComponent<ResaleEstimateCardProps> = ({
  data,
  tariffs,
  billingStart,
  year,
  onYearChange,
  today = new Date().toISOString().slice(0, 10),
}) => {
  const { t, i18n } = useTranslation();
  const locale = useDateLocale();
  const currentYear = currentBillingYear(billingStart, today);
  const oldestYear =
    currentYear === null ? null : oldestBillingYear(billingStart, data, currentYear);
  const shownYear =
    currentYear !== null &&
    oldestYear !== null &&
    year !== undefined &&
    year >= oldestYear &&
    year <= currentYear
      ? year
      : currentYear;
  const resale = useMemo(
    () =>
      shownYear === null
        ? null
        : computePeriodResale(data, tariffs, billingStart, shownYear, today),
    [data, tariffs, billingStart, shownYear, today],
  );

  const day = (date: string) => format(parseISO(date), 'd MMM yyyy', { locale });

  return (
    <section aria-labelledby="resale-estimate-title" className="card-elevated p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="resale-estimate-title" className="text-sm text-muted-foreground">
          {t('savings.resale.title')}
        </h2>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
          <CalendarClock className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {resale === null || shownYear === null || oldestYear === null || currentYear === null ? (
        <p className="text-sm text-muted-foreground">
          {t('savings.resale.notStarted', { date: day(billingStart) })}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onYearChange(shownYear - 1)}
                disabled={shownYear <= oldestYear}
                aria-label={t('savings.resale.previous')}
                className={navButtonClasses}
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="text-sm font-medium tabular-nums" aria-live="polite">
                {t('savings.resale.period', {
                  from: day(resale.period.start),
                  to: day(resale.period.end),
                })}
              </span>
              <button
                type="button"
                onClick={() =>
                  onYearChange(shownYear + 1 >= currentYear ? undefined : shownYear + 1)
                }
                disabled={shownYear >= currentYear}
                aria-label={t('savings.resale.next')}
                className={navButtonClasses}
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            {!resale.isCurrent && (
              <button
                type="button"
                onClick={() => onYearChange(undefined)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              >
                {t('savings.resale.backToCurrent')}
              </button>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">
              {resale.isCurrent && resale.estimate
                ? t('savings.resale.estimate')
                : resale.isCurrent
                  ? t('savings.resale.acquiredLabel')
                  : t('savings.resale.final')}
            </span>
            <div className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatEuros(
                resale.isCurrent && resale.estimate ? resale.estimate.amount : resale.acquired,
                i18n.language,
              )}
            </div>
            {resale.isCurrent && resale.estimate && (
              <p className="text-xs text-muted-foreground tabular-nums">
                {t('savings.resale.acquired', {
                  amount: formatEuros(resale.acquired, i18n.language),
                })}
              </p>
            )}
          </div>

          {resale.isCurrent && (
            <div className="space-y-2">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={resale.period.totalDays}
                aria-valuenow={resale.elapsedDays}
                aria-label={t('savings.resale.title')}
                className="h-2 rounded-full bg-muted overflow-hidden"
              >
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(resale.elapsedDays / resale.period.totalDays) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('savings.resale.progress', {
                  count: resale.elapsedDays,
                  elapsed: resale.elapsedDays,
                  remaining: resale.remainingDays,
                })}
              </p>
            </div>
          )}

          <div className="space-y-1 text-xs text-muted-foreground">
            {resale.isCurrent && (
              <p>
                {resale.estimate
                  ? t(resaleBasisKey(resale.estimate.basis))
                  : t('savings.resale.noEstimate')}
              </p>
            )}
            {resale.missingDays > 0 && (
              <p>{t('savings.resale.missing', { count: resale.missingDays })}</p>
            )}
            {resale.unpricedDays > 0 && (
              <p>{t('savings.resale.unpriced', { count: resale.unpricedDays })}</p>
            )}
          </div>
        </>
      )}
    </section>
  );
};
