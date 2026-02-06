import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { TransactionService } from '../services/supabaseTransactionService';
import { BudgetService } from '../services/budgetService';
import { useAuth } from '../context/AuthContext';
import { getCycleRange } from '../utils/dateHelpers';

export const NotificationCenter = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<{ id: string, title: string, message: string, type: 'warning' | 'info' }[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const checkForNotifications = async () => {
        if (!user) return;

        // Fetch Data
        const [transactions, goals] = await Promise.all([
            TransactionService.getAll(),
            BudgetService.getAll()
        ]);

        // Calculate Budget Warnings
        const startDay = user.user_metadata?.start_day || 1;
        const now = new Date();
        const { start, end } = getCycleRange(now, startDay);

        const currentMonthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            tDate.setHours(0, 0, 0, 0);
            return tDate >= start && tDate <= end && t.type === 'expense';
        });

        const spending: { [key: string]: number } = {};
        currentMonthTransactions.forEach(t => {
            spending[t.category] = (spending[t.category] || 0) + t.amount;
        });

        const newNotifications: { id: string, title: string, message: string, type: 'warning' | 'info' }[] = [];

        goals.forEach(goal => {
            const spent = spending[goal.category] || 0;
            if (spent > goal.amount_limit) {
                newNotifications.push({
                    id: `over-${goal.id}`, // Stable ID
                    title: 'Budget Exceeded Warning',
                    message: `You have exceeded your ${goal.category} budget of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(goal.amount_limit)}. Current: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(spent)}`,
                    type: 'warning'
                });
            } else if (spent > goal.amount_limit * 0.85) {
                newNotifications.push({
                    id: `near-${goal.id}`,
                    title: 'Approaching Budget Limit',
                    message: `You are at ${Math.round((spent / goal.amount_limit) * 100)}% of your ${goal.category} budget.`,
                    type: 'info'
                });
            }
        });

        setNotifications(newNotifications);
        setUnreadCount(newNotifications.length);
    };

    // Check on mount and periodically? 
    // For now, just mount.
    useEffect(() => {
        checkForNotifications();

        // Listen for window focus to re-check (cheap validation)
        const onFocus = () => checkForNotifications();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [user]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="notification-center" ref={dropdownRef}>
            <button className="icon-button relative" onClick={toggleDropdown} title="Notifications">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notifs">
                                <CheckCircle size={48} className="text-muted" style={{ opacity: 0.2, margin: '1rem auto' }} />
                                <p>All caught up!</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`notification-item ${notif.type}`}>
                                    <div className="notif-icon">
                                        {notif.type === 'warning' ? <AlertTriangle size={16} /> : <Bell size={16} />}
                                    </div>
                                    <div className="notif-content">
                                        <div className="notif-title">{notif.title}</div>
                                        <div className="notif-message">{notif.message}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .notification-center {
                    position: relative;
                }
                
                .relative {
                    position: relative;
                }

                .badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: hsl(var(--danger));
                    color: white;
                    font-size: 0.7rem;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid hsl(var(--surface));
                    font-weight: 700;
                }

                .notification-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.5rem;
                    width: 320px;
                    max-width: 90vw; /* Responsive width */
                    background: hsl(var(--surface));
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    box-shadow: var(--shadow-lg);
                    z-index: 100;
                    overflow: hidden;
                    animation: slideDown 0.2s ease-out;
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dropdown-header {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border);
                    background: hsl(var(--background));
                }
                
                .dropdown-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .notification-list {
                    max-height: 400px;
                    overflow-y: auto;
                }

                .notification-item {
                    padding: 1rem;
                    display: flex;
                    gap: 0.75rem;
                    border-bottom: 1px solid var(--border);
                    transition: background 0.2s;
                }
                
                .notification-item:last-child {
                    border-bottom: none;
                }
                
                .notification-item:hover {
                    background: hsl(var(--background));
                }
                
                .notification-item.warning .notif-icon {
                    color: hsl(var(--danger));
                }
                
                .notification-item.info .notif-icon {
                    color: #f59e0b;
                }
                
                .notif-title {
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                
                .notif-message {
                    font-size: 0.85rem;
                    color: hsl(var(--text-muted));
                    line-height: 1.4;
                }
                
                .empty-notifs {
                    padding: 2rem;
                    text-align: center;
                    color: hsl(var(--text-muted));
                }

                @media (max-width: 640px) {
                    .notification-dropdown {
                        position: fixed;
                        top: 70px; /* Approx header height */
                        left: 50%;
                        transform: translateX(-50%);
                        width: 92vw;
                        max-width: 400px;
                        margin-top: 0;
                        right: auto;
                    }
                }
            `}</style>
        </div>
    );
};
