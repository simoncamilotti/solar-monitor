import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import ReactEChartsCore from 'echarts-for-react/esm/core.js';
import type { FunctionComponent } from 'react';

export type ChartProps = {
  option: EChartsOption | undefined;
  height?: string;
  /** ECharts event handlers, by event name: `{ click: (params) => … }`. */
  onEvents?: Record<string, (params: unknown) => void>;
};

const prefersReducedMotion = (): boolean =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// `notMerge`: a new option replaces the previous one instead of being merged into it.
export const Chart: FunctionComponent<ChartProps> = ({ option, height, onEvents }) => (
  <div className="flex w-full">
    <ReactEChartsCore
      echarts={echarts}
      style={{
        width: '100%',
        height: height,
      }}
      option={option ? { animation: !prefersReducedMotion(), ...option } : {}}
      notMerge
      onEvents={onEvents}
    />
  </div>
);
