import { LucideIcon } from 'lucide-react';
interface SoftStatProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    change?: number;
    changeType?: 'positive' | 'negative' | 'neutral';
    gradient?: string;
    index?: number;
}
export declare function SoftStat({ icon: Icon, label, value, change, changeType, gradient, index, }: SoftStatProps): any;
export {};
//# sourceMappingURL=SoftStat.d.ts.map