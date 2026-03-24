import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

type KPICardProps = {
  title: string;
  value: string;
  unit: string;
  delta: number | null;
  icon: LucideIcon;
  color?: string;
  index?: number;
};

export const KPICard: FunctionComponent<KPICardProps> = ({
  title,
  value,
  unit,
  delta,
  icon: Icon,
  color,
  index = 0,
}) => {
  const { t } = useTranslation('web');
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
          <Icon className={`w-4 h-4 ${color ? '' : 'text-muted-foreground'}`} style={color ? { color } : undefined} />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight data-text">{value}</span>
        <span className="text-sm text-muted-foreground/60">{unit}</span>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {delta !== null ? (
          <>
            <div
              className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
                isPositive ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
              }`}
            >
              {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span className="data-text">{Math.abs(delta).toFixed(1)}%</span>
            </div>
            <span className="text-xs text-muted-foreground">{t('home.kpi.vsPrevious')}</span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">--</span>
        )}
      </div>
    </motion.div>
  );
};
