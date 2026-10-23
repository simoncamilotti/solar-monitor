import { motion } from 'framer-motion';
import { GitCompare } from 'lucide-react';
import { type FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDateLocale } from '../../../i18n/date-locale.js';
import { monthKey } from '../../../i18n/keys.js';

import type { LifetimeDay } from '@repo/contracts';

import type { ComparisonGranularity, ComparisonPeriod } from '../comparison.type.js';
import { getComparisonPresets, MAX_COMPARISON_PERIODS } from '../comparison-presets.js';
import { getPeriodLabel } from '../period-label.js';

type ComparisonEmptyStateProps = {
  data: LifetimeDay[];
  onApplyPreset: (granularity: ComparisonGranularity, periods: ComparisonPeriod[]) => void;
};

/** Shown until a period is chosen: ready-made comparisons, and how to compose one's own. */
export const ComparisonEmptyState: FunctionComponent<ComparisonEmptyStateProps> = ({
  data,
  onApplyPreset,
}) => {
  const { t } = useTranslation();
  const presets = useMemo(() => getComparisonPresets(data), [data]);
  const monthName = (i: number) => t(monthKey(i));
  const locale = useDateLocale();

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated px-6 py-10 flex flex-col items-center gap-8"
      aria-labelledby="compare-empty-title"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <GitCompare className="w-6 h-6 text-primary-text" aria-hidden="true" />
        </div>
        <h2 id="compare-empty-title" className="text-lg font-semibold">
          {t('compare.empty.title')}
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg">{t('compare.empty.description')}</p>
      </div>

      <ul className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {presets.map((preset) => {
          const periods = preset.periods;
          return (
            <li key={preset.id}>
              <button
                type="button"
                disabled={!periods}
                onClick={() => periods && onApplyPreset(preset.granularity, periods)}
                className="w-full h-full text-left rounded-xl border border-border bg-background p-4 flex flex-col gap-1 transition-smooth hover:border-primary hover:bg-muted disabled:opacity-60 disabled:hover:border-border disabled:hover:bg-background disabled:cursor-not-allowed"
              >
                <span className="text-sm font-semibold">{t(`compare.presets.${preset.id}`)}</span>
                <span className="text-xs text-muted-foreground">
                  {periods
                    ? periods.map((p) => getPeriodLabel(p, monthName, locale)).join(' · ')
                    : t('compare.presets.notEnoughHistory')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-muted-foreground text-center">
        {t('compare.empty.custom', { max: MAX_COMPARISON_PERIODS })}
      </p>
    </motion.section>
  );
};
