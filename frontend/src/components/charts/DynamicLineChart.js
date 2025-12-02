import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense, lazy } from 'react';
import { Skeleton } from '../ui/skeleton';
// Dynamically import the chart component
const LineChartComponent = lazy(() => import('./LineChartImpl').then((module) => ({
    default: module.LineChartImpl,
})));
function ChartLoadingFallback({ height = 300 }) {
    return (_jsx("div", { style: { height: `${height}px`, width: '100%' }, children: _jsx(Skeleton, { className: "w-full h-full rounded-lg" }) }));
}
export function DynamicLineChart({ data, height = 300, lines, tooltipStyle, gridStroke, fontSize = 12, }) {
    return (_jsx(Suspense, { fallback: _jsx(ChartLoadingFallback, { height: height }), children: _jsx(LineChartComponent, { data: data, height: height, lines: lines, tooltipStyle: tooltipStyle, gridStroke: gridStroke, fontSize: fontSize }) }));
}
//# sourceMappingURL=DynamicLineChart.js.map