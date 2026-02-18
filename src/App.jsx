import React, { useState } from 'react';
import { LayoutDashboard, Wallet, TrendingUp, CreditCard } from 'lucide-react';
import { FinanceProvider, useFinance } from './context/FinanceContext';

// Components
import Modal from './components/Modal';
import AddTransactionForm from './components/forms/AddTransactionForm';
import AddSubForm from './components/forms/AddSubForm';
import EditGoalForm from './components/forms/EditGoalForm';
import DashboardView from './components/views/DashboardView';
import TransactionList from './components/views/TransactionList';
import AIChatWidget from './components/AIChatWidget';

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
