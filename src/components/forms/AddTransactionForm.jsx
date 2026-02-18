import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../utils/constants';

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

export default AddTransactionForm;
