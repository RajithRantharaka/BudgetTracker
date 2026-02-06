import { useMemo } from 'react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    Legend
} from 'recharts';
import type { Transaction } from '../types';

interface AnalyticsSectionProps {
    transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b', '#4ecdc4'];
const INCOME_COLOR = '#10b981'; // Emerald 500
const EXPENSE_COLOR = '#ef4444'; // Red 500

export const AnalyticsSection = ({ transactions }: AnalyticsSectionProps) => {

    // 1. Expense by Category (Pie Chart)
    const categoryData = useMemo(() => {
        return transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, curr) => {
                const existing = acc.find(item => item.name === curr.category);
                if (existing) {
                    existing.value += curr.amount;
                } else {
                    acc.push({ name: curr.category, value: curr.amount });
                }
                return acc;
            }, [] as { name: string; value: number }[])
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    // 2. Daily Activity (Income vs Expense)
    const trendData = useMemo(() => {
        const dailyMap = new Map<string, { income: number; expense: number }>();

        transactions.forEach(t => {
            const dateKey = new Date(t.date).getDate().toString();
            const current = dailyMap.get(dateKey) || { income: 0, expense: 0 };

            if (t.type === 'income') {
                current.income += t.amount;
            } else {
                current.expense += t.amount;
            }
            dailyMap.set(dateKey, current);
        });

        // Limit to last 7 active days or showing relevant period
        return Array.from(dailyMap.entries())
            .map(([day, counts]) => ({ day, income: counts.income, expense: counts.expense }))
            .sort((a, b) => parseInt(a.day) - parseInt(b.day));
    }, [transactions]);

    // 3. Income vs Expense (Doughnut)
    const cashFlowData = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return [
            { name: 'Income', value: income, color: INCOME_COLOR },
            { name: 'Expense', value: expense, color: EXPENSE_COLOR }
        ];
    }, [transactions]);

    if (transactions.length === 0) {
        return (
            <div className="empty-analytics">
                <p>Add transactions to see analytics.</p>
            </div>
        );
    }

    // Helper for formatting currency
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(value);

    return (
        <div className="analytics-grid">
            {/* Card 1: Cash Flow Ratio */}
            <div className="chart-card">
                <h3>Cash Flow</h3>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={cashFlowData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {cashFlowData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                formatter={(value: any) => formatCurrency(Number(value))}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Card 2: Weekly Activity (Income vs Expense) */}
            <div className="chart-card">
                <h3>Weekly Activity</h3>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData} barGap={0}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: 12, fill: 'hsl(var(--text-muted))' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis hide />
                            <RechartsTooltip
                                cursor={{ fill: 'transparent' }}
                                formatter={(value: any, name: any) => [
                                    formatCurrency(Number(value)),
                                    name === 'income' ? 'Income' : 'Expense'
                                ]}
                                labelFormatter={(label) => `Day ${label}`}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--surface))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--text-main))'
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Bar
                                dataKey="income"
                                name="Income"
                                fill={INCOME_COLOR}
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                            <Bar
                                dataKey="expense"
                                name="Expense"
                                fill={EXPENSE_COLOR}
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Card 3: Category Breakdown (Full Width or Large) */}
            <div className="chart-card full-width-mobile">
                <h3>Top Expenses</h3>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                dataKey="value"
                            >
                                {categoryData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                formatter={(value: any) => formatCurrency(Number(value))}
                            />
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <style>{`
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-card {
          background: hsl(var(--surface));
          padding: 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .chart-card h3 {
          margin-bottom: 1rem;
          font-size: 1rem;
          color: hsl(var(--text-muted));
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .chart-container {
          height: 250px;
          width: 100%;
        }
        
        .empty-analytics {
            text-align: center;
            padding: 2rem;
            color: hsl(var(--text-muted));
            background: hsl(var(--surface));
            border-radius: var(--radius);
            border: 1px solid var(--border);
            margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
            .analytics-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
        </div>
    );
};
