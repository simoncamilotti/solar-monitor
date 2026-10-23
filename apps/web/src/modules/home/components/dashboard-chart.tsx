import type { EChartsOption } from 'echarts';
import { motion } from 'framer-motion';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Chart } from '../../charts/components/chart.js';
import { getEnergyColors, useDisplayedTheme } from '../../shared/metrics/energy-colors.js';
import type { DashboardViewMode } from '../dashboard.type.js';

type DashboardChartProps = {
  chartOptions: EChartsOption;
  viewMode: DashboardViewMode;
};

const TITLE_KEY = {
  full: 'home.chart.titleByYear',
  yearly: 'home.chart.titleByMonth',
  monthly: 'home.chart.titleByDay',
  custom: 'home.chart.titleByDay',
} as const satisfies Record<DashboardViewMode, string>;

export const DashboardChart: FunctionComponent<DashboardChartProps> = ({
  chartOptions,
  viewMode,
}) => {
  const { t } = useTranslation();
  const colors = getEnergyColors(useDisplayedTheme());

  const legend = [
    { label: t('home.chart.selfConsumed'), color: colors.production },
    { label: t('home.chart.imported'), color: colors.import },
    { label: t('home.chart.exported'), color: colors.export },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-6 flex-1 flex flex-col min-h-0 min-w-0"
      aria-labelledby="dashboard-chart-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <h3 id="dashboard-chart-title" className="text-sm font-semibold text-foreground">
            {t(TITLE_KEY[viewMode])}
          </h3>
          <p className="text-xs text-muted-foreground">{t('home.chart.description')}</p>
        </div>
        <ul className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-xs"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 min-h-[300px]">
        <Chart option={chartOptions} height="300px" />
      </div>
    </motion.section>
  );
};
