import { supabase } from '../lib/supabase';

export interface BudgetGoal {
    id: string;
    user_id: string;
    category: string;
    amount_limit: number;
}

export const BudgetService = {
    getAll: async (): Promise<BudgetGoal[]> => {
        const { data, error } = await supabase
            .from('budget_goals')
            .select('*');

        if (error) {
            console.error('Error fetching budget goals:', error);
            return [];
        }
        return data || [];
    },

    setLimit: async (category: string, amount: number, userId: string): Promise<BudgetGoal | null> => {
        // Upsert logic
        const { data, error } = await supabase
            .from('budget_goals')
            .upsert({
                user_id: userId,
                category: category,
                amount_limit: amount
            }, { onConflict: 'user_id, category' })
            .select()
            .single();

        if (error) {
            console.error('Error setting budget limit:', error);
            return null;
        }
        return data;
    },

    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('budget_goals')
            .delete()
            .eq('id', id);

        if (error) console.error('Error deleting budget goal:', error);
    }
};
