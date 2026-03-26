import { motion } from 'framer-motion';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import type { DashboardFilterState, DashboardViewMode, DateRange } from '../dashboard.type';
import { DateRangePicker } from './DateRangePicker';
import { MonthPicker } from './MonthPicker';
import { YearPicker } from './YearPicker';

type DashboardFiltersProps = {
  filters: DashboardFilterState;
  availableYears: number[];
  availableMonths: number[];
  dateRange: DateRange;
  onViewModeChange: (mode: DashboardViewMode) => void;
  onYearChange: (year: number | null) => void;
  onMonthChange: (month: string | null) => void;
  onCustomRangeChange: (startDate: string | null, endDate: string | null) => void;
};

const VIEW_MODES: DashboardViewMode[] = ['full', 'yearly', 'monthly', 'custom'];

export const DashboardFilters: FunctionComponent<DashboardFiltersProps> = ({
  filters,
  availableYears,
  availableMonths,
  dateRange,
  onViewModeChange,
  onYearChange,
  onMonthChange,
  onCustomRangeChange,
}) => {
  const { t } = useTranslation('web');
  const { viewMode, selectedYear, selectedMonth } = filters;

  const showYear = viewMode === 'yearly';
  const showMonth = viewMode === 'monthly';
  const showCustom = viewMode === 'custom';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-4 flex flex-wrap items-center gap-4"
    >
      {/* View Mode */}
      <div className="flex rounded-lg bg-muted p-1">
        {VIEW_MODES.map(mode => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`text-xs py-1.5 px-3 rounded-md transition-smooth font-medium ${
              viewMode === mode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`home.viewModes.${mode}`)}
          </button>
        ))}
      </div>

      {/* Year */}
      {showYear && <YearPicker inputYear={selectedYear} availableYears={availableYears} onChange={onYearChange} />}

      {/* Month */}
      {showMonth && (
        <MonthPicker
          inputYear={selectedYear}
          inputMonth={selectedMonth}
          availableYears={availableYears}
          availableMonths={availableMonths}
          onChange={onMonthChange}
        />
      )}

      {/* Custom date range */}
      {showCustom && (
        <DateRangePicker
          startDate={filters.customStartDate}
          endDate={filters.customEndDate}
          minDate={dateRange.min}
          maxDate={dateRange.max}
          onChange={onCustomRangeChange}
        />
      )}
    </motion.div>
  );
};
