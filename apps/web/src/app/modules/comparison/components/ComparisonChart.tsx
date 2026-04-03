import type { EChartsOption } from 'echarts';
import { motion } from 'framer-motion';
import { BarChart3, LineChart } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Chart } from '../../charts/components/Chart';
import { ALL_METRICS, metricColors } from '../../shared/metrics';
import type { ComparisonChartType, ComparisonMetricKey } from '../comparison.type';

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
  const { t } = useTranslation('web');

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-6 flex-1 flex flex-col min-h-0"
    >
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex flex-wrap gap-1.5">
          {ALL_METRICS.map(m => (
            <button
              key={m}
              onClick={() => onMetricChange(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth ${
                selectedMetric === m
                  ? 'text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              style={selectedMetric === m ? { backgroundColor: metricColors[m] } : undefined}
            >
              {t(`compare.metrics.${m}`)}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg bg-muted p-1 shrink-0">
          <button
            onClick={() => onChartTypeChange('bar')}
            className={`p-1.5 rounded-md transition-smooth ${
              chartType === 'bar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            title={t('compare.chartType.bar')}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChartTypeChange('line')}
            className={`p-1.5 rounded-md transition-smooth ${
              chartType === 'line' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
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
