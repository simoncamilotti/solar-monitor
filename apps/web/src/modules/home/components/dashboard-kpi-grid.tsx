import { RefreshCw, ShieldCheck, SolarPanel, Zap } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { metricColors } from '../../shared/metrics/metric-colors.js';
import type { DashboardKpis } from '../hooks/use-dashboard-kpis.hook.js';
import { KPICard } from './kpi-card.js';

type DashboardKPIGridProps = {
  kpis: DashboardKpis;
};

export const DashboardKPIGrid: FunctionComponent<DashboardKPIGridProps> = ({ kpis }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title={t('home.kpi.consumption')}
        value={kpis.consumption.toFixed(1)}
        unit="kWh"
        delta={kpis.consumptionDelta}
        icon={Zap}
        color={metricColors.kwhConsumed}
        index={0}
      />
      <KPICard
        title={t('home.kpi.production')}
        value={kpis.production.toFixed(1)}
        unit="kWh"
        delta={kpis.productionDelta}
        icon={SolarPanel}
        color={metricColors.kwhProduced}
        index={1}
      />
      <KPICard
        title={t('home.kpi.autonomy')}
        value={kpis.autonomy.toFixed(1)}
        unit="%"
        delta={kpis.autonomyDelta}
        icon={ShieldCheck}
        color={metricColors.kwhImported}
        index={2}
      />
      <KPICard
        title={t('home.kpi.selfConsumption')}
        value={kpis.selfConsumption.toFixed(1)}
        unit="%"
        delta={kpis.selfConsumptionDelta}
        icon={RefreshCw}
        color={metricColors.kwhExported}
        index={3}
      />
    </div>
  );
};
