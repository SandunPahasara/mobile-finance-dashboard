import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Settings, Check, User } from 'lucide-react';

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

const OnboardingView = () => {
    const { login, updateCurrency } = useFinance();
    const [name, setName] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('USD');

    const handleStart = (e) => {
        e.preventDefault();
        if (!name) return;

        const currencyObj = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

        updateCurrency(currencyObj);
        login({ name, joined: new Date().toISOString() });
    };

    return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            background: 'var(--bg-primary)', padding: 20
        }}>
            <div className="card animate-enter" style={{ width: '100%', maxWidth: 400, textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: 'rgba(100,255,218,0.1)',
                    color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px'
                }}>
                    <User size={40} />
                </div>

                <h1 style={{ marginBottom: 10 }}>Welcome</h1>
                <p className="text-muted" style={{ marginBottom: 30 }}>Let's set up your profile to get started.</p>

                <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label">What should we call you?</label>
                        <input
                            className="form-input"
                            placeholder="Your Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label">Select Currency</label>
                        <select
                            className="form-select"
                            value={selectedCurrency}
                            onChange={e => setSelectedCurrency(e.target.value)}
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.symbol} - {c.name}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ padding: 15, fontSize: '1.1rem' }}>
                        Get Started <Check size={18} style={{ marginLeft: 8 }} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OnboardingView;
