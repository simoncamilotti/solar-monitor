import { Link } from '@tanstack/react-router';
import { Coins, HandCoins, PiggyBank, Wallet } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { usePricingFindTariffs, usePricingGetInstallation } from '@repo/api-client';
import type { LifetimeDay, Tariff } from '@repo/contracts';

import type { DashboardFilterState } from '../../home/dashboard.type.js';
import { usePeriodSavings } from '../hooks/use-period-savings.hook.js';
import { InvestmentReturnCard } from './investment-return-card.js';
import { MoneyCard } from './money-card.js';

type SavingsSectionProps = {
  data: LifetimeDay[];
  filters: DashboardFilterState;
};

/** What the installation earns, in euros: shown once tariffs are entered in the settings. */
export const SavingsSection: FunctionComponent<SavingsSectionProps> = ({ data, filters }) => {
  const { t } = useTranslation();
  const tariffs = usePricingFindTariffs();
  const installation = usePricingGetInstallation();

  if (tariffs.isPending) return null;
  if (tariffs.isError) {
    return <p className="text-destructive text-sm">{t('savings.loadError')}</p>;
  }

  if (tariffs.data.length === 0) {
    return (
      <div className="card-elevated p-6 flex flex-wrap items-center gap-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
          <PiggyBank className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="flex-1 min-w-48 text-sm text-muted-foreground">{t('savings.empty')}</p>
        <Link
          to="/settings"
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
        >
          {t('savings.goToSettings')}
        </Link>
      </div>
    );
  }

  return (
    <SavingsCards
      data={data}
      filters={filters}
      tariffs={tariffs.data}
      cost={installation.data?.cost ?? null}
    />
  );
};

const SavingsCards: FunctionComponent<
  SavingsSectionProps & { tariffs: Tariff[]; cost: number | null }
> = ({ data, filters, tariffs, cost }) => {
  const { t } = useTranslation();
  const savings = usePeriodSavings(data, filters, tariffs);

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
    </div>
  );
};
