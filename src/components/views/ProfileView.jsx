import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { User, LogOut, Check } from 'lucide-react';

const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

const ProfileView = () => {
    const { user, currency, login, logout, updateCurrency } = useFinance();
    const [name, setName] = useState(user?.name || '');
    const [selectedCurrency, setSelectedCurrency] = useState(currency.code);
    const [message, setMessage] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        const currencyObj = CURRENCIES.find(c => c.code === selectedCurrency);
        updateCurrency(currencyObj);
        login({ ...user, name });
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="container" style={{ paddingBottom: 80 }}>
            <h1 className="mb-4">Profile & Settings</h1>

            <div className="card animate-enter">
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)'
                    }}>
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 5 }}>{name}</h2>
                        <p className="text-muted">Member since {new Date(user?.joined || Date.now()).getFullYear()}</p>
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label className="form-label">Display Name</label>
                        <input
                            className="form-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Currency</label>
                        <select
                            className="form-select"
                            value={selectedCurrency}
                            onChange={e => setSelectedCurrency(e.target.value)}
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.symbol} - {c.code} ({c.name})</option>
                            ))}
                        </select>
                    </div>

                    {message && <div className="badge-success mb-4" style={{ display: 'block', textAlign: 'center' }}>{message}</div>}

                    <div className="flex gap-4">
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            Save Changes
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            style={{ flex: 1, borderColor: 'var(--error)', color: 'var(--error)' }}
                            onClick={() => {
                                if (confirm('Are you sure you want to log out? This will clear your session.')) {
                                    logout();
                                }
                            }}
                        >
                            <LogOut size={18} style={{ marginRight: 8 }} />
                            Log Out
                        </button>
                    </div>
                </form>
            </div>

            <div className="card mt-4 animate-enter delay-100">
                <h3>Data Management</h3>
                <p className="text-muted text-sm mb-4">You can clear all local data if you need a fresh start.</p>
                <button
                    className="btn btn-outline w-full"
                    onClick={() => {
                        if (confirm('WARNING: This will delete ALL your expenses, income, and settings permanently. Are you sure?')) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                >
                    Reset Application Data
                </button>
            </div>
        </div>
    );
};

export default ProfileView;
