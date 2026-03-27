import { RefreshCw, ShieldCheck, SolarPanel, Zap } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { dashboardMetricColors } from '../constants/dashboard-colors';
import type { DashboardKpis } from '../hooks/use-dashboard-kpis.hook';
import { KPICard } from './KPICard';

type DashboardKPIGridProps = {
  kpis: DashboardKpis;
};

export const DashboardKPIGrid: FunctionComponent<DashboardKPIGridProps> = ({ kpis }) => {
  const { t } = useTranslation('web');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title={t('home.kpi.consumption')}
        value={kpis.consumption.toFixed(1)}
        unit="kWh"
        delta={kpis.consumptionDelta}
        icon={Zap}
        color={dashboardMetricColors.kwhConsumed}
        index={0}
      />
      <KPICard
        title={t('home.kpi.production')}
        value={kpis.production.toFixed(1)}
        unit="kWh"
        delta={kpis.productionDelta}
        icon={SolarPanel}
        color={dashboardMetricColors.kwhProduced}
        index={1}
      />
      <KPICard
        title={t('home.kpi.autonomy')}
        value={kpis.autonomy.toFixed(1)}
        unit="%"
        delta={kpis.autonomyDelta}
        icon={ShieldCheck}
        color={dashboardMetricColors.kwhImported}
        index={2}
      />
      <KPICard
        title={t('home.kpi.selfConsumption')}
        value={kpis.selfConsumption.toFixed(1)}
        unit="%"
        delta={kpis.selfConsumptionDelta}
        icon={RefreshCw}
        color={dashboardMetricColors.kwhExported}
        index={3}
      />
    </div>
  );
};
