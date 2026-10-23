import type { EChartsOption } from 'echarts';
import { motion } from 'framer-motion';
import { BarChart3, LineChart } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Chart } from '../../charts/components/chart.js';
import { getMetricColor, useDisplayedTheme } from '../../shared/metrics/energy-colors.js';
import { ALL_METRICS } from '../../shared/metrics/index.js';
import type { ComparisonChartType, ComparisonMetricKey } from '../comparison.type.js';

type ComparisonChartProps = {
  chartOptions: EChartsOption | undefined;
  selectedMetric: ComparisonMetricKey;
  chartType: ComparisonChartType;
  onMetricChange: (metric: ComparisonMetricKey) => void;
  onChartTypeChange: (type: ComparisonChartType) => void;
};

export const ComparisonChart: FunctionComponent<ComparisonChartProps> = ({
  chartOptions,
  selectedMetric,
  chartType,
  onMetricChange,
  onChartTypeChange,
}) => {
  const { t } = useTranslation();
  const theme = useDisplayedTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-6 flex-1 flex flex-col min-h-0"
    >
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div className="flex flex-wrap gap-1.5">
          {ALL_METRICS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={selectedMetric === m}
              onClick={() => onMetricChange(m)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-smooth ${
                selectedMetric === m
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <span
                className="w-2 h-2 rounded-xs"
                style={{ backgroundColor: getMetricColor(m, theme) }}
                aria-hidden="true"
              />
              {t(`compare.metrics.${m}`)}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg bg-muted p-1 shrink-0">
          <button
            type="button"
            aria-label={t('compare.chartType.bar')}
            onClick={() => onChartTypeChange('bar')}
            className={`p-1.5 rounded-md transition-smooth ${
              chartType === 'bar'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={t('compare.chartType.bar')}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={t('compare.chartType.line')}
            onClick={() => onChartTypeChange('line')}
            className={`p-1.5 rounded-md transition-smooth ${
              chartType === 'line'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={t('compare.chartType.line')}
          >
            <LineChart className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[400px]">
        {chartOptions ? (
          <Chart option={chartOptions} height="400px" />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {t('compare.periods.empty')}
          </div>
        )}
      </div>
    </motion.div>
  );
};
