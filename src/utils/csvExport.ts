import type { Transaction } from '../types';

export const exportToCsv = (transactions: Transaction[], fileName: string = 'transactions.csv') => {
    // Define CSV headers
    const headers = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Payment Method'];

    // Map transactions to CSV rows
    const rows = transactions.map(t => [
        t.date, // already YYYY-MM-DD
        t.type,
        t.amount.toString(),
        // Escape quotes in strings
        `"${t.category.replace(/"/g, '""')}"`,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.paymentMethod.replace(/"/g, '""')}"`
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
