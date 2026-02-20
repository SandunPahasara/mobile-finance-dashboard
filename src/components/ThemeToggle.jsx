import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                position: 'fixed', top: 20, right: 20,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                color: 'var(--text-main)', cursor: 'pointer',
                zIndex: 1000,
                width: 40, height: 40,
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            title="Toggle Theme"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};

export default ThemeToggle;
