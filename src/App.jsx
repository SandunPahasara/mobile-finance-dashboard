import React, { useState } from 'react';
import { LayoutDashboard, Wallet, TrendingUp, CreditCard, User } from 'lucide-react';
import { FinanceProvider, useFinance } from './context/FinanceContext';

// Components
import Modal from './components/Modal';
import AddTransactionForm from './components/forms/AddTransactionForm';
import AddSubForm from './components/forms/AddSubForm';
import EditGoalForm from './components/forms/EditGoalForm';
import DashboardView from './components/views/DashboardView';
import TransactionList from './components/views/TransactionList';
import AIChatWidget from './components/AIChatWidget';
import OnboardingView from './components/views/OnboardingView';
import ProfileView from './components/views/ProfileView';

import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function App() {
    return (
        <FinanceProvider>
            <ThemeProvider>
                <AppContentSwitch />
            </ThemeProvider>
        </FinanceProvider>
    );
}

const AppContentSwitch = () => {
    const { user } = useFinance();
    const [view, setView] = useState('dashboard');
    const [modal, setModal] = useState(null);

    // If no user, show Onboarding
    if (!user) {
        return <OnboardingView />;
    }

    return (
        <AppContent view={view} setView={setView} modal={modal} setModal={setModal} />
    );
};

const AppContent = ({ view, setView, modal, setModal }) => {
    const { expenses, income, subscriptions, deleteExpense, deleteIncome, deleteSubscription } = useFinance();

    return (
        <>
            <main>
                {view === 'dashboard' && <DashboardView onOpenModal={setModal} onViewChange={setView} />}
                {view === 'expenses' && <TransactionList title="Expenses" data={expenses} type="expense" onDelete={deleteExpense} onAdd={() => setModal('expense')} />}
                {view === 'income' && <TransactionList title="Income" data={income} type="income" onDelete={deleteIncome} onAdd={() => setModal('income')} />}
                {view === 'subscriptions' && <TransactionList title="Subscriptions" data={subscriptions} type="sub" onDelete={deleteSubscription} onAdd={() => setModal('sub')} />}
                {view === 'profile' && <ProfileView />}
            </main>

            <ThemeToggle />
            <AIChatWidget />

            <nav className="bottom-nav">
                <button className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
                    <LayoutDashboard size={24} /> <span>Dash</span>
                </button>
                <button className={`nav-item ${view === 'expenses' ? 'active' : ''}`} onClick={() => setView('expenses')}>
                    <Wallet size={24} /> <span>Exp</span>
                </button>
                <button className={`nav-item ${view === 'income' ? 'active' : ''}`} onClick={() => setView('income')}>
                    <TrendingUp size={24} /> <span>Inc</span>
                </button>
                <button className={`nav-item ${view === 'subscriptions' ? 'active' : ''}`} onClick={() => setView('subscriptions')}>
                    <CreditCard size={24} /> <span>Subs</span>
                </button>
                <button className={`nav-item ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')}>
                    <User size={24} /> <span>Me</span>
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
