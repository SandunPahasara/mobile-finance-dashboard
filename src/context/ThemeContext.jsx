import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('finance_theme') || 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        // Set date-theme attribute for CSS variables
        root.setAttribute('data-theme', theme);
        // Also keep class for potential Tailwind dark mode support
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('finance_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
