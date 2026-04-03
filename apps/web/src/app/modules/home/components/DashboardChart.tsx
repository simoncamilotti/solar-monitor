import type { EChartsOption } from 'echarts';
import { motion } from 'framer-motion';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Chart } from '../../charts/components/Chart';
import { metricColors } from '../../shared/metrics/metric-colors';
import type { DashboardMetricKey } from '../dashboard.type';

export const METRICS_MAPPING: Array<{ key: DashboardMetricKey; labelKey: string }> = [
  { key: 'kwhConsumed', labelKey: 'home.chart.consumption' },
  { key: 'kwhProduced', labelKey: 'home.chart.production' },
  { key: 'kwhImported', labelKey: 'home.chart.import' },
  { key: 'kwhExported', labelKey: 'home.chart.export' },
];

type DashboardChartProps = {
  chartOptions: EChartsOption;
  selectedMetric: DashboardMetricKey;
  onMetricChange: (metric: DashboardMetricKey) => void;
};

export const DashboardChart: FunctionComponent<DashboardChartProps> = ({
  chartOptions,
  selectedMetric,
  onMetricChange,
}) => {
  const { t } = useTranslation('web');

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-6 flex-1 flex flex-col min-h-0"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          {t(
            `home.chart.${METRICS_MAPPING.find(m => m.key === selectedMetric)
              ?.labelKey.split('.')
              .pop()}`,
          )}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {METRICS_MAPPING.map(m => (
            <button
              key={m.key}
              onClick={() => onMetricChange(m.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth ${
                selectedMetric === m.key
                  ? 'text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              style={selectedMetric === m.key ? { backgroundColor: metricColors[m.key] } : undefined}
            >
              {t(m.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <Chart option={chartOptions} height="300px" />
      </div>
    </motion.div>
  );
};
