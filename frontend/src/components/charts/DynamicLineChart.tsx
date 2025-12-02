import { Suspense, lazy } from 'react';
import { Skeleton } from '../ui/skeleton';

// Dynamically import the chart component
const LineChartComponent = lazy(() =>
  import('./LineChartImpl').then((module) => ({
    default: module.LineChartImpl,
  }))
);

interface ChartLoadingProps {
  height?: number;
}

function ChartLoadingFallback({ height = 300 }: ChartLoadingProps) {
  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Skeleton className="w-full h-full rounded-lg" />
    </div>
  );
}

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

export function DynamicLineChart({
  data,
  height = 300,
  lines,
  tooltipStyle,
  gridStroke,
  fontSize = 12,
}: DynamicLineChartProps) {
  return (
    <Suspense fallback={<ChartLoadingFallback height={height} />}>
      <LineChartComponent
        data={data}
        height={height}
        lines={lines}
        tooltipStyle={tooltipStyle}
        gridStroke={gridStroke}
        fontSize={fontSize}
      />
    </Suspense>
  );
}
