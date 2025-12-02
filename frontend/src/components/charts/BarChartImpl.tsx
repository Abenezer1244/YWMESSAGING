import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

export function BarChartImpl({
  data,
  height = 300,
  bars,
  tooltipStyle,
  gridStroke,
  fontSize = 12,
  hasRightAxis = false,
}: BarChartImplProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis
          dataKey="name"
          tick={{ fontSize }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis yAxisId="left" />
        {hasRightAxis && <YAxis yAxisId="right" orientation="right" />}
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            yAxisId={bar.yAxisId || 'left'}
            dataKey={bar.dataKey}
            fill={bar.fill}
            name={bar.name}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
