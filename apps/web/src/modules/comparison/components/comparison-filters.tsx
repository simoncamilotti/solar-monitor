import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { motion } from 'framer-motion';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  ComparisonGranularity,
  ComparisonPeriod,
  ComparisonResolution,
} from '../comparison.type.js';
import { ComparisonPeriodList } from './comparison-period-list.js';

type ComparisonFiltersProps = {
  granularity: ComparisonGranularity;
  resolution: ComparisonResolution;
  periods: ComparisonPeriod[];
  availableYears: number[];
  availableDays: string[];
  availableResolutions: ComparisonResolution[];
  onGranularityChange: (g: ComparisonGranularity) => void;
  onResolutionChange: (r: ComparisonResolution) => void;
  onAddPeriod: (p: ComparisonPeriod) => void;
  onRemovePeriod: (p: ComparisonPeriod) => void;
};

const GRANULARITIES: ComparisonGranularity[] = ['years', 'months', 'days', 'ranges'];

export const ComparisonFilters: FunctionComponent<ComparisonFiltersProps> = ({
  granularity,
  resolution,
  periods,
  availableYears,
  availableDays,
  availableResolutions,
  onGranularityChange,
  onResolutionChange,
  onAddPeriod,
  onRemovePeriod,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-4 flex flex-wrap items-center gap-4"
    >
      <div className="flex rounded-lg bg-muted p-1">
        {GRANULARITIES.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={granularity === g}
            onClick={() => onGranularityChange(g)}
            className={`text-xs py-1.5 px-3 rounded-md transition-smooth font-medium ${
              granularity === g
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`compare.granularity.${g}`)}
          </button>
        ))}
      </div>

      {availableResolutions.length > 0 && (
        <Select
          items={availableResolutions.map((r) => ({
            value: r,
            label: t(`compare.resolution.${r}`),
          }))}
          value={resolution}
          onValueChange={(value) => value && onResolutionChange(value)}
        >
          <SelectTrigger aria-label={t('compare.resolutionLabel')} className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableResolutions.map((r) => (
              <SelectItem key={r} value={r} className="text-xs">
                {t(`compare.resolution.${r}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="h-6 w-px bg-border hidden sm:block" />

      <ComparisonPeriodList
        periods={periods}
        granularity={granularity}
        availableYears={availableYears}
        availableDays={availableDays}
        onAdd={onAddPeriod}
        onRemove={onRemovePeriod}
      />
    </motion.div>
  );
};
