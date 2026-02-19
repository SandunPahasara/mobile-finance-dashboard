import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                position: 'absolute', top: 20, right: 20,
                background: 'none', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                zIndex: 50
            }}
            title="Toggle Theme"
        >
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
    );
};

export default ThemeToggle;
