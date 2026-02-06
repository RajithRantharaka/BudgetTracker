import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Download, Filter, FileText, AlertTriangle } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { SummaryCards } from '../components/SummaryCards';
import { AnalyticsSection } from '../components/AnalyticsSection';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionService } from '../services/supabaseTransactionService';
import { BudgetService, type BudgetGoal } from '../services/budgetService';
import { useAuth } from '../context/AuthContext';
import { getCycleRange, formatCycleDisplay } from '../utils/dateHelpers';
import { exportToCsv } from '../utils/csvExport';
import { generateSummaryReport } from '../utils/reportGenerator';
import { ALL_CATEGORIES } from '../constants/categories';
import type { Transaction } from '../types';

const BudgetProgress = ({ transactions, goals }: { transactions: Transaction[], goals: BudgetGoal[] }) => {
  if (goals.length === 0) return null;

  return (
    <div className="card budget-progress-card">
      <div className="section-header">
        <h3>Budget Goals</h3>
      </div>
      <div className="goals-grid">
        {goals.map(goal => {
          // Calculate spent for this category in current month
          const spent = transactions
            .filter(t => t.type === 'expense' && t.category === goal.category)
            .reduce((sum, t) => sum + t.amount, 0);

          const progress = Math.min((spent / goal.amount_limit) * 100, 100);
          const isOver = spent > goal.amount_limit;
          const isNear = spent > goal.amount_limit * 0.85;

          return (
            <div key={goal.id} className="goal-item">
              <div className="goal-header">
                <span>{goal.category}</span>
                <span className={isOver ? 'text-danger flex-center' : ''}>
                  {isOver && <AlertTriangle size={14} style={{ marginRight: '4px' }} />}
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(spent)}
                  <span className="text-muted"> / {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(goal.amount_limit)}</span>
                </span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className={`progress-bar-fill ${isOver ? 'danger' : isNear ? 'warning' : 'success'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        .goals-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        .goal-item {
            margin-bottom: 0.5rem;
        }
        .goal-header {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        .progress-bar-bg {
            height: 8px;
            background: hsl(var(--background));
            border-radius: 99px;
            overflow: hidden;
            border: 1px solid var(--border);
        }
        .progress-bar-fill {
            height: 100%;
            border-radius: 99px;
            transition: width 0.5s ease;
        }
        .progress-bar-fill.success { background: hsl(var(--success)); }
        .progress-bar-fill.warning { background: #f59e0b; }
        .progress-bar-fill.danger { background: hsl(var(--danger)); }
        .text-danger { color: hsl(var(--danger)); }
        .flex-center { display: flex; align-items: center; }
        .text-muted { color: hsl(var(--text-muted)); font-weight: 400; }
        .budget-progress-card { margin-bottom: 2rem; }
      `}</style>
    </div>
  );
};

export const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Settings State
  const [startDay, setStartDay] = useState(1);

  useEffect(() => {
    if (user?.user_metadata?.start_day) {
      setStartDay(user.user_metadata.start_day);
    }
  }, [user]);

  // Filter State
  const [viewDate, setViewDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Data State
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Edit State
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const loadData = async () => {
    if (!user) return;
    setIsLoadingData(true);
    const [txs, goals] = await Promise.all([
      TransactionService.getAll(),
      BudgetService.getAll()
    ]);
    setAllTransactions(txs);
    setBudgetGoals(goals);
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // --- Derived State (Calculations) ---
  const { filteredTransactions, cycleSummary, range } = useMemo(() => {
    const { start, end } = getCycleRange(viewDate, startDay);

    const currentCycleTxs = allTransactions.filter(t => {
      const tDate = new Date(t.date);
      tDate.setHours(0, 0, 0, 0);

      const inDateRange = tDate >= start && tDate <= end;
      if (!inDateRange) return false;

      // Search Logic
      const matchesSearch = searchQuery === '' ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery);

      // Category Logic
      const matchesCategory = categoryFilter === '' || t.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    const pastTxs = allTransactions.filter(t => {
      const tDate = new Date(t.date);
      tDate.setHours(0, 0, 0, 0);
      return tDate < start;
    });

    const calculateNet = (txs: Transaction[]) =>
      txs.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

    const openingBalance = calculateNet(pastTxs);

    const income = currentCycleTxs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = currentCycleTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = openingBalance + income - expense;

    return {
      filteredTransactions: currentCycleTxs,
      range: { start, end },
      cycleSummary: {
        totalIncome: income,
        totalExpense: expense,
        currentBalance: currentBalance,
      }
    };
  }, [allTransactions, viewDate, startDay, searchQuery, categoryFilter]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewDate, startDay, searchQuery, categoryFilter]);

  const { paginatedTransactions, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return {
      paginatedTransactions: filteredTransactions.slice(start, end),
      totalPages: Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
    };
  }, [filteredTransactions, currentPage]);

  // Calculate Over Budget Categories
  const overBudgetCategories = useMemo(() => {
    const over = new Set<string>();
    if (budgetGoals.length === 0) return over;

    const spending: { [key: string]: number } = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });

    budgetGoals.forEach(goal => {
      if ((spending[goal.category] || 0) > goal.amount_limit) {
        over.add(goal.category);
      }
    });
    return over;
  }, [filteredTransactions, budgetGoals]);

  // --- Handlers ---

  const handleOpenAddModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (txData: any) => {
    if (user) {
      if (txData) {
        if (selectedTransaction) {
          await TransactionService.update(selectedTransaction.id, txData);
        } else {
          await TransactionService.add(txData, user.id);
        }
      }
      setIsModalOpen(false);
      loadData();
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      await TransactionService.delete(id);
      setIsModalOpen(false);
      loadData();
    }
  };

  const handlePrevMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setViewDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <MainLayout>
      <div className="dashboard-container">

        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Overview</h1>
            <p className="subtitle">Here's what's happening with your money.</p>
          </div>

          <div className="month-navigator">
            <button className="nav-btn" onClick={handlePrevMonth}><ChevronLeft size={20} /></button>
            <div className="date-display">
              <span className="current-cycle">{formatCycleDisplay(range.start, range.end)}</span>
            </div>
            <button className="nav-btn" onClick={handleNextMonth}><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards summary={cycleSummary} />

        {/* Budget Progress */}
        <BudgetProgress transactions={filteredTransactions} goals={budgetGoals} />

        {/* Analytics Section (Charts) */}
        <div className="section-title">
          <h3>Analytics</h3>
        </div>
        <AnalyticsSection transactions={filteredTransactions} />

        {/* Recent Transactions */}
        <div className="transactions-section card">
          <div className="section-header">
            <h3>Recent Transactions</h3>
            <div className="controls-row">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-box">
                <Filter size={18} className="filter-icon" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {ALL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button className="export-btn" onClick={() => generateSummaryReport({
                range: formatCycleDisplay(range.start, range.end),
                transactions: filteredTransactions,
                goals: budgetGoals,
                income: cycleSummary.totalIncome,
                expense: cycleSummary.totalExpense,
                balance: cycleSummary.currentBalance
              })}>
                <FileText size={18} /> <span>Report</span>
              </button>

              <button className="export-btn" onClick={() => exportToCsv(filteredTransactions, 'budget_export.csv')}>
                <Download size={18} /> <span>Export</span>
              </button>
            </div>
          </div>

          {isLoadingData ? (
            <p className="loading-text">Loading transactions...</p>
          ) : (
            <>
              <div className="table-container">
                <TransactionTable
                  transactions={paginatedTransactions}
                  limit={ITEMS_PER_PAGE}
                  onRowClick={handleRowClick}
                  overBudgetCategories={overBudgetCategories}
                />
              </div>

              {filteredTransactions.length === 0 && (
                <div className="empty-state">
                  <p>No transactions found for this period.</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button className="fab-button" onClick={handleOpenAddModal}>
        <span style={{ fontSize: '2rem', lineHeight: '1' }}>+</span>
      </button>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        transaction={selectedTransaction}
      />

      <style>{`
        .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .loading-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            color: hsl(var(--text-muted));
        }

        /* Header */
        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .header-left h1 {
            font-size: 1.75rem;
            margin-bottom: 0.25rem;
        }

        .subtitle {
            color: hsl(var(--text-muted));
        }

        .month-navigator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: hsl(var(--surface));
            padding: 0.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border);
        }

        .nav-btn {
            background: none;
            border: none;
            padding: 0.5rem;
            border-radius: var(--radius);
            cursor: pointer;
            color: hsl(var(--text-muted));
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .nav-btn:hover {
            background-color: hsl(var(--background));
            color: hsl(var(--primary));
        }

        .date-display {
            padding: 0 1rem;
            font-weight: 600;
            font-size: 0.95rem;
            white-space: nowrap;
            color: hsl(var(--text-main)); /* Explicitly set to main text color */
        }

        .section-title {
            margin: 2rem 0 1rem;
        }
        
        .section-title h3 {
            font-size: 1.1rem;
            color: hsl(var(--text-main));
            font-weight: 600;
        }

        /* Transactions Section */
        .transactions-section {
            margin-bottom: 5rem; /* Space for FAB */
        }

        .card {
          background: hsl(var(--surface));
          padding: 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        
        .section-header {
            margin-bottom: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .section-header h3 {
             font-size: 1.1rem;
             font-weight: 600;
             margin: 0;
        }

        .controls-row {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            flex-wrap: wrap;
        }

        .search-box, .filter-box {
            position: relative;
            width: 200px;
        }

        .search-icon, .filter-icon {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: hsl(var(--text-muted));
        }

        .search-box input, .filter-select {
            width: 100%;
            padding: 0.5rem 0.75rem 0.5rem 2.25rem;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            font-size: 0.9rem;
            background: hsl(var(--background));
            color: hsl(var(--text-main));
            height: 38px; /* Match height */
            appearance: none;
        }

        .export-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            background: hsl(var(--surface));
            color: hsl(var(--text-main));
            font-size: 0.9rem;
            font-weight: 500;
            white-space: nowrap;
            cursor: pointer;
            height: 38px;
        }

        .export-btn:hover {
            background: hsl(var(--background));
            border-color: hsl(var(--primary));
            color: hsl(var(--primary));
        }
        
        @media (max-width: 640px) {
            .section-header {
                flex-direction: column;
                align-items: flex-start;
            }
            .controls-row {
                width: 100%;
                justify-content: space-between;
            }
            .search-box, .filter-box {
                width: 48%;
            }
            .export-btn {
                width: 100%;
                justify-content: center;
            }
        }
        
        .table-container {
            width: 100%;
            overflow-x: auto;
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: hsl(var(--text-muted));
        }
        
        .loading-text {
            text-align: center;
            padding: 2rem;
            color: hsl(var(--text-muted));
        }

        /* FAB */
        .fab-button {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: hsl(var(--primary));
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(var(--primary), 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          transition: transform 0.2s;
          cursor: pointer;
        }

        .fab-button:active {
          transform: scale(0.95);
        }

        /* Pagination */
        .pagination-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border);
        }

        .page-btn {
            padding: 0.5rem 1rem;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            background: hsl(var(--surface));
            color: hsl(var(--text-main));
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
            background: hsl(var(--primary));
            color: white;
            border-color: hsl(var(--primary));
        }

        .page-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: hsl(var(--background));
        }

        .page-info {
            font-size: 0.9rem;
            color: hsl(var(--text-muted));
        }
      `}</style>
    </MainLayout>
  );
};
