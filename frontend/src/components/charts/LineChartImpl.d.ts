interface LineChartImplProps {
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
export declare function LineChartImpl({ data, height, lines, tooltipStyle, gridStroke, fontSize, }: LineChartImplProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=LineChartImpl.d.ts.map