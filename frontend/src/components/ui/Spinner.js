import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Spinner = ({ size = 'md', color = 'primary', text, }) => {
    const sizeStyles = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };
    const colorStyles = {
        primary: 'border-primary-200 border-t-primary-600 dark:border-primary-700 dark:border-t-primary-400',
        white: 'border-white/30 border-t-white',
        secondary: 'border-secondary-300 border-t-secondary-600 dark:border-secondary-600 dark:border-t-secondary-400',
    };
    return (_jsxs("div", { className: "flex flex-col items-center justify-center gap-3", children: [_jsx("div", { className: `${sizeStyles[size]} ${colorStyles[color]} rounded-full border-2 animate-spin` }), text && (_jsx("p", { className: "text-sm text-secondary-600 dark:text-secondary-400", children: text }))] }));
};
Spinner.displayName = 'Spinner';
export default Spinner;
//# sourceMappingURL=Spinner.js.map