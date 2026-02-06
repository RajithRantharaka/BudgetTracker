import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Calendar, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { TransactionService } from '../services/supabaseTransactionService';
import { BudgetService, type BudgetGoal } from '../services/budgetService';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CurrencyInput } from '../components/CurrencyInput';

export const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [startDay, setStartDay] = useState(1);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || '');
            setStartDay(user.user_metadata?.start_day || 1);
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const updates: any = {
                data: {
                    full_name: fullName,
                    start_day: startDay,
                }
            };

            if (newPassword) {
                updates.password = newPassword;
            }

            const { error } = await supabase.auth.updateUser(updates);

            if (error) {
                throw error;
            }

            setMessage('Profile updated successfully!');
            setNewPassword(''); // Clear password field for security
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAllTransactions = async () => {
        if (!user) return;
        if (window.confirm('ARE YOU SURE? This will permanently delete ALL your transaction history. This action cannot be undone.')) {
            try {
                setLoading(true);
                await TransactionService.deleteAll(user.id);
                setMessage('All transactions deleted successfully.');
            } catch (err: any) {
                setError('Failed to delete transactions.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <MainLayout>
            <div className="profile-container">
                <div className="back-link" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </div>

                <div className="profile-card">
                    <div className="profile-header">
                        <h2>User Profile</h2>
                        <p>Manage your account settings</p>
                    </div>

                    {message && <div className="success-message">{message}</div>}
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleUpdateProfile} className="profile-form">

                        <div className="form-section">
                            <h3>Personal Info</h3>
                            <div className="form-group">
                                <label>Full Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="text" value={user?.email} disabled className="disabled-input" />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Preferences</h3>
                            <div className="form-group">
                                <label>Billing Cycle Start Day</label>
                                <div className="input-wrapper">
                                    <Calendar size={18} className="input-icon" />
                                    <select
                                        value={startDay}
                                        onChange={(e) => setStartDay(Number(e.target.value))}
                                    >
                                        {[...Array(28)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <p className="hint">The day your monthly budget resets (e.g., Salary Day).</p>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Security</h3>
                            <div className="form-group">
                                <label>New Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Leave blank to keep current"
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        <BudgetSettings userId={user?.id} />

                        <div className="form-section">
                            <h3 className="text-danger">Danger Zone</h3>
                            <p className="hint" style={{ marginBottom: '1rem' }}>
                                Irreversible actions found here.
                            </p>
                            <button
                                type="button"
                                className="delete-all-btn"
                                onClick={handleDeleteAllTransactions}
                                disabled={loading}
                            >
                                <Trash2 size={18} />
                                Delete All Transactions
                            </button>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-button" disabled={loading}>
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            <style>{`
        .profile-container {
          max-width: 600px;
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
        }
        
        .back-link:hover {
          color: hsl(var(--primary));
        }

        .profile-card {
           background: hsl(var(--surface));
           border-radius: var(--radius);
           border: 1px solid var(--border);
           box-shadow: var(--shadow-sm);
           overflow: hidden;
        }

        .profile-header {
           padding: 2rem;
           background: linear-gradient(to right, rgba(var(--primary), 0.05), transparent);
           border-bottom: 1px solid var(--border);
        }

        .profile-header h2 {
           margin-bottom: 0.5rem;
        }

        .profile-form {
           padding: 2rem;
           padding-bottom: 1rem;
        }

        .form-section {
           margin-bottom: 2rem;
           padding-bottom: 2rem;
           border-bottom: 1px solid var(--border);
        }

        .form-section:last-child {
           border-bottom: none;
        }

        .form-section h3 {
           font-size: 1.1rem;
           margin-bottom: 1rem;
           color: hsl(var(--primary));
        }

        .form-group {
           margin-bottom: 1.25rem;
        }

        .form-group label {
           display: block;
           font-size: 0.9rem;
           font-weight: 500;
           color: hsl(var(--text-main)); /* Explicitly bright for dark mode */
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
        }

        .input-wrapper input,
        .input-wrapper select {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.75rem;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            background: hsl(var(--background));
            color: hsl(var(--text-main)); /* Ensure input text is bright */
        }
        
        .disabled-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            background: hsl(var(--background));
            opacity: 0.7;
            cursor: not-allowed;
        }

        .hint {
           font-size: 0.8rem;
           color: hsl(var(--text-muted));
           margin-top: 0.25rem;
        }

        .form-actions {
            margin-top: 1rem;
            display: flex;
            justify-content: flex-end;
        }

        .save-button {
           background-color: hsl(var(--primary));
           color: white;
           padding: 0.75rem 1.5rem;
           border-radius: var(--radius);
           font-weight: 600;
           display: flex;
           align-items: center;
           gap: 0.5rem;
        }
        
        .save-button:hover {
           background-color: hsl(var(--primary-dark));
        }
        
        .success-message {
            background-color: hsl(var(--success-light));
            color: hsl(var(--success));
            padding: 1rem;
            margin: 1rem 2rem 0;
            border-radius: var(--radius);
            text-align: center;
        }
        
        .error-message {
            background-color: hsl(var(--danger-light));
            color: hsl(var(--danger));
            padding: 1rem;
            margin: 1rem 2rem 0;
            border-radius: var(--radius);
            text-align: center;
        }

        .text-danger {
            color: hsl(var(--danger));
        }

        .delete-all-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            padding: 0.75rem;
            border: 1px solid hsl(var(--danger));
            color: hsl(var(--danger));
            background: rgba(var(--danger), 0.05);
            border-radius: var(--radius);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .delete-all-btn:hover {
            background: hsl(var(--danger));
            color: white;
        }
      `}</style>
        </MainLayout>
    );
};

const BudgetSettings = ({ userId }: { userId?: string }) => {
    const [goals, setGoals] = useState<BudgetGoal[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (userId) loadGoals();
    }, [userId]);

    const loadGoals = async () => {
        const data = await BudgetService.getAll();
        setGoals(data);
    };

    const handleSetLimit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !amount) return;

        setLoading(true);
        await BudgetService.setLimit(selectedCategory, Number(amount), userId);
        setAmount('');
        await loadGoals();
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Remove this limit?')) {
            await BudgetService.delete(id);
            loadGoals();
        }
    };

    return (
        <div className="form-section">
            <h3>Budget Goals 🎯</h3>
            <p className="hint" style={{ marginBottom: '1rem' }}>Set monthly spending limits for categories.</p>

            <div className="budget-list">
                {goals.map(g => (
                    <div key={g.id} className="budget-item">
                        <div className="budget-info">
                            <span className="b-cat">{g.category}</span>
                            <span className="b-limit">Limit: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(g.amount_limit)}</span>
                        </div>
                        <button type="button" onClick={() => handleDelete(g.id)} className="icon-btn">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="add-budget-row">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="budget-select"
                >
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <CurrencyInput
                    value={amount}
                    onChange={(val) => setAmount(val)}
                    placeholder="Amount"
                    className="budget-input"
                />
                <button type="button" onClick={handleSetLimit} disabled={loading} className="add-btn">
                    {loading ? '...' : <Save size={18} />}
                </button>
            </div>

            <style>{`
                .budget-list {
                    margin-bottom: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .budget-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: hsl(var(--background));
                    padding: 0.75rem;
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                }
                .b-cat { font-weight: 500; color: hsl(var(--text-main)); }
                .b-limit { font-size: 0.9rem; color: hsl(var(--text-muted)); margin-left: 0.5rem; }
                
                .add-budget-row {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap; /* Allow wrapping */
                }
                .budget-select, .budget-input {
                    padding: 0.5rem;
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                    background: hsl(var(--background));
                    color: hsl(var(--text-main));
                }
                .budget-select { flex: 2; }
                .budget-input { flex: 1; min-width: 80px; }
                .add-btn {
                    padding: 0.5rem 1rem;
                    background: hsl(var(--primary));
                    color: white;
                    border-radius: var(--radius);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .icon-btn {
                    color: hsl(var(--text-muted));
                    padding: 0.25rem;
                }
                .icon-btn:hover { color: hsl(var(--danger)); }
            `}</style>
        </div>);
};
