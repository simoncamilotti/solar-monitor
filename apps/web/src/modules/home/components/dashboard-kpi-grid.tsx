import { RefreshCw, ShieldCheck, SolarPanel, Zap } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { energyParts, formatNumber } from '../../shared/format/index.js';
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
  const { t, i18n } = useTranslation();
  const colors = getEnergyColors(useDisplayedTheme());
  const consumption = energyParts(kpis.consumption, i18n.language);
  const production = energyParts(kpis.production, i18n.language);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        title={t('home.kpi.consumption')}
        value={consumption.value}
        unit={consumption.unit}
        delta={kpis.consumptionDelta}
        icon={Zap}
        color={colors.consumption}
        sparkline={sparklines.consumption}
        index={0}
      />
      <KPICard
        title={t('home.kpi.production')}
        value={production.value}
        unit={production.unit}
        delta={kpis.productionDelta}
        icon={SolarPanel}
        color={colors.production}
        sparkline={sparklines.production}
        index={1}
      />
      <KPICard
        title={t('home.kpi.autonomy')}
        value={formatNumber(kpis.autonomy, i18n.language)}
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
        value={formatNumber(kpis.selfConsumption, i18n.language)}
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
