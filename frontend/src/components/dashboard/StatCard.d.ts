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
export declare function StatCard({ icon: Icon, label, value, change, changeType, bgColor, iconColor, index, }: StatCardProps): any;
export {};
//# sourceMappingURL=StatCard.d.ts.map