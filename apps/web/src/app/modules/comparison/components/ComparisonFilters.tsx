import { motion } from 'framer-motion';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import type { ComparisonGranularity, ComparisonPeriod, ComparisonResolution } from '../comparison.type';
import { ComparisonPeriodList } from './ComparisonPeriodList';

type ComparisonFiltersProps = {
  granularity: ComparisonGranularity;
  resolution: ComparisonResolution;
  periods: ComparisonPeriod[];
  availableYears: number[];
  availableResolutions: ComparisonResolution[];
  onGranularityChange: (g: ComparisonGranularity) => void;
  onResolutionChange: (r: ComparisonResolution) => void;
  onAddPeriod: (p: ComparisonPeriod) => void;
  onRemovePeriod: (p: ComparisonPeriod) => void;
};

const GRANULARITIES: ComparisonGranularity[] = ['years', 'months', 'days'];

export const ComparisonFilters: FunctionComponent<ComparisonFiltersProps> = ({
  granularity,
  resolution,
  periods,
  availableYears,
  availableResolutions,
  onGranularityChange,
  onResolutionChange,
  onAddPeriod,
  onRemovePeriod,
}) => {
  const { t } = useTranslation('web');

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-4 flex flex-wrap items-center gap-4"
    >
      <div className="flex rounded-lg bg-muted p-1">
        {GRANULARITIES.map(g => (
          <button
            key={g}
            onClick={() => onGranularityChange(g)}
            className={`text-xs py-1.5 px-3 rounded-md transition-smooth font-medium ${
              granularity === g ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`compare.granularity.${g}`)}
          </button>
        ))}
      </div>

      {availableResolutions.length > 0 && (
        <select
          value={resolution}
          onChange={e => onResolutionChange(e.target.value as ComparisonResolution)}
          className="text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {availableResolutions.map(r => (
            <option key={r} value={r}>
              {t(`compare.resolution.${r}`)}
            </option>
          ))}
        </select>
      )}

      <div className="h-6 w-px bg-border hidden sm:block" />

      <ComparisonPeriodList
        periods={periods}
        granularity={granularity}
        availableYears={availableYears}
        onAdd={onAddPeriod}
        onRemove={onRemovePeriod}
      />
    </motion.div>
  );
};
