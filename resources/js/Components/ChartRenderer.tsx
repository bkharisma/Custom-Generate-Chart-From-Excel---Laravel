import ReactEChartsCore from 'echarts-for-react/esm/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, ScatterChart, RadarChart } from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { forwardRef } from 'react';

echarts.use([
    BarChart,
    LineChart,
    PieChart,
    ScatterChart,
    RadarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    CanvasRenderer,
]);

interface ChartRendererProps {
    option: Record<string, unknown>;
    style?: React.CSSProperties;
    onChartReady?: (instance: echarts.ECharts) => void;
}

const ChartRenderer = forwardRef<ReactEChartsCore, ChartRendererProps>(
    ({ option, style, onChartReady }, ref) => {
        return (
            <ReactEChartsCore
                ref={ref}
                echarts={echarts}
                option={option}
                style={{ height: 400, width: '100%', ...style }}
                notMerge
                onChartReady={onChartReady}
            />
        );
    },
);

ChartRenderer.displayName = 'ChartRenderer';

export default ChartRenderer;
