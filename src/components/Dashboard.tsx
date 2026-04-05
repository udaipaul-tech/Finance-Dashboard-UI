import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useApp, categoryLabels, categoryColors, Category } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function SummaryCards() {
  const { state } = useApp();
  const { transactions } = state;

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, balance };
  }, [transactions]);

  const cards = [
    {
      label: 'Total Balance',
      value: stats.balance,
      icon: Wallet,
      color: 'from-violet-500 to-indigo-600',
      textColor: 'text-white',
    },
    {
      label: 'Total Income',
      value: stats.totalIncome,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-white',
    },
    {
      label: 'Total Expenses',
      value: stats.totalExpense,
      icon: TrendingDown,
      color: 'from-rose-500 to-orange-600',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-6 shadow-lg transition-transform hover:scale-[1.02] ${card.textColor}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">{card.label}</p>
              <p className="mt-2 text-3xl font-bold">${card.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BalanceTrendChart() {
  const { state } = useApp();
  const { transactions } = state;

  const chartData = useMemo(() => {
    const dailyData: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(t => {
      const date = t.date;
      if (!dailyData[date]) {
        dailyData[date] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dailyData[date].income += t.amount;
      } else {
        dailyData[date].expense += t.amount;
      }
    });

    const sortedDates = Object.keys(dailyData).sort();
    let runningBalance = 0;

    return sortedDates.map(date => {
      const d = dailyData[date];
      runningBalance += d.income - d.expense;
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: d.income,
        expense: d.expense,
        balance: runningBalance,
      };
    });
  }, [transactions]);

  const isDark = state.darkMode;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Balance Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis dataKey="date" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
            <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#balanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SpendingBreakdownChart() {
  const { state } = useApp();
  const { transactions } = state;

  const chartData = useMemo(() => {
    const categoryData: Record<string, number> = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
      });

    return Object.entries(categoryData)
      .map(([category, amount]) => ({
        name: categoryLabels[category as Category],
        value: amount,
        color: categoryColors[category as Category],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const isDark = state.darkMode;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Spending Breakdown</h3>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${Number(value).toFixed(2)}`}
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-700"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}