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
    const [authUser, setAuthUser] = useState(null);
    const [dbUser, setDbUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Data State
    const [currency, setCurrency] = useState({ symbol: '$', code: 'USD', rate: 1 });
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [savingsGoal, setSavingsGoal] = useState({ target: 10000, current: 0 });

    // Derived User State (Merge Auth + DB)
    const user = useMemo(() => {
        if (!authUser) return null;
        return { ...authUser, ...dbUser };
    }, [authUser, dbUser]);

    // 1. Listen for Auth Changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setAuthUser(currentUser);
            if (!currentUser) {
                setDbUser(null);
                setLoading(false);
                // Clear state on logout
                setExpenses([]);
                setIncome([]);
                setSubscriptions([]);
            } else {
                // Check for local data sync on login
                const localDataExists = localStorage.getItem('finance_expenses');
                if (localDataExists) {
                    await syncLocalDataToFirestore(currentUser.uid);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Real-time Data Listeners (Only when logged in)
    useEffect(() => {
        if (!authUser) return;

        const uid = authUser.uid;

        // User Profile & Settings (Currency, etc.)
        const unsubProfile = onSnapshot(doc(db, 'users', uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setDbUser(data);
                if (data.currency) setCurrency(data.currency);
                if (data.savingsGoal) setSavingsGoal(data.savingsGoal);
            }
            setLoading(false); // optimize loading state
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
    }, [authUser]);

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
                    email: authUser.email,
                    name: authUser.displayName,
                    joined: new Date().toISOString()
                }, { merge: true });
            }

            await batch.commit();

            // Clear Local Storage after successful sync
            localStorage.removeItem('finance_expenses');
            localStorage.removeItem('finance_income');
            localStorage.removeItem('finance_subs');
            localStorage.removeItem('finance_goal');
            localStorage.removeItem('finance_currency');
            localStorage.removeItem('finance_user');

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
        if (authUser) {
            await setDoc(doc(db, 'users', authUser.uid), { currency: curr }, { merge: true });
        }
    };

    const updateGoal = async (goal) => {
        setSavingsGoal(goal);
        if (authUser) {
            await setDoc(doc(db, 'users', authUser.uid), { savingsGoal: goal }, { merge: true });
        }
    };

    const updateUserProfile = async (data) => {
        if (!authUser) return;
        try {
            await setDoc(doc(db, 'users', authUser.uid), data, { merge: true });
            // Optimistically update dbUser
            setDbUser(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    const addExpense = async (item) => {
        if (!authUser) return;
        await addDoc(collection(db, 'users', authUser.uid, 'expenses'), { ...item, amount: parseFloat(item.amount) });
    };

    const deleteExpense = async (id) => {
        if (!authUser) return;
        await deleteDoc(doc(db, 'users', authUser.uid, 'expenses', id));
    };

    const addIncome = async (item) => {
        if (!authUser) return;
        await addDoc(collection(db, 'users', authUser.uid, 'income'), { ...item, amount: parseFloat(item.amount) });
    };

    const deleteIncome = async (id) => {
        if (!authUser) return;
        await deleteDoc(doc(db, 'users', authUser.uid, 'income', id));
    };

    const addSubscription = async (item) => {
        if (!authUser) return;
        await addDoc(collection(db, 'users', authUser.uid, 'subscriptions'), { ...item, amount: parseFloat(item.amount) });
    };

    const deleteSubscription = async (id) => {
        if (!authUser) return;
        await deleteDoc(doc(db, 'users', authUser.uid, 'subscriptions', id));
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
            updateUserProfile, // Export new function
            addExpense, deleteExpense, addIncome, deleteIncome, addSubscription, deleteSubscription,
            totals
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => useContext(FinanceContext);
