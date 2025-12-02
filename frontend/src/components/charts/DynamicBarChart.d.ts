interface BarConfig {
    yAxisId?: string;
    dataKey: string;
    fill: string;
    name: string;
}
interface DynamicBarChartProps {
    data: any[];
    height?: number;
    bars: BarConfig[];
    tooltipStyle?: any;
    gridStroke?: string;
    fontSize?: number;
    hasRightAxis?: boolean;
}
export declare function DynamicBarChart({ data, height, bars, tooltipStyle, gridStroke, fontSize, hasRightAxis, }: DynamicBarChartProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DynamicBarChart.d.ts.map