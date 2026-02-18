import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    LayoutDashboard,
    Wallet,
    TrendingUp,
    CreditCard,
    Plus,
    Trash2,
    Edit,
    Banknote
} from 'lucide-react';

// --- CONSTANTS ---
const CATEGORIES = {
    Housing: '#FF6B6B',
    Food: '#FFD166',
    Transport: '#06D6A0',
    Health: '#118AB2',
    Entertainment: '#EF476F',
    Personal: '#9D4EDD',
    Other: '#8892B0'
};

// --- CONTEXT ---
const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
    const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('finance_expenses')) || []);
    const [income, setIncome] = useState(() => JSON.parse(localStorage.getItem('finance_income')) || []);
    const [subscriptions, setSubscriptions] = useState(() => JSON.parse(localStorage.getItem('finance_subs')) || []);
    const [savingsGoal, setSavingsGoal] = useState(() => JSON.parse(localStorage.getItem('finance_goal')) || { target: 10000, deadline: '', current: 0 });

    useEffect(() => localStorage.setItem('finance_expenses', JSON.stringify(expenses)), [expenses]);
    useEffect(() => localStorage.setItem('finance_income', JSON.stringify(income)), [income]);
    useEffect(() => localStorage.setItem('finance_subs', JSON.stringify(subscriptions)), [subscriptions]);
    useEffect(() => localStorage.setItem('finance_goal', JSON.stringify(savingsGoal)), [savingsGoal]);

    const addExpense = (item) => setExpenses(prev => [{ ...item, id: Date.now().toString(), amount: parseFloat(item.amount) }, ...prev]);
    const deleteExpense = (id) => setExpenses(prev => prev.filter(i => i.id !== id));

    const addIncome = (item) => setIncome(prev => [{ ...item, id: Date.now().toString(), amount: parseFloat(item.amount) }, ...prev]);
    const deleteIncome = (id) => setIncome(prev => prev.filter(i => i.id !== id));

    const addSubscription = (item) => setSubscriptions(prev => [{ ...item, id: Date.now().toString(), amount: parseFloat(item.amount) }, ...prev]);
    const deleteSubscription = (id) => setSubscriptions(prev => prev.filter(i => i.id !== id));

    const updateGoal = (goal) => setSavingsGoal(goal);

    const totals = useMemo(() => {
        const totalExp = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const totalInc = income.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const net = totalInc - totalExp;

        const monthlySubCost = subscriptions.reduce((acc, curr) => {
            return acc + (curr.cycle === 'yearly' ? (curr.amount / 12) : curr.amount);
        }, 0);

        return { totalExp, totalInc, net, monthlySubCost };
    }, [expenses, income, subscriptions]);

    return (
        <FinanceContext.Provider value={{
            expenses, income, subscriptions, savingsGoal, setSavingsGoal: updateGoal,
            addExpense, deleteExpense, addIncome, deleteIncome, addSubscription, deleteSubscription,
            totals
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

const useFinance = () => useContext(FinanceContext);

// --- COMPONENTS ---
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="flex justify-between items-center mb-4">
                    <h2>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const AddTransactionForm = ({ type, onClose }) => {
    const { addExpense, addIncome } = useFinance();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(type === 'expense' ? 'Food' : 'Salary');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount) return;

        const item = { amount, category, note: note || (type === 'expense' ? category : 'Income'), date };

        if (type === 'expense') addExpense(item);
        else addIncome({ ...item, source: category });

        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Amount</label>
                <input type="number" className="form-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" autoFocus required step="0.01" />
            </div>

            <div className="form-group">
                <label className="form-label">{type === 'expense' ? 'Category' : 'Source'}</label>
                {type === 'expense' ? (
                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                        {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                ) : (
                    <input type="text" className="form-input" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Salary, Freelance" />
                )}
            </div>

            <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div className="form-group">
                <label className="form-label">Note (Optional)</label>
                <input type="text" className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="Details..." />
            </div>

            <button type="submit" className="btn btn-primary w-full">Save {type === 'expense' ? 'Expense' : 'Income'}</button>
        </form>
    );
};

const AddSubForm = ({ onClose }) => {
    const { addSubscription } = useFinance();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [cycle, setCycle] = useState('monthly');
    const [nextDue, setNextDue] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !amount) return;
        addSubscription({ name, amount, cycle, nextDue });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Service Name</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Netflix, Spotify..." autoFocus required />
            </div>
            <div className="form-group">
                <label className="form-label">Amount</label>
                <input type="number" className="form-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required step="0.01" />
            </div>
            <div className="form-group">
                <label className="form-label">Billing Cycle</label>
                <select className="form-select" value={cycle} onChange={e => setCycle(e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Next Due Date</label>
                <input type="date" className="form-input" value={nextDue} onChange={e => setNextDue(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary w-full">Add Subscription</button>
        </form>
    );
}

const EditGoalForm = ({ onClose }) => {
    const { savingsGoal, setSavingsGoal } = useFinance();
    const [target, setTarget] = useState(savingsGoal.target);
    const [deadline, setDeadline] = useState(savingsGoal.deadline);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSavingsGoal({ ...savingsGoal, target: parseFloat(target), deadline });
        onClose();
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Target Amount</label>
                <input type="number" className="form-input" value={target} onChange={e => setTarget(e.target.value)} required step="100" />
            </div>
            <div className="form-group">
                <label className="form-label">Deadline (Optional)</label>
                <input type="date" className="form-input" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary w-full">Update Goal</button>
        </form>
    );
}

// --- SUB VIEWS ---
const DashboardView = ({ onOpenModal }) => {
    const { totals, expenses, income, savingsGoal } = useFinance();

    // Prepare Chart Data
    const pieData = useMemo(() => {
        const map = {};
        expenses.forEach(e => {
            map[e.category] = (map[e.category] || 0) + e.amount;
        });
        return Object.keys(map).map(k => ({ name: k, value: map[k], color: CATEGORIES[k] }))
            .filter(i => i.value > 0);
    }, [expenses]);

    const monthlyData = useMemo(() => {
        const months = {};
        // Init last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            const k = d.toISOString().slice(0, 7); // 2024-02
            const name = d.toLocaleString('default', { month: 'short' });
            months[k] = { name, income: 0, expense: 0, net: 0, amt: 0 };
        }

        income.forEach(i => {
            const k = i.date.slice(0, 7);
            if (months[k]) months[k].income += i.amount;
        });
        expenses.forEach(e => {
            const k = e.date.slice(0, 7);
            if (months[k]) months[k].expense += e.amount;
        });

        Object.values(months).forEach(m => m.net = m.income - m.expense);
        return Object.values(months);
    }, [income, expenses]);

    const savingsProgress = Math.min(100, Math.max(0, (totals.net / savingsGoal.target) * 100));

    return (
        <div className="container" style={{ paddingBottom: 80 }}>
            <header className="flex justify-between items-center mb-4 animate-enter">
                <div>
                    <h1>Overview</h1>
                    <p className="text-muted">Welcome back</p>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #64ffda 0%, #0a192f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#020c1b' }}>YOU</span>
                </div>
            </header>

            {/* Metric Cards */}
            <div className="animate-enter delay-100" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="card">
                    <div className="flex items-center gap-2 mb-2 text-muted text-sm"><TrendingUp size={16} /> Income</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>${totals.totalInc.toLocaleString()}</div>
                </div>
                <div className="card">
                    <div className="flex items-center gap-2 mb-2 text-muted text-sm"><Wallet size={16} /> Expenses</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>${totals.totalExp.toLocaleString()}</div>
                </div>
                <div className="card" onClick={() => onOpenModal('goal')} style={{ gridColumn: '1 / -1', cursor: 'pointer', background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(100,255,218,0.05) 100%)' }}>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-2 text-muted text-sm mb-1">Total Savings <Edit size={14} /></div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>${totals.net.toLocaleString()}</div>
                        </div>
                        <div className="text-sm text-muted">Goal: ${savingsGoal.target.toLocaleString()}</div>
                    </div>
                    <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 15, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${savingsProgress}%`, background: 'var(--accent)', transition: 'width 1s ease' }}></div>
                    </div>
                </div>
            </div>

            {/* Charts Swiper (Vertical Stack for Mobile) */}

            {/* Monthly Trends (Bar + Line) */}
            <div className="card animate-enter delay-200 mb-4">
                <h3 className="mb-4">Monthly Trends</h3>
                <div style={{ width: '100%', height: 220, fontSize: '12px' }}>
                    <ResponsiveContainer>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8892b0' }} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="income" fill="#64ffda" radius={[4, 4, 0, 0]} stackId="a" />
                            <Bar dataKey="expense" fill="#ff6b6b" radius={[4, 4, 0, 0]} stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Expense Breakdown */}
            {pieData.length > 0 && (
                <div className="card animate-enter delay-300 mb-4">
                    <h3 className="mb-4">Spending Breakdown</h3>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} stroke="var(--bg-card)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '0.8rem', color: '#8892b0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

const TransactionList = ({ title, data, type, onDelete, emptyMsg, onAdd }) => {
    const checkDueSoon = (date) => {
        if (!date) return false;
        const today = new Date();
        const due = new Date(date);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    };

    return (
        <div className="container animate-enter" style={{ paddingBottom: 80 }}>
            <div className="flex justify-between items-center mb-4">
                <h1>{title}</h1>
                {title === 'Subscriptions' && (
                    <span className="text-muted text-sm">Monthly: ${data.reduce((acc, c) => acc + (c.cycle === 'yearly' ? c.amount / 12 : c.amount), 0).toFixed(2)}</span>
                )}
            </div>
            {data.length === 0 ? (
                <div className="card flex-col items-center justify-center" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 10 }}>No records found</div>
                    <button className="btn btn-outline" onClick={onAdd}>Add First {title}</button>
                </div>
            ) : (
                <div>
                    {data.map((item, i) => (
                        <div key={item.id} className="list-item" style={{ animationDelay: `${i * 50}ms` }}>
                            <div>
                                <div className="flex items-center">
                                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{item.category || item.source || item.name}</span>
                                    {type === 'sub' && checkDueSoon(item.nextDue) && <span className="badge-alert">Due Soon</span>}
                                </div>
                                <div className="text-muted text-sm">{item.date || item.nextDue} {item.note ? `• ${item.note}` : ''}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div style={{ fontWeight: 700, color: type === 'expense' ? 'var(--text-main)' : 'var(--success)' }}>
                                    {type === 'expense' ? '-' : type === 'sub' ? '' : '+'} ${Number(item.amount).toLocaleString()}
                                    {type === 'sub' && <span className="text-muted" style={{ fontSize: '0.7em', fontWeight: 400 }}>/{item.cycle === 'yearly' ? 'yr' : 'mo'}</span>}
                                </div>
                                <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 4 }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <button className="btn-float" onClick={onAdd}>
                <Plus size={28} />
            </button>
        </div>
    );
};

// --- AI CHAT WIDGET ---
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

// --- MAIN ---
function App() {
    const [view, setView] = useState('dashboard');
    const [modal, setModal] = useState(null); // 'expense', 'income', 'sub', 'goal'

    return (
        <FinanceProvider>
            <AppContent view={view} setView={setView} modal={modal} setModal={setModal} />
        </FinanceProvider>
    );
}

const AppContent = ({ view, setView, modal, setModal }) => {
    const { expenses, income, subscriptions, deleteExpense, deleteIncome, deleteSubscription } = useFinance();

    return (
        <>
            <main>
                {view === 'dashboard' && <DashboardView onOpenModal={setModal} />}
                {view === 'expenses' && <TransactionList title="Expenses" data={expenses} type="expense" onDelete={deleteExpense} onAdd={() => setModal('expense')} />}
                {view === 'income' && <TransactionList title="Income" data={income} type="income" onDelete={deleteIncome} onAdd={() => setModal('income')} />}
                {view === 'subscriptions' && <TransactionList title="Subscriptions" data={subscriptions} type="sub" onDelete={deleteSubscription} onAdd={() => setModal('sub')} />}
            </main>

            <AIChatWidget />

            <nav className="bottom-nav">
                <button className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
                    <LayoutDashboard size={24} /> <span>Dash</span>
                </button>
                <button className={`nav-item ${view === 'expenses' ? 'active' : ''}`} onClick={() => setView('expenses')}>
                    <Wallet size={24} /> <span>Expenses</span>
                </button>
                <button className={`nav-item ${view === 'income' ? 'active' : ''}`} onClick={() => setView('income')}>
                    <TrendingUp size={24} /> <span>Income</span>
                </button>
                <button className={`nav-item ${view === 'subscriptions' ? 'active' : ''}`} onClick={() => setView('subscriptions')}>
                    <CreditCard size={24} /> <span>Subs</span>
                </button>
            </nav>

            {/* Global Modals */}
            <Modal isOpen={modal === 'expense'} onClose={() => setModal(null)} title="New Expense">
                <AddTransactionForm type="expense" onClose={() => setModal(null)} />
            </Modal>
            <Modal isOpen={modal === 'income'} onClose={() => setModal(null)} title="New Income">
                <AddTransactionForm type="income" onClose={() => setModal(null)} />
            </Modal>
            <Modal isOpen={modal === 'sub'} onClose={() => setModal(null)} title="New Subscription">
                <AddSubForm onClose={() => setModal(null)} />
            </Modal>
            <Modal isOpen={modal === 'goal'} onClose={() => setModal(null)} title="Edit Savings Goal">
                <EditGoalForm onClose={() => setModal(null)} />
            </Modal>
        </>
    );
};

export default App;
