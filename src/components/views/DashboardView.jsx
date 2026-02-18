import React, { useMemo } from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Wallet, Edit } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../utils/constants';

const DashboardView = ({ onOpenModal }) => {
    const { totals, expenses, income, subscriptions, savingsGoal } = useFinance();

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
            months[k] = { name, income: 0, expense: 0, net: 0, amt: 0, growth: 0 };
        }

        income.forEach(i => {
            const k = i.date.slice(0, 7);
            if (months[k]) months[k].income += i.amount;
        });
        expenses.forEach(e => {
            const k = e.date.slice(0, 7);
            if (months[k]) months[k].expense += e.amount;
        });

        // Calculate Cumulative Growth (Simulated Investment Performance)
        let runningTotal = 1000; // Starting baseline
        Object.values(months).forEach(m => {
            m.net = m.income - m.expense;
            runningTotal += m.net;
            // Add slight "market growth" simulation for visual appeal if positive
            if (runningTotal > 0) runningTotal *= 1.02;
            m.growth = Math.round(runningTotal);
        });

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

            {/* Investment Growth Graph */}
            <div className="card animate-enter delay-200 mb-4">
                <h3 className="mb-4">Investment Performance</h3>
                <div style={{ width: '100%', height: 200, fontSize: '12px' }}>
                    <ResponsiveContainer>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#64ffda" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#64ffda" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8892b0' }} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                                cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                            />
                            <Area type="monotone" dataKey="growth" stroke="#64ffda" fillOpacity={1} fill="url(#colorGrowth)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Subscriptions Widget */}
            <div className="card animate-enter delay-300 mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h3>Active Subscriptions</h3>
                    <span className="text-muted text-sm">${totals.monthlySubCost.toFixed(2)}/mo</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {subscriptions.length === 0 ? <div className="text-muted text-sm">No subscriptions yet.</div> :
                        subscriptions.map(sub => (
                            <div key={sub.id} style={{
                                minWidth: 100, padding: 12, borderRadius: 12,
                                background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', flexDirection: 'column', gap: 4
                            }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</div>
                                <div className="text-muted text-sm">${sub.amount}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64ffda' }}>{sub.cycle}</div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Monthly Trends (Bar + Line) */}
            <div className="card animate-enter delay-200 mb-4">
                <h3 className="mb-4">Six Month Trend</h3>
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

export default DashboardView;
