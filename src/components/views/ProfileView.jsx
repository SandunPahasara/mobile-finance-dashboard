import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { User, LogOut, Check, Upload } from 'lucide-react';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { CURRENCIES } from '../../utils/constants';

const ProfileView = () => {
    const { user, currency, logout, updateCurrency, updateUserProfile } = useFinance(); // Removed login, added updateUserProfile
    const [name, setName] = useState(user?.name || '');
    const [profilePic, setProfilePic] = useState(user?.profilePic || '');
    const [birthday, setBirthday] = useState(user?.birthday || '');
    const [job, setJob] = useState(user?.job || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [selectedCurrency, setSelectedCurrency] = useState(currency.code);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);

    const age = useMemo(() => {
        if (!birthday) return '';
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }, [birthday]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `profile_pictures/${user.uid}/${file.name}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setProfilePic(url);
            setMessage('Image uploaded! Click Save (below) to apply changes.');
        } catch (error) {
            console.error("Upload failed", error);
            setMessage(`Failed to upload image: ${error.message} (${error.code})`);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const currencyObj = CURRENCIES.find(c => c.code === selectedCurrency);
        updateCurrency(currencyObj);

        try {
            await updateUserProfile({
                name,
                profilePic,
                birthday,
                job,
                bio,
                updatedAt: new Date().toISOString()
            });
            setMessage('Profile updated successfully!');
        } catch (error) {
            console.error("Save failed", error);
            setMessage('Failed to save profile.');
        }

        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="container" style={{ paddingBottom: 80 }}>
            <h1 className="mb-4">Profile & Settings</h1>

            <div className="card animate-enter">
                <div className="flex flex-row-md items-center gap-6 mb-8">
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
                            minWidth: 80, minHeight: 80, width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)'
                        }}>
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div style={{ textAlign: 'inherit' }}>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: 5 }}>{name}</h2>
                            {job && <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary border border-primary/20">{job}</span>}
                        </div>
                        <p className="text-muted text-sm">
                            Member since {new Date(user?.joined || Date.now()).getFullYear()}
                            {age && ` • ${age} years old`}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    <div className="flex flex-row-md gap-0 md:gap-6 mb-0 md:mb-6">
                        <div style={{ flex: 1 }}>
                            <div className="form-group">
                                <label className="form-label">Profile Picture</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                    <label className="btn btn-outline btn-sm pointer" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '10px 16px' }}>
                                        <Upload size={14} />
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                            disabled={uploading}
                                        />
                                    </label>
                                    <span className="text-xs text-muted">or use URL below</span>
                                </div>
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
                        <div style={{ flex: 1 }}>
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

                    <div className="flex flex-row-md gap-4">
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                            {uploading ? 'Wait for Upload...' : 'Save Changes'}
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
