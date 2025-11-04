import { ReactNode } from 'react';
interface SoftButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}
export declare function SoftButton({ children, variant, size, onClick, disabled, fullWidth, icon, className, type, }: SoftButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SoftButton.d.ts.map