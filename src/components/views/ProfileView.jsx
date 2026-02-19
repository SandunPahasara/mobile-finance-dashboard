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
    const [profilePic, setProfilePic] = useState(user?.profilePic || '');
    const [birthday, setBirthday] = useState(user?.birthday || '');
    const [job, setJob] = useState(user?.job || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [selectedCurrency, setSelectedCurrency] = useState(currency.code);
    const [message, setMessage] = useState('');

    const age = React.useMemo(() => {
        if (!birthday) return '';
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age; // Return plain number
    }, [birthday]);

    const handleSave = (e) => {
        e.preventDefault();
        const currencyObj = CURRENCIES.find(c => c.code === selectedCurrency);
        updateCurrency(currencyObj);
        login({ ...user, name, profilePic, birthday, job, bio });
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="container" style={{ paddingBottom: 80 }}>
            <h1 className="mb-4">Profile & Settings</h1>

            <div className="card animate-enter">
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30 }}>
                    {profilePic ? (
                        <img 
                            src={profilePic} 
                            alt="Profile" 
                            style={{ 
                                width: 80, height: 80, borderRadius: '50%', objectFit: 'cover',
                                border: '2px solid var(--accent)'
                            }} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80?text=?'; }}
                        />
                    ) : (
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)'
                        }}>
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-3">
                             <h2 style={{ fontSize: '1.5rem', marginBottom: 5 }}>{name}</h2>
                             {job && <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary border border-primary/20">{job}</span>}
                        </div>
                        <p className="text-muted text-sm">
                            Member since {new Date(user?.joined || Date.now()).getFullYear()} 
                            {age && ` • ${age} years old`}
                        </p>
                    </div>
                </div>                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 5 }}>{name}</h2>
                        <p className="text-muted">Member since {new Date(user?.joined || Date.now()).getFullYear()}</p>
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    <div className="flex gap-6 mb-6">
                        <div className="flex-1">
                            <div className="form-group">
                                <label className="form-label">Profile Picture URL</label>
                                <input
                                    className="form-input"
                                    value={profilePic}
                                    onChange={e => setProfilePic(e.target.value)}
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Display Name</label>
                                <input
                                    className="form-input"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Job Title</label>
                                <input
                                    className="form-input"
                                    value={job}
                                    onChange={e => setJob(e.target.value)}
                                    placeholder="e.g. Software Engineer"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="form-group">
                                <label className="form-label">Birthday</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={birthday}
                                    onChange={e => setBirthday(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input
                                    className="form-input"
                                    value={age}
                                    disabled
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
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
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea
                            className="form-input"
                            rows="3"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Tell us a little about yourself..."
                        />
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
        </div >
    );
};

export default ProfileView;
