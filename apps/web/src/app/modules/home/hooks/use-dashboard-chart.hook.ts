import { format, isAfter, isBefore, isEqual, parse } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { LifetimeDataResponseDto } from '@/shared-models';

import { metricColors } from '../../shared/metrics/metric-colors';
import { METRICS_MAPPING } from '../components/DashboardChart';
import type { DashboardFilterState } from '../dashboard.type';

export const useDashboardChart = (data: LifetimeDataResponseDto, filters: DashboardFilterState) => {
  const { t } = useTranslation('web');

  return useMemo(() => {
    const metricKey = filters.selectedMetric;
    const color = metricColors[metricKey];

    let categories: string[] = [];
    let values: number[] = [];

    switch (filters.viewMode) {
      case 'full': {
        const yearsMap = new Map<number, number>();
        for (const d of data) {
          const y = new Date(d.date).getFullYear();
          yearsMap.set(y, (yearsMap.get(y) ?? 0) + d[metricKey]);
        }
        const sortedYears = [...yearsMap.keys()].sort((a, b) => a - b);
        categories = sortedYears.map(y => `${y}`);
        values = sortedYears.map(y => yearsMap.get(y) ?? 0);
        break;
      }

      case 'yearly': {
        const yearData = data.filter(d => new Date(d.date).getFullYear() === filters.selectedYear);
        const monthMap = new Map<number, number>();
        for (const d of yearData) {
          const m = new Date(d.date).getMonth();
          monthMap.set(m, (monthMap.get(m) ?? 0) + d[metricKey]);
        }
        const sortedMonths = [...monthMap.keys()].sort((a, b) => a - b);
        categories = sortedMonths.map(m => t(`months.${m}`));
        values = sortedMonths.map(m => monthMap.get(m) ?? 0);
        break;
      }

      case 'monthly': {
        const monthData = data.filter(d => {
          const date = new Date(d.date);
          return date.getFullYear() === filters.selectedYear && date.getMonth() === filters.selectedMonth;
        });
        monthData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        categories = monthData.map(d => String(new Date(d.date).getDate()));
        values = monthData.map(d => d[metricKey]);
        break;
      }

      case 'custom': {
        const strStartDate = filters.customStartDate;
        const strEndDate = filters.customEndDate;
        if (strStartDate && strEndDate) {
          const startDate = parse(strStartDate, 'yyyy-MM-dd', new Date());
          const endDate = parse(strEndDate, 'yyyy-MM-dd', new Date());

          const customData = data
            .filter(d => {
              const isoDate = parse(format(d.date, 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date());

              const isAfterOrEqual = isAfter(isoDate, startDate) || isEqual(isoDate, startDate);
              const isBeforeOrEqual = isEqual(isoDate, endDate) || isBefore(isoDate, endDate);

              return isAfterOrEqual && isBeforeOrEqual;
            })
            .sort((a, b) => {
              if (isEqual(b.date, a.date)) {
                return 0;
              }

              if (isAfter(b.date, a.date)) {
                return -1;
              }

              return 1;
            });

          categories = customData.map(d => format(new Date(d.date), 'd MMM', { locale: frLocale }));
          values = customData.map(d => d[metricKey]);
        }
        break;
      }
    }

    const chartOptions: EChartsOption = {
      grid: { top: 10, left: 55, right: 20, bottom: 30, containLabel: false },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.3 } },
        axisLabel: { fontSize: 11 },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const dataParams = params[0] as CallbackDataParams;

          const value = dataParams.value as number;
          const labelKey = METRICS_MAPPING.find(m => m.key === metricKey)?.labelKey;
          const metricName = t(labelKey!);

          const monthLabel = (monthIndex: number) => t(`months.${monthIndex}`);

          let name = '';
          switch (filters.viewMode) {
            case 'yearly':
              name = `${dataParams.name} ${filters.selectedYear}`;
              break;
            case 'monthly':
              name = `${dataParams.name} ${monthLabel(filters.selectedMonth)} ${filters.selectedYear}`;
              break;
            case 'custom':
              name = dataParams.name as string;
              break;
          }

          return `<b>${metricName}</b><br>${dataParams.marker}${name}<span style="float: right; margin-left: 20px"><b>${Number(value).toFixed(1)} kWh</b></span>`;
        },
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            color,
            borderRadius: [5, 5, 0, 0],
          },
        },
      ],
    };

    return chartOptions;
  }, [data, filters, t]);
};
