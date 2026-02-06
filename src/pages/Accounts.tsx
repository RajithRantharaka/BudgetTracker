import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Wallet, Building2, Smartphone, TrendingUp, PiggyBank, CreditCard, ArrowLeft } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { AccountService } from '../services/accountService';
import { TransactionService } from '../services/supabaseTransactionService';
import type { Account } from '../services/accountService';
import type { Transaction } from '../types';
import { useAuth } from '../context/AuthContext';

export const Accounts = () => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    // New Account Form
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<Account['type']>('Bank');

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        const [accData, txData] = await Promise.all([
            AccountService.getAll(),
            TransactionService.getAll()
        ]);
        setAccounts(accData);
        setTransactions(txData);
        setLoading(false);
    };

    // Calculate Balances
    const accountBalances = useMemo(() => {
        const balances: { [key: string]: number } = {};

        accounts.forEach(acc => {
            // Filter transactions for this account (by paymentMethod matches Account Name)
            const accTxs = transactions.filter(t => t.paymentMethod === acc.name);

            const income = accTxs
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = accTxs
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            balances[acc.id] = (acc.balance || 0) + income - expense;
        });

        return balances;
    }, [accounts, transactions]);

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newName) return;

        await AccountService.add({ name: newName, type: newType }, user.id);
        setIsAdding(false);
        setNewName('');
        setNewType('Bank');
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this account?')) {
            await AccountService.delete(id);
            loadData();
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Cash': return <Wallet size={24} />;
            case 'Bank': return <Building2 size={24} />;
            case 'Mobile Wallet': return <Smartphone size={24} />;
            case 'Investment': return <TrendingUp size={24} />;
            case 'Savings': return <PiggyBank size={24} />;
            default: return <CreditCard size={24} />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LKR',
        }).format(amount);
    };

    return (
        <MainLayout>
            <div className="accounts-container">
                <div className="back-link" onClick={() => window.location.hash = '#/dashboard'}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </div>

                <div className="header-actions">
                    <h2>Accounts & Wallets</h2>
                    <button className="add-btn" onClick={() => setIsAdding(!isAdding)}>
                        <Plus size={20} /> Add Account
                    </button>
                </div>

                {isAdding && (
                    <form onSubmit={handleAddAccount} className="add-account-form">
                        <input
                            type="text"
                            placeholder="Account Name (e.g., HDFC Salary)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                            autoFocus
                        />
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value as any)}
                        >
                            <option value="Bank">Bank</option>
                            <option value="Cash">Cash</option>
                            <option value="Savings">Savings</option>
                            <option value="Investment">Investment</option>
                            <option value="Mobile Wallet">Mobile Wallet</option>
                            <option value="Other">Other</option>
                        </select>
                        <button type="submit">Save</button>
                    </form>
                )}

                <div className="accounts-grid">
                    {accounts.map(acc => (
                        <div key={acc.id} className="account-card">
                            <div className={`icon-box ${acc.type.toLowerCase().replace(' ', '-')}`}>
                                {getIcon(acc.type)}
                            </div>
                            <div className="account-info">
                                <h3>{acc.name}</h3>
                                <div className="account-meta">
                                    <span className="account-type">{acc.type}</span>
                                    <span className={`account-balance ${accountBalances[acc.id] < 0 ? 'negative' : ''}`}>
                                        {formatCurrency(accountBalances[acc.id] || 0)}
                                    </span>
                                </div>
                            </div>
                            <button className="delete-btn" onClick={() => handleDelete(acc.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {!loading && accounts.length === 0 && (
                        <div className="empty-state">
                            <p>No accounts yet. Add one to track your money.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .accounts-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .back-link {
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                  margin-bottom: 1.5rem;
                  cursor: pointer;
                  color: hsl(var(--text-muted));
                  font-weight: 500;
                  width: fit-content;
                }
                
                .back-link:hover {
                  color: hsl(var(--primary));
                }
                
                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                
                .add-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: hsl(var(--primary));
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius);
                    font-weight: 500;
                    box-shadow: var(--shadow-sm);
                }
                
                .add-account-form {
                    background: hsl(var(--surface));
                    padding: 1.5rem;
                    border-radius: var(--radius);
                    margin-bottom: 2rem;
                    display: flex;
                    gap: 1rem;
                    border: 1px solid var(--border);
                    flex-wrap: wrap;
                }
                
                .add-account-form input,
                .add-account-form select {
                    flex: 1;
                    padding: 0.75rem;
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                    min-width: 200px;
                }
                
                .add-account-form button {
                    background: hsl(var(--primary));
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--radius);
                    font-weight: 600;
                }
                
                .accounts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1rem;
                }
                
                .account-card {
                    background: hsl(var(--surface));
                    padding: 1.5rem;
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    position: relative;
                }
                
                .icon-box {
                    padding: 1rem;
                    border-radius: 50%;
                    color: white;
                }
                
                .icon-box.bank { background: #3b82f6; } /* Blue */
                .icon-box.cash { background: #22c55e; } /* Green */
                .icon-box.savings { background: #a855f7; } /* Purple */
                .icon-box.investment { background: #f59e0b; } /* Orange */
                .icon-box.mobile-wallet { background: #ec4899; } /* Pink */
                .icon-box.other { background: #64748b; }
                
                .account-info {
                    flex: 1;
                }
                
                .account-info h3 {
                    font-size: 1.1rem;
                    margin-bottom: 0.25rem;
                }
                
                .account-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                
                .account-type {
                    font-size: 0.85rem;
                    color: hsl(var(--text-muted));
                    padding: 0.1rem 0.5rem;
                    background: hsl(var(--background));
                    border-radius: 99px;
                    display: inline-block;
                    width: fit-content;
                }
                
                .account-balance {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: hsl(var(--text-main));
                }
                
                .account-balance.negative {
                    color: hsl(var(--danger));
                }
                
                .delete-btn {
                    color: hsl(var(--text-muted));
                    padding: 0.5rem;
                    border-radius: 50%;
                }
                
                .delete-btn:hover {
                    background: hsl(var(--danger-light));
                    color: hsl(var(--danger));
                }
                
                .empty-state {
                    text-align: center;
                    color: hsl(var(--text-muted));
                    grid-column: 1 / -1;
                    padding: 2rem;
                }
            `}</style>
        </MainLayout>
    );
};
