import { ReactNode } from 'react';
interface SoftCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'gradient' | 'transparent';
    hover?: boolean;
    onClick?: () => void;
    index?: number;
}
declare function SoftCardComponent({ children, className, variant, hover, onClick, index, }: SoftCardProps): import("react/jsx-runtime").JSX.Element;
/**
 * Memoized SoftCard component
 * Prevents re-renders when parent component updates but props remain the same
 * Shallow comparison of children, className, variant, hover, onClick, and index
 */
export declare const SoftCard: import("react").MemoExoticComponent<typeof SoftCardComponent>;
export {};
//# sourceMappingURL=SoftCard.d.ts.map