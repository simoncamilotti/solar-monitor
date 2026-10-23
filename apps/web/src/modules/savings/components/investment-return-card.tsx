import { parseISO } from 'date-fns';
import { PiggyBank } from 'lucide-react';
import { type FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { LifetimeDay, Tariff } from '@repo/contracts';

import { formatEuros } from '../format-currency.js';
import { computeInvestmentReturn } from '../savings-computation.js';

type InvestmentReturnCardProps = {
  data: LifetimeDay[];
  tariffs: Tariff[];
  cost: number;
};

/** Gain since commissioning against the cost of the installation, whatever the period shown. */
export const InvestmentReturnCard: FunctionComponent<InvestmentReturnCardProps> = ({
  data,
  tariffs,
  cost,
}) => {
  const { t, i18n } = useTranslation();
  const result = useMemo(() => computeInvestmentReturn(data, tariffs, cost), [data, tariffs, cost]);
  const percent = Math.round(result.share * 100);
  const paybackMonth = result.paybackDay
    ? new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(
        parseISO(result.paybackDay),
      )
    : null;

  return (
    <section aria-labelledby="investment-return-title" className="card-elevated p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="investment-return-title" className="text-sm text-muted-foreground">
          {t('savings.investment.title')}
        </h2>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
          <PiggyBank className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{percent} %</span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {t('savings.investment.progress', {
            gained: formatEuros(result.gained, i18n.language, 0),
            cost: formatEuros(cost, i18n.language, 0),
          })}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={t('savings.investment.title')}
        className="h-2 rounded-full bg-muted overflow-hidden"
      >
        <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
      </div>

      <p className="text-xs text-muted-foreground">
        {paybackMonth === null
          ? t('savings.investment.noEstimate')
          : result.paidBack
            ? t('savings.investment.paidBack', { date: paybackMonth })
            : t('savings.investment.estimate', { date: paybackMonth })}
      </p>
    </section>
  );
};
