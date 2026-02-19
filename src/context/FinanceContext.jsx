import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import {
    collection, doc, setDoc, onSnapshot, addDoc, deleteDoc, updateDoc,
    query, orderBy, writeBatch
} from 'firebase/firestore';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
    // Auth State
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Data State
    const [currency, setCurrency] = useState({ symbol: '$', code: 'USD', rate: 1 });
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [savingsGoal, setSavingsGoal] = useState({ target: 10000, current: 0 });

    // 1. Listen for Auth Changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            if (currentUser) {
                // Determine if this is a new login where we should sync local data
                const localDataExists = localStorage.getItem('finance_expenses');
                if (localDataExists) {
                    await syncLocalDataToFirestore(currentUser.uid);
                }
            } else {
                // fallback to local storage or clear? For now, let's just clear to avoid confusion
                setExpenses([]);
                setIncome([]);
                setSubscriptions([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Real-time Data Listeners (Only when logged in)
    useEffect(() => {
        if (!user) return;

        const uid = user.uid;

        // User Profile & Settings (Currency, etc.)
        const unsubProfile = onSnapshot(doc(db, 'users', uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.currency) setCurrency(data.currency);
                if (data.savingsGoal) setSavingsGoal(data.savingsGoal);
            }
        });

        // Sub-collections
        const qExp = query(collection(db, 'users', uid, 'expenses'), orderBy('date', 'desc'));
        const unsubExp = onSnapshot(qExp, (snap) => {
            setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const qInc = query(collection(db, 'users', uid, 'income'), orderBy('date', 'desc'));
        const unsubInc = onSnapshot(qInc, (snap) => {
            setIncome(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const qSub = query(collection(db, 'users', uid, 'subscriptions'));
        const unsubSub = onSnapshot(qSub, (snap) => {
            setSubscriptions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            unsubProfile(); unsubExp(); unsubInc(); unsubSub();
        };
    }, [user]);

    // 3. Helper: Sync LocalStorage to Firestore
    const syncLocalDataToFirestore = async (uid) => {
        try {
            const batch = writeBatch(db);

            // Get Local Data
            const localExp = JSON.parse(localStorage.getItem('finance_expenses') || '[]');
            const localInc = JSON.parse(localStorage.getItem('finance_income') || '[]');
            const localSub = JSON.parse(localStorage.getItem('finance_subs') || '[]');
            const localGoal = JSON.parse(localStorage.getItem('finance_goal') || 'null');
            const localCurr = JSON.parse(localStorage.getItem('finance_currency') || 'null');

            // Add to Batch
            localExp.forEach(item => {
                const ref = doc(collection(db, 'users', uid, 'expenses'));
                batch.set(ref, item);
            });
            localInc.forEach(item => {
                const ref = doc(collection(db, 'users', uid, 'income'));
                batch.set(ref, item);
            });
            localSub.forEach(item => {
                const ref = doc(collection(db, 'users', uid, 'subscriptions'));
                batch.set(ref, item);
            });

            // Update Profile
            if (localCurr || localGoal) {
                batch.set(doc(db, 'users', uid), {
                    currency: localCurr || { symbol: '$', code: 'USD', rate: 1 },
                    savingsGoal: localGoal || { target: 10000 },
                    email: user.email,
                    name: user.displayName
                }, { merge: true });
            }

            await batch.commit();

            // Clear Local Storage after successful sync
            localStorage.removeItem('finance_expenses');
            localStorage.removeItem('finance_income');
            localStorage.removeItem('finance_subs');
            localStorage.removeItem('finance_goal');
            localStorage.removeItem('finance_currency');
            localStorage.removeItem('finance_user'); // Legacy user object

            console.log("Synced local data to Cloud!");
        } catch (error) {
            console.error("Sync failed:", error);
        }
    };

    // 4. Actions
    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const logout = () => signOut(auth);

    const updateCurrency = async (curr) => {
        setCurrency(curr);
        if (user) {
            await setDoc(doc(db, 'users', user.uid), { currency: curr }, { merge: true });
        }
    };

    const updateGoal = async (goal) => {
        setSavingsGoal(goal);
        if (user) {
            await setDoc(doc(db, 'users', user.uid), { savingsGoal: goal }, { merge: true });
        }
    };

    const addExpense = async (item) => {
        if (!user) return;
        await addDoc(collection(db, 'users', user.uid, 'expenses'), { ...item, amount: parseFloat(item.amount) });
    };

    const deleteExpense = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
    };

    const addIncome = async (item) => {
        if (!user) return;
        await addDoc(collection(db, 'users', user.uid, 'income'), { ...item, amount: parseFloat(item.amount) });
    };

    const deleteIncome = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.uid, 'income', id));
    };

    const addSubscription = async (item) => {
        if (!user) return;
        await addDoc(collection(db, 'users', user.uid, 'subscriptions'), { ...item, amount: parseFloat(item.amount) });
    };

    const deleteSubscription = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.uid, 'subscriptions', id));
    };

    const formatCurrency = (amount) => {
        return `${currency.symbol}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

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
            user, login, logout, loading,
            currency, updateCurrency, formatCurrency,
            expenses, income, subscriptions, savingsGoal, setSavingsGoal: updateGoal,
            addExpense, deleteExpense, addIncome, deleteIncome, addSubscription, deleteSubscription,
            totals
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => useContext(FinanceContext);
