import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
const DarkModeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    return (_jsx("button", { onClick: toggleTheme, className: `p-2 rounded-sm hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-normal ${className}`, "aria-label": "Toggle dark mode", title: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode', children: theme === 'dark' ? (_jsx("span", { className: "text-xl", children: "\u2600\uFE0F" })) : (_jsx("span", { className: "text-xl", children: "\uD83C\uDF19" })) }));
};
DarkModeToggle.displayName = 'DarkModeToggle';
export default DarkModeToggle;
//# sourceMappingURL=DarkModeToggle.js.map