import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const Button = React.forwardRef(({ variant = 'primary', size = 'md', isLoading = false, icon, iconPosition = 'left', fullWidth = false, disabled, className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-sm transition-all duration-normal focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    const variantStyles = {
        primary: 'bg-accent-600 dark:bg-accent-500 text-primary-900 dark:text-primary-900 hover:bg-accent-700 dark:hover:bg-accent-600 focus-visible:ring-accent-500 active:bg-accent-800',
        secondary: 'bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-primary-50 hover:bg-primary-200 dark:hover:bg-primary-700 focus-visible:ring-accent-500 active:bg-primary-300',
        outline: 'border-2 border-accent-500 dark:border-accent-400 text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-primary-900 focus-visible:ring-accent-500 active:bg-accent-100',
        ghost: 'text-accent-600 dark:text-accent-400 hover:bg-primary-100 dark:hover:bg-primary-800 focus-visible:ring-accent-500 active:bg-primary-200',
        danger: 'bg-danger-600 dark:bg-danger-500 text-white hover:bg-danger-700 dark:hover:bg-danger-600 focus-visible:ring-danger-500 active:bg-danger-800',
    };
    const sizeStyles = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-lg',
    };
    const widthStyle = fullWidth ? 'w-full' : '';
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim();
    return (_jsx("button", { ref: ref, disabled: disabled || isLoading, className: combinedClassName, ...props, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "spinner-sm" }), children && _jsx("span", { children: children })] })) : (_jsxs(_Fragment, { children: [icon && iconPosition === 'left' && _jsx("span", { className: "flex items-center", children: icon }), children && _jsx("span", { children: children }), icon && iconPosition === 'right' && _jsx("span", { className: "flex items-center", children: icon })] })) }));
});
Button.displayName = 'Button';
export default Button;
//# sourceMappingURL=Button.js.map