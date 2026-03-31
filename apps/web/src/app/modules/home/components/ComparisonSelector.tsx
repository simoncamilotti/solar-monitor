import { motion } from 'framer-motion';
import type { FunctionComponent } from 'react';
import { useCallback } from 'react';

import type { LifetimeDataResponseDto } from '@/shared-models';

import type { CompareRange, ComparisonParams, ViewMode } from '../home.type';
import { getMonthsForYear } from '../hooks/get-months-for-year';
import { CompareRangeSelector } from './CompareRangeSelector';
import { MonthSelector } from './MonthSelector';
import { ViewModeToggle } from './ViewModeToggle';
import { YearSelector } from './YearSelector';

type ComparisonSelectorProps = {
  data: LifetimeDataResponseDto;
  comparisonParams: ComparisonParams;
  setComparisonParams: React.Dispatch<React.SetStateAction<ComparisonParams>>;
};

export const ComparisonSelector: FunctionComponent<ComparisonSelectorProps> = ({
  data,
  comparisonParams,
  setComparisonParams,
}) => {
  const { viewMode, selectedYear, selectedMonth, compareRange } = comparisonParams;

  const updateParam = useCallback(
    <K extends keyof ComparisonParams>(key: K, value: ComparisonParams[K]) => {
      setComparisonParams(prev => ({ ...prev, [key]: value }));
    },
    [setComparisonParams],
  );

  const handleViewModeChange = useCallback((mode: ViewMode) => updateParam('viewMode', mode), [updateParam]);

  const handleYearChange = useCallback(
    (year: number) => {
      const months = getMonthsForYear(data, year);
      setComparisonParams(prev => {
        const monthStillValid = months.includes(prev.selectedMonth);
        return {
          ...prev,
          selectedYear: year,
          selectedMonth: monthStillValid ? prev.selectedMonth : (months[0] ?? 0),
        };
      });
    },
    [data, setComparisonParams],
  );

  const handleMonthChange = useCallback((month: number) => updateParam('selectedMonth', month), [updateParam]);

  const handleCompareRangeChange = useCallback(
    (range: CompareRange) => updateParam('compareRange', range),
    [updateParam],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Filtres de comparaison</h3>
      <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
      <YearSelector data={data} selectedYear={selectedYear} onYearChange={handleYearChange} />
      {viewMode === 'monthly' && (
        <MonthSelector
          data={data}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />
      )}
      <CompareRangeSelector
        viewMode={viewMode}
        compareRange={compareRange}
        onCompareRangeChange={handleCompareRangeChange}
      />
    </motion.div>
  );
};
