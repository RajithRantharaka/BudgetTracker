import { AlertTriangle } from 'lucide-react';
import type { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  limit?: number;
  onRowClick?: (transaction: Transaction) => void;
  overBudgetCategories?: Set<string>;
}

export const TransactionTable = ({ transactions, limit, onRowClick, overBudgetCategories }: TransactionTableProps) => {
  // Calculate running balance for display
  // Note: This logic assumes transactions are sorted by date descending.

  // Calculate total balance first to work backwards
  const totalBalance = transactions.reduce((acc, t) => {
    return acc + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  // We need to map balances reversely to display correct running balance
  const runningBalances: { [key: string]: number } = {};
  let tempBal = totalBalance;

  // Since transactions are Descending (Newest first), the first row balance = current total balance
  // Then we subtract/add backwards to find previous states.
  transactions.forEach(t => {
    runningBalances[t.id] = tempBal;
    if (t.type === 'income') {
      tempBal -= t.amount;
    } else {
      tempBal += t.amount;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  if (transactions.length === 0) {
    return <div style={{ color: 'hsl(var(--text-muted))', padding: '1rem', fontStyle: 'italic' }}>No transactions yet.</div>
  }

  return (
    <div className="table-responsive">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th className="hide-mobile">Cat.</th>
            <th className="text-right">Amount</th>
            <th className="text-right hide-mobile">Balance</th>
          </tr>
        </thead>
        <tbody>
          {transactions.slice(0, limit).map((t) => (
            <tr
              key={t.id}
              onClick={() => onRowClick && onRowClick(t)}
              className="transaction-row"
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              <td className="date-cell">
                {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </td>
              <td className="desc-cell">
                <div className="desc-text">{t.description}</div>
                <div className="payment-method">{t.paymentMethod}</div>
              </td>
              <td className="hide-mobile">
                <span className="category-tag-wrapper">
                  <span className="category-tag">{t.category}</span>
                  {overBudgetCategories?.has(t.category) && t.type === 'expense' && (
                    <span className="warning-icon" title="Over Budget">
                      <AlertTriangle size={14} />
                    </span>
                  )}
                </span>
              </td>
              <td className={`text-right amount ${t.type}`}>
                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
              </td>
              <td className="text-right balance hide-mobile">
                {formatCurrency(runningBalances[t.id] ?? 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        
        .transaction-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }

        .transaction-table th,
        .transaction-table td {
          padding: 1rem 0.5rem;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        
        .transaction-row:hover {
            background-color: hsl(var(--background));
        }

        .transaction-table th {
          font-weight: 600;
          color: hsl(var(--text-main)); /* Changed from muted to main for clarity */
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .date-cell {
          color: hsl(var(--text-muted));
          white-space: nowrap;
          font-size: 0.9rem;
        }

        .desc-text {
          font-weight: 500;
          color: hsl(var(--text-main)); /* Explicit high contrast color */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }

        .payment-method {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }

        .category-tag-wrapper {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .category-tag {
          background-color: rgba(124, 58, 237, 0.1); /* Subtle purple tint */
          color: hsl(var(--primary));
          border: 1px solid hsl(var(--primary));
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
          display: inline-block;
        }
        
        .warning-icon {
            color: hsl(var(--danger));
            display: flex;
            align-items: center;
        }

        .text-right {
          text-align: right;
        }

        .amount {
          font-weight: 600;
          white-space: nowrap;
        }

        .amount.income { color: hsl(var(--success)); }
        .amount.expense { color: hsl(var(--danger)); }

        .balance {
          color: hsl(var(--text-muted));
          white-space: nowrap;
        }

        @media (max-width: 640px) {
          .hide-mobile {
            display: none;
          }
          
          .transaction-table th, 
          .transaction-table td {
            padding: 0.75rem 0.25rem;
          }
           
           .desc-text {
             max-width: 100px;
           }
        }
      `}</style>
    </div>
  );
};
