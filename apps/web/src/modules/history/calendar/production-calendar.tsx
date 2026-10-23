import { useNavigate } from '@tanstack/react-router';
import { type FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LifetimeDay } from '@repo/contracts';

import { Chart } from '../../charts/components/chart.js';
import { YearPicker } from '../../home/components/year-picker.js';
import { presetDashboardDay } from '../../home/hooks/use-dashboard-filters.hook.js';
import { useDisplayedTheme } from '../../shared/metrics/energy-colors.js';
import { CALENDAR_LEVELS, levelColor } from './calendar-colors.js';
import {
  buildCalendarYear,
  CALENDAR_METRICS,
  type CalendarMetric,
  calendarYears,
} from './calendar-data.js';
import {
  CALENDAR_CELL_SIZE,
  type CalendarItem,
  useCalendarChart,
} from './use-calendar-chart.hook.js';

const METRIC_LABEL_KEYS = {
  kwhProduced: 'home.kpi.production',
  kwhConsumed: 'home.kpi.consumption',
  autonomy: 'home.kpi.autonomy',
} as const satisfies Record<CalendarMetric, string>;

// 53 weeks of cells plus the day labels: below this width, the calendar scrolls horizontally.
const CALENDAR_MIN_WIDTH = 53 * CALENDAR_CELL_SIZE + 48;
const CALENDAR_HEIGHT = `${7 * CALENDAR_CELL_SIZE + 32}px`;

type ProductionCalendarProps = {
  data: LifetimeDay[];
};

export const ProductionCalendar: FunctionComponent<ProductionCalendarProps> = ({ data }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const years = useMemo(() => calendarYears(data), [data]);
  const [year, setYear] = useState<number>(() => years.at(-1) ?? new Date().getFullYear());
  const [metric, setMetric] = useState<CalendarMetric>('kwhProduced');
  const theme = useDisplayedTheme();

  const calendar = useMemo(() => buildCalendarYear(data, year, metric), [data, year, metric]);
  const option = useCalendarChart(calendar, year, metric);

  const onEvents = useMemo(
    () => ({
      click: (params: unknown) => {
        const item = (params as { data?: CalendarItem }).data;
        if (item?.kind === 'value') {
          presetDashboardDay(item.value[0]);
          void navigate({ to: '/' });
        }
      },
    }),
    [navigate],
  );

  return (
    <section className="card-elevated p-6 flex flex-col gap-4" aria-labelledby="calendar-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="calendar-title" className="text-sm font-semibold text-foreground">
            {t('history.calendar.title')}
          </h2>
          <p className="text-xs text-muted-foreground">{t('history.calendar.hint')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label={t('history.calendar.metric')}
            className="flex flex-wrap gap-1.5"
          >
            {CALENDAR_METRICS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={metric === m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth ${
                  metric === m
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(METRIC_LABEL_KEYS[m])}
              </button>
            ))}
          </div>
          <YearPicker
            inputYear={year}
            availableYears={years}
            onChange={(y) => y !== null && setYear(y)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: CALENDAR_MIN_WIDTH }}>
          <Chart option={option} height={CALENDAR_HEIGHT} onEvents={onEvents} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>{t('history.calendar.less')}</span>
          {CALENDAR_LEVELS.map((level) => (
            <span
              key={level}
              aria-hidden="true"
              className="inline-block size-3 rounded-sm"
              style={{ backgroundColor: levelColor(metric, level, theme) }}
            />
          ))}
          <span>{t('history.calendar.more')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block size-3 rounded-sm border border-dashed border-muted-foreground"
          />
          <span>{t('history.calendar.missing')}</span>
        </div>
      </div>
    </section>
  );
};
