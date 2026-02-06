import { useState } from 'react';
import { X } from 'lucide-react';
import type { TransactionType, PaymentMethod } from '../types';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: any) => void;
}

export const TransactionModal = ({ isOpen, onClose, onSave }: TransactionModalProps) => {
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            type,
            amount: parseFloat(amount),
            description,
            category,
            paymentMethod,
            date,
        });
        // Reset form
        setAmount('');
        setDescription('');
        setCategory('');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add Transaction</h3>
                    <button onClick={onClose} className="close-button">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group type-selector">
                        <button
                            type="button"
                            className={`type-btn ${type === 'income' ? 'active income' : ''}`}
                            onClick={() => setType('income')}
                        >
                            Income
                        </button>
                        <button
                            type="button"
                            className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
                            onClick={() => setType('expense')}
                        >
                            Expense
                        </button>
                    </div>

                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Monthly Salary, Lunch"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Category</option>
                            {type === 'expense' ? (
                                <>
                                    <option value="Food">Food</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Bills">Bills</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Health">Health</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Other">Other</option>
                                </>
                            ) : (
                                <>
                                    <option value="Salary">Salary</option>
                                    <option value="Business">Business</option>
                                    <option value="Gift">Gift</option>
                                    <option value="Other">Other</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Online Banking">Online Banking</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
                        <button type="submit" className="save-button">Save Transaction</button>
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
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .modal-content {
          background: hsl(var(--surface));
          padding: 2rem;
          border-radius: var(--radius);
          width: 100%;
          max-width: 500px;
          box-shadow: var(--shadow-lg);
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .close-button {
          color: hsl(var(--text-muted));
        }

        .close-button:hover {
          color: hsl(var(--text-main));
        }

        .type-selector {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .type-btn {
          flex: 1;
          padding: 0.75rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          font-weight: 500;
          color: hsl(var(--text-muted));
        }

        .type-btn.active.income {
          background-color: hsl(var(--success-light));
          color: hsl(var(--success));
          border-color: hsl(var(--success));
        }

        .type-btn.active.expense {
          background-color: hsl(var(--danger-light));
          color: hsl(var(--danger));
          border-color: hsl(var(--danger));
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .cancel-button {
          padding: 0.75rem 1.5rem;
          color: hsl(var(--text-muted));
        }

        .save-button {
          background-color: hsl(var(--primary));
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          font-weight: 600;
        }

        .save-button:hover {
          background-color: hsl(var(--primary-dark));
        }
      `}</style>
        </div>
    );
};
