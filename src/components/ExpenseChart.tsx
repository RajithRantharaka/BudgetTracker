import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Transaction } from '../types';

interface ExpenseChartProps {
    transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ExpenseChart = ({ transactions }: ExpenseChartProps) => {
    // Aggregate expenses by category
    const data = transactions
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
        .sort((a, b) => b.value - a.value); // Sort by highest expense

    if (data.length === 0) {
        return (
            <div className="empty-chart">
                <p>No expense data to display.</p>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(value), 'Amount']}
                    />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
            </ResponsiveContainer>
            <style>{`
        .chart-container {
          width: 100%;
          height: 300px;
        }
        .empty-chart {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--text-muted));
        }
      `}</style>
        </div>
    );
};
