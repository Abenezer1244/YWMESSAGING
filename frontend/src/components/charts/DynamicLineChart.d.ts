interface DynamicLineChartProps {
    data: any[];
    height?: number;
    lines: Array<{
        dataKey: string;
        stroke: string;
        name: string;
    }>;
    tooltipStyle?: any;
    gridStroke?: string;
    fontSize?: number;
}
export declare function DynamicLineChart({ data, height, lines, tooltipStyle, gridStroke, fontSize, }: DynamicLineChartProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DynamicLineChart.d.ts.map