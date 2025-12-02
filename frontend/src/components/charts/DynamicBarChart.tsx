import { Suspense, lazy } from 'react';
import { Skeleton } from '../ui/skeleton';

// Dynamically import the chart component
const BarChartComponent = lazy(() =>
  import('./BarChartImpl').then((module) => ({
    default: module.BarChartImpl,
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

interface BarConfig {
  yAxisId?: string;
  dataKey: string;
  fill: string;
  name: string;
}

interface DynamicBarChartProps {
  data: any[];
  height?: number;
  bars: BarConfig[];
  tooltipStyle?: any;
  gridStroke?: string;
  fontSize?: number;
  hasRightAxis?: boolean;
}

export function DynamicBarChart({
  data,
  height = 300,
  bars,
  tooltipStyle,
  gridStroke,
  fontSize = 12,
  hasRightAxis = false,
}: DynamicBarChartProps) {
  return (
    <Suspense fallback={<ChartLoadingFallback height={height} />}>
      <BarChartComponent
        data={data}
        height={height}
        bars={bars}
        tooltipStyle={tooltipStyle}
        gridStroke={gridStroke}
        fontSize={fontSize}
        hasRightAxis={hasRightAxis}
      />
    </Suspense>
  );
}
