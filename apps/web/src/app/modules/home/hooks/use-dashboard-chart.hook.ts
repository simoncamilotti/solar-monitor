import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { LifetimeDataResponseDto } from '@/shared-models';

import { METRICS_MAPPING } from '../components/DashboardChart';
import { dashboardMetricColors } from '../constants/dashboard-colors';
import type { DashboardFilterState, WeekRange } from '../dashboard.type';

export const useDashboardChart = (
  data: LifetimeDataResponseDto,
  filters: DashboardFilterState,
  availableWeeks: WeekRange[],
) => {
  const { t } = useTranslation('web');

  return useMemo(() => {
    const metricKey = filters.selectedMetric;
    const color = dashboardMetricColors[metricKey];

    let categories: string[] = [];
    let values: number[] = [];

    switch (filters.viewMode) {
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

      case 'weekly': {
        categories = availableWeeks.map(w => w.label);
        values = availableWeeks.map(w => {
          const weekData = data.filter(d => {
            const date = new Date(d.date);
            return date >= w.start && date <= w.end;
          });
          return weekData.reduce((sum, d) => sum + d[metricKey], 0);
        });
        break;
      }

      case 'daily': {
        const monthData = data.filter(d => {
          const date = new Date(d.date);
          return date.getFullYear() === filters.selectedYear && date.getMonth() === filters.selectedMonth;
        });
        monthData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        categories = monthData.map(d => String(new Date(d.date).getDate()));
        values = monthData.map(d => d[metricKey]);
        break;
      }
    }

    const isDaily = filters.viewMode === 'daily';
    const selectedDayNum = filters.selectedDay ? new Date(filters.selectedDay).getDate() : null;

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
            case 'weekly':
            case 'daily':
              name = `${dataParams.name} ${monthLabel(filters.selectedMonth)} ${filters.selectedYear}`;
          }

          return `<b>${metricName}</b><br>${dataParams.marker}${name}<span style="float: right; margin-left: 20px"><b>${Number(value).toFixed(1)} kWh</b></span>`;
        },
      },
      series: [
        {
          type: 'bar',
          data: isDaily
            ? values.map((v, i) => ({
                value: v,
                itemStyle: {
                  opacity: categories[i] === String(selectedDayNum) ? 1 : 0.35,
                },
              }))
            : values,
          itemStyle: {
            color,
            borderRadius: [5, 5, 0, 0],
          },
        },
      ],
    };

    return chartOptions;
  }, [data, filters, availableWeeks, t]);
};
