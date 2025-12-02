import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
export function LineChartImpl({ data, height = 300, lines, tooltipStyle, gridStroke, fontSize = 12, }) {
    return (_jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(LineChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: gridStroke }), _jsx(XAxis, { dataKey: "date", tick: { fontSize }, angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, {}), _jsx(Tooltip, { contentStyle: tooltipStyle }), _jsx(Legend, {}), lines.map((line) => (_jsx(Line, { type: "monotone", dataKey: line.dataKey, stroke: line.stroke, name: line.name }, line.dataKey)))] }) }));
}
//# sourceMappingURL=LineChartImpl.js.map