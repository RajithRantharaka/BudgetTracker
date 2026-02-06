export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Cash' | 'Card' | 'Online Banking' | 'Other';

export interface Transaction {
    id: string;
    date: string;
    description: string;
    category: string;
    paymentMethod: PaymentMethod;
    amount: number;
    type: TransactionType;
    createdAt: string;
}

export interface DailySummary {
    date: string;
    income: number;
    expense: number;
    balance: number; // accumulated balance up to this day? Or just daily balance? 
    // Excel shows "Daily Balance" which seems to be running balance or just that day's net?
    // Looking at Excel: 94775 Income, 0 Expense -> 94775 Balance.
    // Next row: 10000 Expense -> 83573 Balance (wait 94775 - 10000 = 84775. Why 83573?)
    // Ah, looking at the sheet:
    // 1/27: Income 94775. Expense 0. Balance 94775.
    // 1/27: Saving (Expense) 10000. Balance column is empty for this row? 
    // No, the balance 83573 is on 1/28.
    // Let's look closer at the image.
    // Row 3: 1/27, Saving, Other, Online Banking, Expense 10000. Daily Balance column is empty.
    // Row 4: 1/28, Food, Card, Expense 1202. Daily Balance 83573.
    // Row 5: 1/28, Shopping, Cash, Expense 1000. Daily Balance 82573.
    // It seems "Daily Balance" is actually "Running Balance".
    // 94775 - 10000 = 84775.
    // 84775 - 1202 = 83573. Correct.
    // So it is a running balance.
}

export interface DashboardSummary {
    totalIncome: number;
    totalExpense: number;
    currentBalance: number;
}
