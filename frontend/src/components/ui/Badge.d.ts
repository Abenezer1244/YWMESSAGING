import React from 'react';
type BadgeVariant = 'solid' | 'outline' | 'soft';
type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
    color?: BadgeColor;
    size?: BadgeSize;
    icon?: React.ReactNode;
}
declare const Badge: React.FC<BadgeProps>;
export default Badge;
//# sourceMappingURL=Badge.d.ts.map