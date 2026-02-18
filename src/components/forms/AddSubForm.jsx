import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

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

export default AddSubForm;
