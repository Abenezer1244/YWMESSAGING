import { ReactNode } from 'react';
interface SoftCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'gradient' | 'transparent';
    hover?: boolean;
    onClick?: () => void;
    index?: number;
}
export declare function SoftCard({ children, className, variant, hover, onClick, index, }: SoftCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SoftCard.d.ts.map