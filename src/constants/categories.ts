export const EXPENSE_CATEGORIES = [
    'Food',
    'Travel',
    'Bills',
    'Shopping',
    'Health',
    'Entertainment',
    'Education',
    'Investment',
    'Other'
];

export const INCOME_CATEGORIES = [
    'Salary',
    'Business',
    'Interest',
    'Gift',
    'Other'
];

export const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])].sort();
