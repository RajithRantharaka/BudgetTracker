import { format } from 'date-fns';
import type { Transaction } from '../types';

interface TransactionTableProps {
    transactions: Transaction[];
    limit?: number; // Optional limit for "Recent Transactions" view
}

export const TransactionTable = ({ transactions, limit }: TransactionTableProps) => {
    // Function to calculate running balance (daily balance logic)
    const calculateBalances = (txs: Transaction[]) => {
        // Actually TransactionService.getAll returns them DESC.
        // To calculate running balance properly, we need them ASC.
        const ascTxs = [...txs].reverse();

        let runningBalance = 0;
        const withBalance = ascTxs.map(t => {
            if (t.type === 'income') {
                runningBalance += t.amount;
            } else {
                runningBalance -= t.amount;
            }
            return { ...t, balance: runningBalance };
        });

        return withBalance.reverse(); // Back to DESC for display
    };

    const dataWithBalance = calculateBalances(transactions);
    const finalDisplay = limit ? dataWithBalance.slice(0, limit) : dataWithBalance;

    return (
        <div className="table-container">
            <table className="transaction-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Payment Method</th>
                        <th className="text-right">Income</th>
                        <th className="text-right">Expense</th>
                        <th className="text-right">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {finalDisplay.map((t) => (
                        <tr key={t.id}>
                            <td>{format(new Date(t.date), 'MM/dd/yyyy')}</td>
                            <td>{t.description}</td>
                            <td>{t.category}</td>
                            <td>{t.paymentMethod}</td>
                            <td className="text-right income-text">
                                {t.type === 'income' ? t.amount.toLocaleString() : '-'}
                            </td>
                            <td className="text-right expense-text">
                                {t.type === 'expense' ? t.amount.toLocaleString() : '-'}
                            </td>
                            <td className="text-right balance-text font-bold">
                                {t.balance.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    {finalDisplay.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center">No transactions recorded.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <style>{`
        .table-container {
          width: 100%;
          overflow-x: auto;
        }

        .transaction-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .transaction-table th, .transaction-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border);
          text-align: left;
        }

        .transaction-table th {
          background-color: hsl(var(--background));
          font-weight: 600;
          color: hsl(var(--text-muted));
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: 600; }

        .income-text { color: hsl(var(--success)); }
        .expense-text { color: hsl(var(--danger)); }
        .balance-text { color: hsl(var(--text-main)); }
      `}</style>
        </div>
    );
};
