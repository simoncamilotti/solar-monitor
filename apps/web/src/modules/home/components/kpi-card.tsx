import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { formatNumber, formatPercent } from '../../shared/format/index.js';

type KPICardProps = {
  title: string;
  value: string;
  unit: string;
  delta: number | null;
  /** A relative change of an energy, or a difference between two rates. */
  deltaUnit?: 'percent' | 'points';
  icon: LucideIcon;
  color?: string;
  /** Values of the last buckets of the period, oldest first, drawn as small bars. */
  sparkline?: number[];
  index?: number;
};

const SPARKLINE_HEIGHT = 32;

const Sparkline: FunctionComponent<{ values: number[]; color: string }> = ({ values, color }) => {
  const max = Math.max(...values.map((v) => Math.abs(v)), 0);
  if (max === 0) {
    return null;
  }
  return (
    <svg
      width={values.length * 7}
      height={SPARKLINE_HEIGHT}
      viewBox={`0 0 ${values.length * 7} ${SPARKLINE_HEIGHT}`}
      aria-hidden="true"
      data-testid="kpi-sparkline"
    >
      {values.map((v, i) => {
        const h = Math.max(2, (Math.abs(v) / max) * SPARKLINE_HEIGHT);
        return (
          <rect
            key={i}
            x={i * 7}
            y={SPARKLINE_HEIGHT - h}
            width={5}
            height={h}
            rx={1}
            fill={color}
            opacity={i === values.length - 1 ? 1 : 0.45}
          />
        );
      })}
    </svg>
  );
};

export const KPICard: FunctionComponent<KPICardProps> = ({
  title,
  value,
  unit,
  delta,
  deltaUnit = 'percent',
  icon: Icon,
  color,
  sparkline,
  index = 0,
}) => {
  const { t, i18n } = useTranslation();
  const isPositive = delta !== null && delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center bg-muted`}
          style={color ? { backgroundColor: `${color}20` } : undefined}
        >
          <Icon
            className={`w-4 h-4 ${color ? '' : 'text-muted-foreground'}`}
            style={color ? { color } : undefined}
          />
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight data-text">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        {sparkline && sparkline.length > 1 && color && (
          <Sparkline values={sparkline} color={color} />
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {delta !== null ? (
          <>
            <div
              className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-sm ${
                isPositive ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
              }`}
            >
              {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span className="data-text">
                {deltaUnit === 'points'
                  ? t('home.kpi.points', { value: formatNumber(Math.abs(delta), i18n.language) })
                  : formatPercent(Math.abs(delta), i18n.language)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{t('home.kpi.vsPrevious')}</span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">{t('home.kpi.noPrevious')}</span>
        )}
      </div>
    </motion.div>
  );
};
