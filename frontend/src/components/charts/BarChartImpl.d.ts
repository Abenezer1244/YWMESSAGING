interface BarConfig {
    yAxisId?: string;
    dataKey: string;
    fill: string;
    name: string;
}
interface BarChartImplProps {
    data: any[];
    height?: number;
    bars: BarConfig[];
    tooltipStyle?: any;
    gridStroke?: string;
    fontSize?: number;
    hasRightAxis?: boolean;
}
export declare function BarChartImpl({ data, height, bars, tooltipStyle, gridStroke, fontSize, hasRightAxis, }: BarChartImplProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=BarChartImpl.d.ts.map