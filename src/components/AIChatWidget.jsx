import React, { useState, useEffect } from 'react';
import { Banknote, Edit, TrendingUp } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const AIChatWidget = () => {
    const { expenses, income, subscriptions, savingsGoal, totals } = useFinance();
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chat_history');
        return saved ? JSON.parse(saved) : [{ role: 'system', content: 'You are a helpful financial assistant.' }];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(!apiKey);

    useEffect(() => {
        localStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages]);

    const handleSaveKey = () => {
        localStorage.setItem('openai_api_key', apiKey);
        setShowSettings(false);
    };

    const handleSend = async () => {
        if (!input.trim() || !apiKey) return;

        const userMsg = { role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        // Prepare context
        const context = `
            Current Financial Context:
            - Total Income: $${totals.totalInc}
            - Total Expenses: $${totals.totalExp}
            - Net Savings: $${totals.net}
            - Monthly Subscriptions: $${totals.monthlySubCost}
            - Savings Goal: $${savingsGoal.target} (Current: $${totals.net})
            - Top Expenses: ${expenses.slice(0, 5).map(e => `${e.category}: $${e.amount}`).join(', ')}
            - Recent Transactions: ${expenses.slice(0, 3).map(e => `${e.date}: ${e.category} -$${e.amount}`).join(', ')}
        `;

        const systemPrompt = {
            role: 'system',
            content: `You are a financial advisor using this user's live dashboard data. 
            ${context}
            Keep answers short, encouraging, and actionable.`
        };

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [systemPrompt, ...newMessages.filter(m => m.role !== 'system').slice(-10)], // Send last 10 messages + updated context
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error.message);

            setMessages(prev => [...prev, data.choices[0].message]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}. Please check your API Key.` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed', bottom: 100, right: 20,
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'var(--bg-card)', border: '1px solid var(--accent)',
                    color: 'var(--accent)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                {isOpen ? <div style={{ fontSize: 24 }}>&times;</div> : <Banknote size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: 170, right: 20, width: '90%', maxWidth: 350,
                    height: 500, background: 'var(--bg-card)', borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    display: 'flex', flexDirection: 'column', zIndex: 100, overflow: 'hidden'
                }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Financial Assistant</h3>
                        <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit size={16} /></button>
                    </div>

                    {showSettings ? (
                        <div style={{ padding: 20, flex: 1 }}>
                            <p className="text-muted text-sm mb-4">Enter your OpenAI API Key to enable chat.</p>
                            <input
                                type="password"
                                className="form-input mb-4"
                                placeholder="sk-..."
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                            />
                            <button className="btn btn-primary w-full" onClick={handleSaveKey}>Save Key</button>
                            <p className="text-muted text-sm mt-4" style={{ fontSize: '0.75rem' }}>Key is stored locally in your browser.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {messages.filter(m => m.role !== 'system').map((m, i) => (
                                    <div key={i} style={{
                                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                        background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-secondary)',
                                        color: m.role === 'user' ? 'var(--bg-primary)' : 'var(--text-main)',
                                        padding: '8px 12px', borderRadius: 12, maxWidth: '80%', fontSize: '0.9rem'
                                    }}>
                                        {m.content}
                                    </div>
                                ))}
                                {isLoading && <div className="text-muted text-sm" style={{ alignSelf: 'flex-start', marginLeft: 12 }}>Thinking...</div>}
                            </div>
                            <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 8 }}>
                                <input
                                    className="form-input"
                                    style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about your finances..."
                                />
                                <button onClick={handleSend} className="btn btn-primary" style={{ padding: '0 12px' }}><TrendingUp size={20} /></button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default AIChatWidget;
