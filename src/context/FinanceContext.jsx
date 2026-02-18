import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

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

export const useFinance = () => useContext(FinanceContext);
