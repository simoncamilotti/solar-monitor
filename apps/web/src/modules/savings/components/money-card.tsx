import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { formatPercent } from '../../shared/format/index.js';
import { formatEuros } from '../format-currency.js';

type MoneyCardProps = {
  title: string;
  amount: number;
  delta: number | null;
  icon: LucideIcon;
};

export const MoneyCard: FunctionComponent<MoneyCardProps> = ({
  title,
  amount,
  delta,
  icon: Icon,
}) => {
  const { t, i18n } = useTranslation();
  const isPositive = delta !== null && delta >= 0;

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <span className="text-3xl font-semibold tracking-tight tabular-nums">
        {formatEuros(amount, i18n.language)}
      </span>

      <div className="mt-3 flex items-center gap-1.5 min-h-5">
        {delta !== null && (
          <>
            <div
              className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-sm ${
                isPositive ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
              }`}
            >
              {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span className="tabular-nums">{formatPercent(Math.abs(delta), i18n.language)}</span>
            </div>
            <span className="text-xs text-muted-foreground">{t('home.kpi.vsPrevious')}</span>
          </>
        )}
      </div>
    </div>
  );
};
