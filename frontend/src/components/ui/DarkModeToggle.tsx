import React, { useEffect, useState } from 'react';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Check for system preference and persisted setting on mount
  useEffect(() => {
    setIsMounted(true);

    // Check localStorage first
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode) {
      setIsDarkMode(savedMode === 'dark');
      applyTheme(savedMode === 'dark');
    } else {
      // Check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
      applyTheme(isDark);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme-mode')) {
        setIsDarkMode(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme-mode', 'light');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    applyTheme(newMode);
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-sm hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-normal ${className}`}
      aria-label="Toggle dark mode"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <span className="text-xl">☀️</span>
      ) : (
        <span className="text-xl">🌙</span>
      )}
    </button>
  );
};

DarkModeToggle.displayName = 'DarkModeToggle';

export default DarkModeToggle;
