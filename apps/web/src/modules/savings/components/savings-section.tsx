import { Link } from '@tanstack/react-router';
import { Coins, HandCoins, PiggyBank, Wallet } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  usePricingFindTariffs,
  usePricingGetBilling,
  usePricingGetInstallation,
} from '@repo/api-client';
import type { LifetimeDay, Tariff } from '@repo/contracts';

import type { DashboardFilterState } from '../../home/dashboard.type.js';
import { usePeriodSavings } from '../hooks/use-period-savings.hook.js';
import { InvestmentReturnCard } from './investment-return-card.js';
import { MoneyCard } from './money-card.js';
import { ResaleEstimateCard } from './resale-estimate-card.js';

type SavingsSectionProps = {
  data: LifetimeDay[];
  filters: DashboardFilterState;
  /** Start year of the billing period shown by the resale card; the current one when absent. */
  billingYear?: number;
  onBillingYearChange?: (year: number | undefined) => void;
};

/** What the installation earns, in euros: shown once tariffs are entered in the settings. */
export const SavingsSection: FunctionComponent<SavingsSectionProps> = ({
  data,
  filters,
  billingYear,
  onBillingYearChange,
}) => {
  const { t } = useTranslation();
  const tariffs = usePricingFindTariffs();
  const installation = usePricingGetInstallation();

  if (tariffs.isPending) return null;
  if (tariffs.isError) {
    return <p className="text-destructive text-sm">{t('savings.loadError')}</p>;
  }

  if (tariffs.data.length === 0) {
    return (
      <SettingsInvitation message={t('savings.empty')} linkLabel={t('savings.goToSettings')} />
    );
  }

  return (
    <SavingsCards
      data={data}
      filters={filters}
      tariffs={tariffs.data}
      cost={installation.data?.cost ?? null}
      billingYear={billingYear}
      onBillingYearChange={onBillingYearChange}
    />
  );
};

const SavingsCards: FunctionComponent<
  SavingsSectionProps & { tariffs: Tariff[]; cost: number | null }
> = ({ data, filters, tariffs, cost, billingYear, onBillingYearChange }) => {
  const { t } = useTranslation();
  const savings = usePeriodSavings(data, filters, tariffs);
  const billing = usePricingGetBilling();
  const hasFeedIn = tariffs.some((tariff) => tariff.kind === 'feedIn');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MoneyCard
          title={t('savings.savings')}
          amount={savings.savings}
          delta={savings.savingsDelta}
          icon={Wallet}
        />
        <MoneyCard
          title={t('savings.revenue')}
          amount={savings.revenue}
          delta={savings.revenueDelta}
          icon={HandCoins}
        />
        <MoneyCard
          title={t('savings.total')}
          amount={savings.total}
          delta={savings.totalDelta}
          icon={Coins}
        />
      </div>
      {savings.unpricedDays > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('savings.unpricedDays', { count: savings.unpricedDays })}
        </p>
      )}
      {cost !== null && <InvestmentReturnCard data={data} tariffs={tariffs} cost={cost} />}
      {billing.isError && (
        <p className="text-destructive text-sm">{t('savings.resale.loadError')}</p>
      )}
      {billing.data &&
        (billing.data.startDate === null || !hasFeedIn ? (
          <SettingsInvitation
            message={t(
              billing.data.startDate === null
                ? 'savings.resale.emptyBilling'
                : 'savings.resale.emptyTariff',
            )}
          />
        ) : (
          <ResaleEstimateCard
            data={data}
            tariffs={tariffs}
            billingStart={billing.data.startDate}
            year={billingYear}
            onYearChange={onBillingYearChange ?? (() => undefined)}
          />
        ))}
    </div>
  );
};

/** A card that tells what is missing, with a link to the settings that fill it in. */
const SettingsInvitation: FunctionComponent<{ message: string; linkLabel?: string }> = ({
  message,
  linkLabel,
}) => {
  const { t } = useTranslation();

  return (
    <div className="card-elevated p-6 flex flex-wrap items-center gap-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
        <PiggyBank className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className="flex-1 min-w-48 text-sm text-muted-foreground">{message}</p>
      <Link
        to="/settings"
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
      >
        {linkLabel ?? t('savings.resale.goToSettings')}
      </Link>
    </div>
  );
};
