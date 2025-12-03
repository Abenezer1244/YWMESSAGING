import { ReactNode } from 'react';
interface ChartCardProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    index?: number;
}
declare function ChartCardComponent({ title, subtitle, children, index }: ChartCardProps): import("react/jsx-runtime").JSX.Element;
/**
 * Memoized ChartCard component
 * Prevents re-renders when parent component updates but props remain the same
 * Useful for charts that render multiple times in dashboard
 */
export declare const ChartCard: import("react").MemoExoticComponent<typeof ChartCardComponent>;
export {};
//# sourceMappingURL=ChartCard.d.ts.map