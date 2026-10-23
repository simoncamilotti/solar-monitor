import { RefreshCw, ShieldCheck, SolarPanel, Zap } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { getEnergyColors, useDisplayedTheme } from '../../shared/metrics/energy-colors.js';
import type { KpiSparklines } from '../hooks/dashboard-buckets.js';
import type { DashboardKpis } from '../hooks/use-dashboard-kpis.hook.js';
import { KPICard } from './kpi-card.js';

type DashboardKPIGridProps = {
  kpis: DashboardKpis;
  sparklines: KpiSparklines;
};

export const DashboardKPIGrid: FunctionComponent<DashboardKPIGridProps> = ({
  kpis,
  sparklines,
}) => {
  const { t } = useTranslation();
  const colors = getEnergyColors(useDisplayedTheme());

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        title={t('home.kpi.consumption')}
        value={kpis.consumption.toFixed(1)}
        unit="kWh"
        delta={kpis.consumptionDelta}
        icon={Zap}
        color={colors.consumption}
        sparkline={sparklines.consumption}
        index={0}
      />
      <KPICard
        title={t('home.kpi.production')}
        value={kpis.production.toFixed(1)}
        unit="kWh"
        delta={kpis.productionDelta}
        icon={SolarPanel}
        color={colors.production}
        sparkline={sparklines.production}
        index={1}
      />
      <KPICard
        title={t('home.kpi.autonomy')}
        value={kpis.autonomy.toFixed(1)}
        unit="%"
        delta={kpis.autonomyDelta}
        deltaUnit="points"
        icon={ShieldCheck}
        color={colors.production}
        sparkline={sparklines.autonomy}
        index={2}
      />
      <KPICard
        title={t('home.kpi.selfConsumption')}
        value={kpis.selfConsumption.toFixed(1)}
        unit="%"
        delta={kpis.selfConsumptionDelta}
        deltaUnit="points"
        icon={RefreshCw}
        color={colors.export}
        sparkline={sparklines.selfConsumption}
        index={3}
      />
    </div>
  );
};
