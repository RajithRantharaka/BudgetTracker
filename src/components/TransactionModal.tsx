import { useState, useEffect } from 'react';
import { X, Calendar, Tag, CreditCard, FileText, CheckCircle, ArrowRightLeft } from 'lucide-react';
import type { TransactionType, Transaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { AccountService } from '../services/accountService';
import type { Account } from '../services/accountService';
import { useAuth } from '../context/AuthContext';
import { TransactionService } from '../services/supabaseTransactionService';
import { CurrencyInput } from './CurrencyInput';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  onDelete?: (id: string) => void;
  transaction?: Transaction | null;
}

export const TransactionModal = ({ isOpen, onClose, onSave, onDelete, transaction }: TransactionModalProps) => {
  const { user } = useAuth();

  // Mode: 'transaction' or 'transfer'
  const [mode, setMode] = useState<'transaction' | 'transfer'>('transaction');

  // Transaction State
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState(''); // New state for custom input
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Account Selection
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(''); // For normal transaction

  // Transfer State
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadAccounts();

      if (transaction) {
        setMode('transaction');
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setDescription(transaction.description);

        // Check if category is in standard list
        const allStandard = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
        if (allStandard.includes(transaction.category)) {
          setCategory(transaction.category);
          setIsCustomCategory(false);
          setCustomCategory('');
        } else {
          setCategory('Other');
          setIsCustomCategory(true);
          setCustomCategory(transaction.category);
        }

        setSelectedAccount(transaction.paymentMethod);
        setDate(new Date(transaction.date).toISOString().split('T')[0]);
      } else {
        // Reset
        setMode('transaction');
        setType('expense');
        setAmount('');
        setDescription('');
        setCategory('');
        setCustomCategory('');
        setIsCustomCategory(false);
        setSelectedAccount('');
        setFromAccount('');
        setToAccount('');
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, transaction, user]);

  const loadAccounts = async () => {
    if (!user) return;
    await AccountService.seedDefaults(user.id);
    const data = await AccountService.getAll();
    setAccounts(data);
    if (data.length > 0) {
      setSelectedAccount(prev => prev || data[0].name);
      setFromAccount(prev => prev || data[0].name);
      if (data.length > 1) {
        setToAccount(prev => prev || data[1].name);
      }
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Other') {
      setCategory('Other');
      setIsCustomCategory(true);
    } else {
      setCategory(val);
      setIsCustomCategory(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'transfer') {
      if (!fromAccount || !toAccount || fromAccount === toAccount) {
        alert('Please select different source and destination accounts.');
        return;
      }

      await TransactionService.add({
        type: 'expense',
        amount: parseFloat(amount),
        description: `Transfer to ${toAccount}: ${description}`,
        category: 'Transfer',
        paymentMethod: fromAccount,
        date
      }, user!.id);

      await TransactionService.add({
        type: 'income',
        amount: parseFloat(amount),
        description: `Transfer from ${fromAccount}: ${description}`,
        category: 'Transfer',
        paymentMethod: toAccount,
        date
      }, user!.id);

      onClose();
      onSave(null);

    } else {
      // Normal Save
      const finalCategory = isCustomCategory ? customCategory : category;
      if (!finalCategory) {
        alert("Please select or enter a category.");
        return;
      }

      onSave({
        type,
        amount: parseFloat(amount),
        description,
        category: finalCategory,
        paymentMethod: selectedAccount,
        date,
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className={`modal-content ${mode === 'transfer' ? 'transfer' : type}`}>
        <div className="modal-header">
          <div className="header-title">
            <h3>{transaction ? 'Edit Transaction' : (mode === 'transfer' ? 'Transfer Funds' : 'New Transaction')}</h3>
            {!transaction && (
              <div className="mode-switcher">
                <button
                  type="button"
                  className={`switch-btn ${mode === 'transaction' ? 'active' : ''}`}
                  onClick={() => setMode('transaction')}
                >
                  Transaction
                </button>
                <button
                  type="button"
                  className={`switch-btn ${mode === 'transfer' ? 'active' : ''}`}
                  onClick={() => setMode('transfer')}
                >
                  Transfer
                </button>
              </div>
            )}
          </div>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">

          {mode === 'transaction' && (
            <div className="type-toggle-container">
              <div className="type-toggle-wrapper">
                <div
                  className={`toggle-slider ${type}`}
                  style={{ transform: type === 'income' ? 'translateX(0)' : 'translateX(100%)' }}
                />
                <button
                  type="button"
                  className={`toggle-option ${type === 'income' ? 'active' : ''}`}
                  onClick={() => setType('income')}
                >
                  Income
                </button>
                <button
                  type="button"
                  className={`toggle-option ${type === 'expense' ? 'active' : ''}`}
                  onClick={() => setType('expense')}
                >
                  Expense
                </button>
              </div>
            </div>
          )}

          <div className="input-grid">
            <div className="form-group full-width amount-group">
              <label>Amount</label>
              <div className="input-wrapper large-input">
                <span className="input-icon currency-symbol">Rs.</span>
                <CurrencyInput
                  value={amount}
                  onChange={(val) => setAmount(val)}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group half-width">
              <label>Date</label>
              <div className="input-wrapper">
                <Calendar size={18} className="input-icon" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {mode === 'transaction' ? (
              <div className="form-group half-width">
                <label>Account / Wallet</label>
                <div className="input-wrapper">
                  <CreditCard size={18} className="input-icon" />
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.name}>{acc.name} ({acc.type})</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <>
                <div className="form-group half-width">
                  <label>From Account</label>
                  <div className="input-wrapper">
                    <CreditCard size={18} className="input-icon" />
                    <select
                      value={fromAccount}
                      onChange={(e) => setFromAccount(e.target.value)}
                      required
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.name} disabled={acc.name === toAccount}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group half-width">
                  <label>To Account</label>
                  <div className="input-wrapper">
                    <ArrowRightLeft size={18} className="input-icon" />
                    <select
                      value={toAccount}
                      onChange={(e) => setToAccount(e.target.value)}
                      required
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.name} disabled={acc.name === fromAccount}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {mode === 'transaction' && (
              <div className="form-group full-width">
                <label>Category</label>
                <div className="input-wrapper">
                  <Tag size={18} className="input-icon" />
                  <select
                    value={category}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="" disabled>Select a Category</option>
                    {type === 'expense' ? (
                      EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    ) : (
                      INCOME_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    )}
                    <option value="Other">Other (Custom)</option>
                  </select>
                </div>
              </div>
            )}

            {mode === 'transaction' && isCustomCategory && (
              <div className="form-group full-width">
                <label>Custom Category Name</label>
                <div className="input-wrapper">
                  <Tag size={18} className="input-icon" />
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group full-width">
              <label>Description {mode === 'transfer' ? '(Optional)' : ''}</label>
              <div className="input-wrapper">
                <FileText size={18} className="input-icon" />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={mode === 'transfer' ? "e.g., Monthly Savings" : "What was this for?"}
                  required={mode === 'transaction'}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            {transaction && onDelete && (
              <button
                type="button"
                className="delete-btn"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this transaction?')) {
                    onDelete(transaction.id);
                  }
                }}
              >
                Delete
              </button>
            )}
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className={`save-btn ${mode === 'transfer' ? 'transfer' : type}`}>
              <CheckCircle size={18} />
              {mode === 'transfer' ? 'Transfer Funds' : (transaction ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
          padding: 1rem;
        }

        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          background: hsl(var(--surface));
          width: 100%;
          max-width: 480px;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(0);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          border: 1px solid var(--border);
          max-height: 90vh; /* Scrollable if too tall */
          overflow-y: auto;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .modal-header {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: linear-gradient(to right, rgba(var(--primary), 0.05), transparent);
          position: sticky;
          top: 0;
          z-index: 5;
          backdrop-filter: blur(5px);
        }

        .modal-content.income .modal-header {
          background: linear-gradient(to bottom, hsl(var(--success-light)), transparent);
        }
        
        .modal-content.expense .modal-header {
          background: linear-gradient(to bottom, hsl(var(--danger-light)), transparent);
        }
        
        .modal-content.transfer .modal-header {
            background: linear-gradient(to bottom, hsl(var(--primary-light)), transparent);
        }

        .header-title h3 {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        
        .mode-switcher {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .switch-btn {
            font-size: 0.8rem;
            padding: 0.25rem 0.75rem;
            border-radius: 99px;
            border: 1px solid var(--border);
            background: white;
            cursor: pointer;
            color: hsl(var(--text-muted));
        }
        
        .switch-btn.active {
            background: hsl(var(--primary));
            color: white;
            border-color: hsl(var(--primary));
        }

        .close-button {
          color: hsl(var(--text-muted));
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .close-button:hover {
          background-color: rgba(0,0,0,0.05);
          color: hsl(var(--text-main));
        }

        .modal-form {
          padding: 0 2rem 2rem;
        }

        /* Toggle Switch */
        .type-toggle-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }
        
        .type-toggle-wrapper {
          position: relative;
          display: flex;
          background-color: hsl(var(--background));
          border-radius: 999px;
          padding: 0.25rem;
          width: 100%;
          max-width: 300px;
          border: 1px solid var(--border);
        }

        .toggle-slider {
          position: absolute;
          top: 4px;
          left: 4px;
          width: calc(50% - 4px);
          height: calc(100% - 8px);
          border-radius: 999px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
        }

        .toggle-slider.income { background-color: hsl(var(--success)); }
        .toggle-slider.expense { background-color: hsl(var(--danger)); }

        .toggle-option {
          flex: 1;
          position: relative;
          z-index: 1;
          background: none;
          border: none;
          padding: 0.6rem;
          font-weight: 600;
          color: hsl(var(--text-muted));
          transition: color 0.3s;
          text-align: center;
        }

        .toggle-option.active {
          color: white;
        }

        /* Inputs */
        .input-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
        }

        .full-width { width: 100%; }
        .half-width { width: calc(50% - 0.625rem); }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: hsl(var(--text-muted));
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: hsl(var(--text-muted));
          pointer-events: none;
        }

        .input-wrapper input,
        .input-wrapper select {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background-color: hsl(var(--background));
          transition: all 0.2s;
          font-size: 0.95rem;
          color: hsl(var(--text-main)); /* Explicit text color */
        }

        .input-wrapper input:focus,
        .input-wrapper select:focus {
          outline: none;
          background-color: hsl(var(--surface));
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary-light));
        }

        .large-input input {
          font-size: 1.5rem;
          font-weight: 600;
          padding-left: 3.5rem;
        }
        
        .currency-symbol {
          font-weight: 600;
          font-size: 1.2rem;
          color: hsl(var(--text-muted));
          left: 1rem;
        }

        /* Footer */
        .modal-footer {
          margin-top: 2rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }

        .cancel-btn {
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          color: hsl(var(--text-muted));
          border-radius: var(--radius);
        }

        .cancel-btn:hover {
          background-color: hsl(var(--background));
          color: hsl(var(--text-main));
        }
        
        .delete-btn {
            padding: 0.75rem 1.5rem;
            font-weight: 600;
            color: hsl(var(--danger));
            background: transparent;
            border: 1px solid hsl(var(--danger));
            border-radius: var(--radius);
            margin-right: auto;
        }
        
        .delete-btn:hover {
            background-color: hsl(var(--danger-light));
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          border-radius: var(--radius);
          font-weight: 600;
          color: white;
          transition: all 0.2s;
          box-shadow: var(--shadow-md);
        }

        .save-btn.income {
          background-color: hsl(var(--success));
        }
        
        .save-btn.income:hover {
          background-color: hsl(150, 60%, 35%); /* Darker Emerald */
          transform: translateY(-1px);
        }

        .save-btn.expense {
          background-color: hsl(var(--danger));
        }

        .save-btn.expense:hover {
          background-color: hsl(340, 70%, 45%); /* Darker Rose */
          transform: translateY(-1px);
        }
        
        .save-btn.transfer {
            background-color: hsl(var(--primary));
        }

        @media (max-width: 640px) {
          .half-width { width: 100%; }
          .modal-content {
            margin: 0;
            border-radius: 20px 20px 0 0;
            max-height: 90vh;
            position: absolute;
            bottom: 0;
            animation: slideUpMobile 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
           @keyframes slideUpMobile {
            from { transform: translateY(100%); opacity: 1; }
            to { transform: translateY(0); opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
};
