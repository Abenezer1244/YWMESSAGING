import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const Spinner = ({ size = 'md', color = 'primary', text, }) => {
    const sizeStyles = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };
    const colorStyles = {
        primary: 'border-accent-200 border-t-accent-600 dark:border-accent-700 dark:border-t-accent-400',
        white: 'border-white/30 border-t-white',
        secondary: 'border-primary-300 border-t-primary-600 dark:border-primary-600 dark:border-t-primary-400',
    };
    return (_jsxs("div", { className: "flex flex-col items-center justify-center gap-3", children: [_jsx("div", { className: `${sizeStyles[size]} ${colorStyles[color]} rounded-full border-2 animate-spin` }), text && (_jsx("p", { className: "text-sm text-primary-600 dark:text-primary-400", children: text }))] }));
};
Spinner.displayName = 'Spinner';
export default Spinner;
//# sourceMappingURL=Spinner.js.map