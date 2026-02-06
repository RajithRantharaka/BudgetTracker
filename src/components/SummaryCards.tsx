import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { DashboardSummary } from '../types';

interface SummaryCardsProps {
    summary: DashboardSummary;
}

export const SummaryCards = ({ summary }: SummaryCardsProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LKR', // Assuming LKR based on user name/context or default to USD. 
            // The user name "rajith.r" and timezone IST (+5:30) suggests Sri Lanka or India.
            // Sri Lanka uses LKR. India uses INR. 
            // I'll stick to a neutral formatting or configurable. 
            // I'll use simple number formatting for now or LKR as typically preferred in SL.
            // Just using "LKR" or symbol.
        }).format(amount);
    };

    return (
        <div className="summary-grid">
            <div className="summary-card income">
                <div className="card-icon">
                    <TrendingUp size={24} />
                </div>
                <div className="card-info">
                    <span className="card-label">Total Income</span>
                    <span className="card-value">{formatCurrency(summary.totalIncome)}</span>
                </div>
            </div>

            <div className="summary-card expense">
                <div className="card-icon">
                    <TrendingDown size={24} />
                </div>
                <div className="card-info">
                    <span className="card-label">Total Expenses</span>
                    <span className="card-value">{formatCurrency(summary.totalExpense)}</span>
                </div>
            </div>

            <div className="summary-card balance">
                <div className="card-icon">
                    <DollarSign size={24} />
                </div>
                <div className="card-info">
                    <span className="card-label">Remaining Balance</span>
                    <span className="card-value">{formatCurrency(summary.currentBalance)}</span>
                </div>
            </div>

            <style>{`
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: hsl(var(--surface));
          padding: 1.5rem;
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid var(--border);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .income .card-icon {
          background-color: hsl(var(--success-light));
          color: hsl(var(--success));
        }

        .expense .card-icon {
          background-color: hsl(var(--danger-light));
          color: hsl(var(--danger));
        }

        .balance .card-icon {
          background-color: hsl(var(--primary-light));
          color: hsl(var(--primary));
        }

        .card-info {
          display: flex;
          flex-direction: column;
        }

        .card-label {
          font-size: 0.875rem;
          color: hsl(var(--text-muted));
          font-weight: 500;
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: hsl(var(--text-main));
        }
      `}</style>
        </div>
    );
};
