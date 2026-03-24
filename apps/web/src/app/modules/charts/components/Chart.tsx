import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import type { FunctionComponent } from 'react';
import { useRef, useState } from 'react';

export type ChartProps = {
  option: EChartsOption | undefined;
  height?: string;
};

export const Chart: FunctionComponent<ChartProps> = ({ option, height }) => {
  const eChartsRef = useRef(null as any);

  const [optionCurrent, setOptionCurrent] = useState(option);
  if (JSON.stringify(optionCurrent) !== JSON.stringify(option)) {
    const instance = eChartsRef.current.getEchartsInstance();
    instance.setOption(option, true);
    setOptionCurrent(option);
  }

  return (
    <div className="flex w-full">
      <ReactEChartsCore
        echarts={echarts}
        style={{
          width: '100%',
          height: height,
        }}
        ref={eChartsRef}
        option={option}
      />
    </div>
  );
};
