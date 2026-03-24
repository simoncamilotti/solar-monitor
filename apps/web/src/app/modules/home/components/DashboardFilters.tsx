import { format } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import type { DashboardFilterState, DashboardViewMode, WeekRange } from '../dashboard.type';

type DashboardFiltersProps = {
  filters: DashboardFilterState;
  availableYears: number[];
  availableMonths: number[];
  availableWeeks: WeekRange[];
  availableDays: string[];
  onViewModeChange: (mode: DashboardViewMode) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onWeekChange: (weekIndex: number) => void;
  onDayChange: (day: string) => void;
};

const VIEW_MODES: DashboardViewMode[] = ['yearly', 'monthly', 'weekly', 'daily'];

const selectClasses =
  'text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20';

export const DashboardFilters: FunctionComponent<DashboardFiltersProps> = ({
  filters,
  availableYears,
  availableMonths,
  availableWeeks,
  availableDays,
  onViewModeChange,
  onYearChange,
  onMonthChange,
  onWeekChange,
  onDayChange,
}) => {
  const { t } = useTranslation('web');
  const { viewMode, selectedYear, selectedMonth, selectedWeekIndex, selectedDay } = filters;

  const showMonth = viewMode !== 'yearly';
  const showWeek = viewMode === 'weekly';
  const showDay = viewMode === 'daily';

  const canPrevWeek = selectedWeekIndex > 0;
  const canNextWeek = selectedWeekIndex < availableWeeks.length - 1;

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
      <select value={selectedYear} onChange={e => onYearChange(Number(e.target.value))} className={selectClasses}>
        {availableYears.map(y => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* Month */}
      {showMonth && (
        <select value={selectedMonth} onChange={e => onMonthChange(Number(e.target.value))} className={selectClasses}>
          {availableMonths.map(m => (
            <option key={m} value={m}>
              {t(`months.${m}`)}
            </option>
          ))}
        </select>
      )}

      {/* Week */}
      {showWeek && availableWeeks.length > 0 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onWeekChange(selectedWeekIndex - 1)}
            disabled={!canPrevWeek}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-smooth"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium px-2 min-w-[140px] text-center">
            {availableWeeks[selectedWeekIndex]?.label}
          </span>
          <button
            onClick={() => onWeekChange(selectedWeekIndex + 1)}
            disabled={!canNextWeek}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-smooth"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Day */}
      {showDay && (
        <select value={selectedDay ?? ''} onChange={e => onDayChange(e.target.value)} className={selectClasses}>
          {availableDays.map(d => (
            <option key={d} value={d}>
              {format(new Date(d), 'd MMM', { locale: frLocale })}
            </option>
          ))}
        </select>
      )}
    </motion.div>
  );
};
