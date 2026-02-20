import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                position: 'fixed', bottom: 170, right: 20,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                color: 'var(--text-main)', cursor: 'pointer',
                zIndex: 1000,
                width: 44, height: 44,
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
            }}
            title="Toggle Theme"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};

export default ThemeToggle;
