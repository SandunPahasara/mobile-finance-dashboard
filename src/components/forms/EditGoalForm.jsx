import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

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

export default EditGoalForm;
