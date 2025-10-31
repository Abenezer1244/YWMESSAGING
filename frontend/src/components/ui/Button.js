import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const Button = React.forwardRef(({ variant = 'primary', size = 'md', isLoading = false, icon, iconPosition = 'left', fullWidth = false, disabled, className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-sm transition-all duration-normal focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    const variantStyles = {
        primary: 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus-visible:ring-primary-500 active:bg-primary-800',
        secondary: 'bg-secondary-200 dark:bg-secondary-700 text-secondary-900 dark:text-secondary-50 hover:bg-secondary-300 dark:hover:bg-secondary-600 focus-visible:ring-secondary-500 active:bg-secondary-400',
        outline: 'border-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-900 focus-visible:ring-primary-500 active:bg-primary-100',
        ghost: 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-800 focus-visible:ring-primary-500 active:bg-primary-100',
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