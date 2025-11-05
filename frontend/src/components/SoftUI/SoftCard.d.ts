import { ReactNode } from 'react';
interface SoftCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'gradient' | 'transparent';
    hover?: boolean;
    onClick?: () => void;
    index?: number;
}
export declare function SoftCard({ children, className, variant, hover, onClick, index, }: SoftCardProps): any;
export {};
//# sourceMappingURL=SoftCard.d.ts.map