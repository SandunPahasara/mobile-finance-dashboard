import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Settings, Check, User } from 'lucide-react';

import { Settings, CheckCircle, Smartphone, Globe } from 'lucide-react';
import { CURRENCIES } from '../../utils/constants';

const OnboardingView = () => {
    const { login } = useFinance();

    const handleLogin = async () => {
        await login();
    };

    return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: 20,
            background: 'var(--bg-primary)', textAlign: 'center'
        }}>
            <div className="mb-4 animate-enter" style={{
                width: 80, height: 80, borderRadius: 24,
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--bg-card) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 20px 40px -10px rgba(100, 255, 218, 0.3)'
            }}>
                <Smartphone size={40} color="#fff" />
            </div>

            <h1 className="animate-enter delay-100" style={{ fontSize: '2rem', marginBottom: 10 }}>FinanceSync</h1>
            <p className="text-muted animate-enter delay-200" style={{ maxWidth: 300, marginBottom: 40 }}>
                Control your money, track expenses, and reach your goals.
            </p>

            <div className="animate-enter delay-300 w-full" style={{ maxWidth: 320 }}>
                <button
                    className="btn w-full"
                    onClick={handleLogin}
                    style={{
                        background: '#fff', color: '#000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        fontSize: '1rem', padding: '16px'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>
                <div className="mt-4 text-muted" style={{ fontSize: '0.8rem' }}>
                    Secure authentication powered by Google Firebase
                </div>
            </div>
        </div>
    );
};

export default OnboardingView;
