import { supabase } from '../lib/supabase';
import type { Transaction, DashboardSummary } from '../types';

export const TransactionService = {
    getAll: async (): Promise<Transaction[]> => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }

        return (data || []).map((t: any) => ({
            ...t,
            category: t.category,
            paymentMethod: t.payment_method, // Mapping snake_case DB to camelCase
            createdAt: t.created_at,
        }));
    },

    add: async (transaction: Omit<Transaction, 'id' | 'createdAt'>, userId: string): Promise<Transaction | null> => {
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                date: transaction.date,
                description: transaction.description,
                category: transaction.category,
                payment_method: transaction.paymentMethod, // Mapping back to snake_case
                amount: transaction.amount,
                type: transaction.type
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding transaction:', error);
            return null;
        }

        return {
            ...data,
            category: data.category,
            paymentMethod: data.payment_method,
            createdAt: data.created_at,
        };
    },

    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting transaction', error);
        }
    },

    deleteAll: async (userId: string): Promise<void> => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting all transactions', error);
            throw error;
        }
    },

    update: async (id: string, transaction: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<Transaction | null> => {
        // Map camelCase to snake_case for DB
        const dbUpdates: any = {
            ...transaction,
        };
        if (transaction.paymentMethod) {
            dbUpdates.payment_method = transaction.paymentMethod;
            delete dbUpdates.paymentMethod;
        }

        const { data, error } = await supabase
            .from('transactions')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating transaction:', error);
            return null;
        }

        return {
            ...data,
            category: data.category,
            paymentMethod: data.payment_method,
            createdAt: data.created_at,
        };
    },

    // Note: For summary, in a real app we might do this calculation on backend or via DB aggregation 
    // to avoid fetching all rows. For now, fetching all is fine for a personal app.
    getSummaryFromTransactions: (transactions: Transaction[]): DashboardSummary => {
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
