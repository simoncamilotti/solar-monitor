import { motion } from 'framer-motion';
import type { FunctionComponent } from 'react';
import { useCallback } from 'react';

import type { LifetimeDataResponseDto } from '@/shared-models';

import { Chart } from '../../charts/components/Chart';
import { metricColors } from '../constants/metrics-colors';
import type { ComparisonParams, Metric } from '../home.type';
import { useComparisonChart } from '../hooks/use-comparison-chart.hook';

type ComparisonChartProps = {
  data: LifetimeDataResponseDto;
  comparisonParams: ComparisonParams;
  setComparisonParams: React.Dispatch<React.SetStateAction<ComparisonParams>>;
};

export const ComparisonChart: FunctionComponent<ComparisonChartProps> = ({
  data,
  comparisonParams,
  setComparisonParams,
}) => {
  const { chartOptions } = useComparisonChart(data, comparisonParams);

  const handleMetricToggle = useCallback(
    (metric: Metric) => {
      setComparisonParams(prev => ({
        ...prev,
        metrics: prev.metrics.map(m => (m.key === metric.key ? { ...m, enabled: !m.enabled } : m)),
      }));
    },
    [setComparisonParams],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Comparaison annuelle</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Production mensuelle en kWh</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {comparisonParams.metrics.map(m => (
            <button
              key={m.key}
              onClick={() => handleMetricToggle(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth ${
                m.enabled ? 'text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              style={m.enabled ? { backgroundColor: metricColors[m.key] } : undefined}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[350px] w-full">
        <Chart option={chartOptions} height={'350px'} />
      </div>
    </motion.div>
  );
};
