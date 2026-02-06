import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { SummaryCards } from '../components/SummaryCards';
import { ExpenseChart } from '../components/ExpenseChart';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionService } from '../services/supabaseTransactionService';
import { useAuth } from '../context/AuthContext';
import type { DashboardSummary, Transaction } from '../types';

export const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary>({
    totalIncome: 0,
    totalExpense: 0,
    currentBalance: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const loadData = async () => {
    if (!user) return;
    setIsLoadingData(true);
    const txs = await TransactionService.getAll();
    setTransactions(txs);
    setSummary(TransactionService.getSummaryFromTransactions(txs));
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleAddTransaction = async (newTx: any) => {
    if (user) {
      await TransactionService.add(newTx, user.id);
      loadData();
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <MainLayout>
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button className="primary-button" onClick={() => setIsModalOpen(true)}>
          + Add Transaction
        </button>
      </div>

      <SummaryCards summary={summary} />

      <div className="dashboard-content">
        <div className="chart-section card">
          <h3>Expense Breakdown</h3>
          <div className="chart-wrapper">
            <ExpenseChart transactions={transactions} />
          </div>
        </div>

        <div className="recent-transactions card">
          <h3>Recent Transactions</h3>
          {isLoadingData ? (
            <p>Loading transactions...</p>
          ) : (
            <TransactionTable transactions={transactions} limit={10} />
          )}
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddTransaction}
      />

      <style>{`
        .loading-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            color: hsl(var(--text-muted));
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .primary-button {
          background-color: hsl(var(--primary));
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .primary-button:hover {
          background-color: hsl(var(--primary-dark));
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background: hsl(var(--surface));
          padding: 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .card h3 {
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .chart-wrapper {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </MainLayout>
  );
};
