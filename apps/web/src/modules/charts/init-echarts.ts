import { BarChart, HeatmapChart, LineChart } from 'echarts/charts';
import {
  CalendarComponent,
  DataZoomInsideComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  ToolboxComponent,
  GridComponent,
  MarkLineComponent,
  MarkAreaComponent,
  BarChart,
  LineChart,
  HeatmapChart,
  CalendarComponent,
  SVGRenderer,
  DataZoomInsideComponent,
]);
