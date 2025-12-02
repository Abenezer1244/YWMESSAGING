import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

export function LineChartImpl({
  data,
  height = 300,
  lines,
  tooltipStyle,
  gridStroke,
  fontSize = 12,
}: LineChartImplProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis
          dataKey="date"
          tick={{ fontSize }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            name={line.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
