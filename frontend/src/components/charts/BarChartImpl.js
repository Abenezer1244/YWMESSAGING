import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
export function BarChartImpl({ data, height = 300, bars, tooltipStyle, gridStroke, fontSize = 12, hasRightAxis = false, }) {
    return (_jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(BarChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: gridStroke }), _jsx(XAxis, { dataKey: "name", tick: { fontSize }, angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, { yAxisId: "left" }), hasRightAxis && _jsx(YAxis, { yAxisId: "right", orientation: "right" }), _jsx(Tooltip, { contentStyle: tooltipStyle }), _jsx(Legend, {}), bars.map((bar) => (_jsx(Bar, { yAxisId: bar.yAxisId || 'left', dataKey: bar.dataKey, fill: bar.fill, name: bar.name }, bar.dataKey)))] }) }));
}
//# sourceMappingURL=BarChartImpl.js.map