import { LucideIcon } from 'lucide-react';
interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    change?: number;
    changeType?: 'positive' | 'negative' | 'neutral';
    bgColor?: string;
    iconColor?: string;
    index?: number;
}
declare function StatCardComponent({ icon: Icon, label, value, change, changeType, bgColor, iconColor, index, }: StatCardProps): import("react/jsx-runtime").JSX.Element;
/**
 * Memoized StatCard component
 * Prevents re-renders when parent component updates but props remain the same
 * Shallow comparison of all props (icon, label, value, change, etc.)
 */
export declare const StatCard: import("react").MemoExoticComponent<typeof StatCardComponent>;
export {};
//# sourceMappingURL=StatCard.d.ts.map