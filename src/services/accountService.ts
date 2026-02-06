import { supabase } from '../lib/supabase';

export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: 'Bank' | 'Cash' | 'Mobile Wallet' | 'Investment' | 'Savings' | 'Other';
    balance: number; // Initial/Calculated balance
}

export const AccountService = {
    getAll: async (): Promise<Account[]> => {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching accounts:', error);
            return [];
        }
        return data || [];
    },

    add: async (account: Omit<Account, 'id' | 'user_id' | 'balance'>, userId: string): Promise<Account | null> => {
        const { data, error } = await supabase
            .from('accounts')
            .insert({
                user_id: userId,
                name: account.name,
                type: account.type,
                balance: 0 // Default starting balance
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding account:', error);
            return null;
        }
        return data;
    },

    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id);

        if (error) console.error('Error deleting account:', error);
    },

    // Helper to seed default accounts if none exist
    seedDefaults: async (userId: string) => {
        const accounts = await AccountService.getAll();
        if (accounts.length === 0) {
            await AccountService.add({ name: 'Cash', type: 'Cash' }, userId);
            await AccountService.add({ name: 'Bank Account', type: 'Bank' }, userId);
        }
    }
};
