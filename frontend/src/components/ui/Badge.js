import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Badge = ({ variant = 'solid', color = 'primary', size = 'md', icon, className = '', children, ...props }) => {
    const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap';
    const sizeStyles = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };
    const colorConfig = {
        primary: {
            solid: 'bg-accent-600 dark:bg-accent-500 text-primary-900 dark:text-primary-900',
            outline: 'border-2 border-accent-600 dark:border-accent-400 text-accent-600 dark:text-accent-400 bg-transparent',
            soft: 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-200',
        },
        secondary: {
            solid: 'bg-primary-600 dark:bg-primary-500 text-white',
            outline: 'border-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 bg-transparent',
            soft: 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200',
        },
        success: {
            solid: 'bg-success-600 dark:bg-success-500 text-white',
            outline: 'border-2 border-success-600 dark:border-success-400 text-success-600 dark:text-success-400 bg-transparent',
            soft: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-200',
        },
        warning: {
            solid: 'bg-warning-600 dark:bg-warning-500 text-white',
            outline: 'border-2 border-warning-600 dark:border-warning-400 text-warning-600 dark:text-warning-400 bg-transparent',
            soft: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-200',
        },
        danger: {
            solid: 'bg-danger-600 dark:bg-danger-500 text-white',
            outline: 'border-2 border-danger-600 dark:border-danger-400 text-danger-600 dark:text-danger-400 bg-transparent',
            soft: 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-200',
        },
        info: {
            solid: 'bg-info-600 dark:bg-info-500 text-white',
            outline: 'border-2 border-info-600 dark:border-info-400 text-info-600 dark:text-info-400 bg-transparent',
            soft: 'bg-info-100 dark:bg-info-900 text-info-700 dark:text-info-200',
        },
    };
    const colorStyles = colorConfig[color][variant];
    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${colorStyles} ${className}`.trim();
    return (_jsxs("div", { className: combinedClassName, ...props, children: [icon && _jsx("span", { className: "flex items-center", children: icon }), _jsx("span", { children: children })] }));
};
Badge.displayName = 'Badge';
export default Badge;
//# sourceMappingURL=Badge.js.map