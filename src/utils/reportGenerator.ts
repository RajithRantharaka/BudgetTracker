import type { Transaction } from '../types';
import type { BudgetGoal } from '../services/budgetService';

interface ReportData {
    range: string;
    transactions: Transaction[];
    goals: BudgetGoal[];
    income: number;
    expense: number;
    balance: number;
}

export const generateSummaryReport = ({ range, transactions, goals, income, expense, balance }: ReportData) => {
    // 1. Calculate Category Breakdown
    const expenseByCategory: { [key: string]: number } = {};
    const incomeByCategory: { [key: string]: number } = {};

    transactions.forEach(t => {
        if (t.type === 'expense') {
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        } else {
            incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        }
    });

    const expenseCategories = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);

    // 2. Prepare HTML Content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Financial Report - ${range}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 2rem; max-width: 800px; margin: 0 auto; }
        h1 { color: #2563eb; margin-bottom: 0.5rem; }
        .subtitle { color: #666; font-size: 1.1rem; margin-bottom: 2rem; border-bottom: 2px solid #eee; padding-bottom: 1rem; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .card { background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
        .card h3 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .card .amount { font-size: 1.5rem; font-weight: 700; color: #0f172a; }
        .card .amount.income { color: #10b981; }
        .card .amount.expense { color: #ef4444; }
        
        h2 { font-size: 1.25rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 2rem; color: #334155; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.95rem; }
        th { text-align: left; padding: 0.75rem; background: #f1f5f9; color: #475569; font-weight: 600; }
        td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
        .text-right { text-align: right; }
        
        .progress-container { display: flex; align-items: center; gap: 1rem; }
        .progress-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; }
        
        .footer { margin-top: 4rem; text-align: center; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 2rem; }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Monthly Financial Report</h1>
      <div class="subtitle">Period: ${range}</div>
      
      <!-- Executive Summary -->
      <div class="summary-grid">
        <div class="card">
          <h3>Total Income</h3>
          <div class="amount income">+${income.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}</div>
        </div>
        <div class="card">
          <h3>Total Expense</h3>
          <div class="amount expense">-${expense.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}</div>
        </div>
        <div class="card">
          <h3>Net Balance</h3>
          <div class="amount" style="color: ${balance >= 0 ? '#10b981' : '#ef4444'}">
            ${balance.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
          </div>
        </div>
      </div>
      
      <!-- Budget Performance -->
      ${goals.length > 0 ? `
        <h2>Budget Performance</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Status</th>
              <th class="text-right">Used / Limit</th>
            </tr>
          </thead>
          <tbody>
            ${goals.map(g => {
        const spent = expenseByCategory[g.category] || 0;
        const pct = Math.min((spent / g.amount_limit) * 100, 100);
        const isOver = spent > g.amount_limit;
        const color = isOver ? '#ef4444' : (pct > 85 ? '#f59e0b' : '#10b981');
        return `
                <tr>
                  <td style="font-weight: 500;">${g.category}</td>
                  <td>
                    <div class="progress-container">
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${pct}%; background-color: ${color}"></div>
                      </div>
                      <span style="font-size: 0.85rem; color: ${color}; width: 45px;">${Math.round(pct)}%</span>
                    </div>
                  </td>
                  <td class="text-right">
                    ${spent.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })} 
                    <span style="color: #94a3b8">/ ${g.amount_limit.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}</span>
                  </td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
      ` : ''}
      
      <!-- Expense Breakdown -->
      <h2>Expense Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th class="text-right">Amount</th>
            <th class="text-right">% of Total</th>
          </tr>
        </thead>
        <tbody>
          ${expenseCategories.length > 0 ? expenseCategories.map(([cat, amt]) => {
        const pct = expense > 0 ? (amt / expense) * 100 : 0;
        return `
              <tr>
                <td>${cat}</td>
                <td class="text-right">${amt.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}</td>
                <td class="text-right">${pct.toFixed(1)}%</td>
              </tr>
            `;
    }).join('') : '<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 2rem;">No expenses this period.</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} • Budget Tracker App
      </div>

      <script>
        window.onload = () => {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

    // Open in new window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    } else {
        alert('Please allow popups to view the report.');
    }
};
