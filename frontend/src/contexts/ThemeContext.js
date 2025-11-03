import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState('light');
    const [mounted, setMounted] = useState(false);
    // Initialize theme from localStorage and system preference
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = stored || (prefersDark ? 'dark' : 'light');
        setThemeState(initialTheme);
        applyTheme(initialTheme);
        setMounted(true);
    }, []);
    const applyTheme = (newTheme) => {
        const root = document.documentElement;
        if (newTheme === 'dark') {
            root.classList.add('dark');
        }
        else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', newTheme);
    };
    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
    };
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };
    // Prevent hydration mismatch
    if (!mounted) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsx(ThemeContext.Provider, { value: { theme, toggleTheme, setTheme }, children: children }));
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
//# sourceMappingURL=ThemeContext.js.map