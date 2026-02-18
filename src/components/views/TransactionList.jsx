import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

const TransactionList = ({ title, data, type, onDelete, emptyMsg, onAdd }) => {
    const { formatCurrency } = useFinance();

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
                    <span className="text-muted text-sm">Monthly: {formatCurrency(data.reduce((acc, c) => acc + (c.cycle === 'yearly' ? c.amount / 12 : c.amount), 0))}</span>
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
                                    {type === 'expense' ? '-' : type === 'sub' ? '' : '+'} {formatCurrency(item.amount)}
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

export default TransactionList;
