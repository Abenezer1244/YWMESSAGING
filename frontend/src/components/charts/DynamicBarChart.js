import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense, lazy } from 'react';
import { Skeleton } from '../ui/skeleton';
// Dynamically import the chart component
const BarChartComponent = lazy(() => import('./BarChartImpl').then((module) => ({
    default: module.BarChartImpl,
})));
function ChartLoadingFallback({ height = 300 }) {
    return (_jsx("div", { style: { height: `${height}px`, width: '100%' }, children: _jsx(Skeleton, { className: "w-full h-full rounded-lg" }) }));
}
export function DynamicBarChart({ data, height = 300, bars, tooltipStyle, gridStroke, fontSize = 12, hasRightAxis = false, }) {
    return (_jsx(Suspense, { fallback: _jsx(ChartLoadingFallback, { height: height }), children: _jsx(BarChartComponent, { data: data, height: height, bars: bars, tooltipStyle: tooltipStyle, gridStroke: gridStroke, fontSize: fontSize, hasRightAxis: hasRightAxis }) }));
}
//# sourceMappingURL=DynamicBarChart.js.map