import { addDays, format, parseISO } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatEnergy, formatPercent } from '../../shared/format/index.js';
import { getChartColors, useDisplayedTheme } from '../../shared/metrics/energy-colors.js';
import { levelColor } from './calendar-colors.js';
import type { CalendarMetric, CalendarYear } from './calendar-data.js';

export const CALENDAR_CELL_SIZE = 16;

/** Data item of the heatmap. A missing day keeps a numeric value: the heatmap skips `null`. */
export type CalendarItem = { value: [string, number]; kind: 'value' | 'missing' };

export const useCalendarChart = (
  calendar: CalendarYear,
  year: number,
  metric: CalendarMetric,
): EChartsOption => {
  const { t, i18n } = useTranslation();
  const theme = useDisplayedTheme();
  const { text: muted, grid: border } = getChartColors(theme);
  const locale = i18n.language === 'en' ? enUS : fr;

  return useMemo(() => {
    // 2023-01-01 is a Sunday: ECharts lists the day names from Sunday.
    const dayNames = Array.from({ length: 7 }, (_, i) =>
      format(addDays(parseISO('2023-01-01'), i), 'EEEEE', { locale }),
    );
    const monthNames = Array.from({ length: 12 }, (_, i) =>
      format(parseISO(`2023-${String(i + 1).padStart(2, '0')}-01`), 'MMM', { locale }),
    );

    const items = calendar.cells.map((cell) =>
      cell.kind === 'value'
        ? {
            value: [cell.date, cell.value] as [string, number],
            kind: 'value' as const,
            itemStyle: { color: levelColor(metric, cell.level, theme) },
          }
        : {
            value: [cell.date, 0] as [string, number],
            kind: 'missing' as const,
            itemStyle: {
              color: 'transparent',
              borderColor: muted,
              borderType: 'dashed' as const,
              borderWidth: 1,
            },
          },
    );

    return {
      tooltip: {
        formatter: (params) => {
          const item = (Array.isArray(params) ? params[0] : params)?.data as CalendarItem;
          const [date, value] = item.value;
          const day = format(parseISO(date), 'EEEE d MMMM yyyy', { locale });
          return item.kind === 'missing'
            ? `${day}<br/>${t('history.calendar.missing')}`
            : `${day}<br/><b>${metric === 'autonomy' ? formatPercent(value, i18n.language) : formatEnergy(value, i18n.language)}</b>`;
        },
      },
      calendar: {
        range: String(year),
        orient: 'horizontal',
        cellSize: CALENDAR_CELL_SIZE,
        left: 32,
        right: 8,
        top: 24,
        bottom: 4,
        dayLabel: { firstDay: 1, nameMap: dayNames, color: muted, fontSize: 10 },
        monthLabel: { nameMap: monthNames, color: muted, fontSize: 11 },
        yearLabel: { show: false },
        splitLine: { show: false },
        itemStyle: { color: 'transparent', borderColor: border, borderWidth: 1 },
      },
      series: [{ type: 'heatmap', coordinateSystem: 'calendar', data: items }],
    };
  }, [calendar, year, metric, locale, t, i18n.language, theme, muted, border]);
};
