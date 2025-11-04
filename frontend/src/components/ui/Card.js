import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
const Card = React.forwardRef(({ variant = 'default', padding = 'md', hoverEffect = false, border = true, className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-md bg-card text-card-foreground transition-all duration-normal';
    const variantStyles = {
        default: 'shadow-subtle border border-border',
        highlight: 'shadow-md border-2 border-primary bg-gradient-to-br from-card to-muted',
        minimal: 'border border-border',
    };
    const paddingStyles = {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };
    const hoverStyles = hoverEffect ? 'hover:shadow-md dark:hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`.trim();
    return (_jsx("div", { ref: ref, className: combinedClassName, ...props, children: children }));
});
Card.displayName = 'Card';
export default Card;
//# sourceMappingURL=Card.js.map