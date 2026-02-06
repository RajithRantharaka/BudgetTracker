import type { Transaction, DashboardSummary } from '../types';

const STORAGE_KEY = 'budget_tracker_transactions';

export const TransactionService = {
    getAll: (): Transaction[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            // Parse and sort by date descending (newest first)
            const parsed: Transaction[] = JSON.parse(data);
            return parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (e) {
            console.error('Failed to parse transactions', e);
            return [];
        }
    },

    add: (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
        const newTransaction: Transaction = {
            ...transaction,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        const current = TransactionService.getAll();
        const updated = [newTransaction, ...current];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newTransaction;
    },

    delete: (id: string): void => {
        const current = TransactionService.getAll();
        const updated = current.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    getSummary: (): DashboardSummary => {
        const transactions = TransactionService.getAll();
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalIncome,
            totalExpense,
            currentBalance: totalIncome - totalExpense,
        };
    }
};
