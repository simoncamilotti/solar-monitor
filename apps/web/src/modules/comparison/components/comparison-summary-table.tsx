import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { type FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDateLocale } from '../../../i18n/date-locale.js';

import type { LifetimeDay } from '@repo/contracts';

import { formatEnergy, formatPercent } from '../../shared/format/index.js';
import { getMetricUnit } from '../../shared/metrics/index.js';
import type { ComparisonFilterState, ComparisonSeries } from '../comparison.type.js';
import { summarizePeriods } from '../comparison-summary.js';

type ComparisonSummaryTableProps = {
  data: LifetimeDay[];
  filters: ComparisonFilterState;
  /** Gives each period its label and color, in the order of `filters.periods`. */
  series: ComparisonSeries[];
};

/** Total, daily average, best day and change from the first period, one row per period. */
export const ComparisonSummaryTable: FunctionComponent<ComparisonSummaryTableProps> = ({
  data,
  filters,
  series,
}) => {
  const { t, i18n } = useTranslation();
  const locale = useDateLocale();
  const summaries = useMemo(
    () => summarizePeriods(data, filters.periods, filters.metric),
    [data, filters.periods, filters.metric],
  );

  const unit = getMetricUnit(filters.metric);
  const language = i18n.language;
  const value = (v: number) =>
    unit === '%' ? formatPercent(v, language) : formatEnergy(v, language);
  const signed = (v: number) =>
    new Intl.NumberFormat(language, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      signDisplay: 'exceptZero',
    }).format(v);
  const changeUnit = unit === '%' ? t('compare.summary.points') : '%';

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-6 flex flex-col gap-4"
      aria-labelledby="compare-summary-title"
    >
      <h2 id="compare-summary-title" className="text-sm font-semibold text-foreground">
        {t('compare.summary.title', { metric: t(`compare.metrics.${filters.metric}`) })}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b border-border">
              <th scope="col" className="text-left font-medium py-2 pr-4">
                {t('compare.summary.period')}
              </th>
              <th scope="col" className="text-right font-medium py-2 px-4">
                {t('compare.summary.total')}
              </th>
              <th scope="col" className="text-right font-medium py-2 px-4">
                {t('compare.summary.dailyAverage')}
              </th>
              <th scope="col" className="text-right font-medium py-2 px-4">
                {t('compare.summary.bestDay')}
              </th>
              <th scope="col" className="text-right font-medium py-2 pl-4">
                {t('compare.summary.change')}
              </th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary, index) => {
              const s = series[index];
              return (
                <tr key={`${index}-${s?.label}`} className="border-b border-border last:border-0">
                  <th scope="row" className="text-left font-medium py-2 pr-4">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: s?.color }}
                        aria-hidden="true"
                      />
                      {s?.label}
                    </span>
                  </th>
                  <td className="text-right tabular-nums py-2 px-4">
                    {value(summary.total)}
                  </td>
                  <td className="text-right tabular-nums py-2 px-4">
                    {summary.dailyAverage === null
                      ? '—'
                      : value(summary.dailyAverage)}
                  </td>
                  <td className="text-right tabular-nums py-2 px-4">
                    {summary.bestDay
                      ? `${value(summary.bestDay.value)} · ${format(parseISO(summary.bestDay.date), 'd MMM yyyy', { locale })}`
                      : '—'}
                  </td>
                  <td className="text-right tabular-nums py-2 pl-4">
                    {summary.change === null
                      ? '—'
                      : `${signed(summary.change)}\u00a0${changeUnit}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
};
