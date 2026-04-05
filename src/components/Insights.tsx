import { useMemo } from 'react';
import { TrendingUp, TrendingDown, PieChart, Calendar } from 'lucide-react';
import { useApp, categoryLabels, Category } from '../context/AppContext';

export function Insights() {
  const { state } = useApp();
  const { transactions } = state;

  const insights = useMemo(() => {
    // Highest spending category
    const spendingByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
      });

    const highestSpendingCategory = Object.entries(spendingByCategory)
      .sort(([, a], [, b]) => b - a)[0];

    // Monthly comparison
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expense += t.amount;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const currentMonth = sortedMonths[sortedMonths.length - 1];
    const previousMonth = sortedMonths[sortedMonths.length - 2];

    let monthlyComparison = null;
    if (currentMonth && previousMonth) {
      const currentExpense = monthlyData[currentMonth].expense;
      const previousExpense = monthlyData[previousMonth].expense;
      const diff = currentExpense - previousExpense;
      const percentChange = previousExpense > 0 ? (diff / previousExpense) * 100 : 0;
      monthlyComparison = {
        current: currentExpense,
        previous: previousExpense,
        diff,
        percentChange,
        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
      };
    }

    // Average daily spending
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const uniqueDates = new Set(transactions.map(t => t.date)).size;
    const avgDailySpending = uniqueDates > 0 ? totalExpenses / uniqueDates : 0;

    // Savings rate
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Transaction count
    const totalTransactions = transactions.length;

    return {
      highestSpendingCategory: highestSpendingCategory
        ? { category: highestSpendingCategory[0] as Category, amount: highestSpendingCategory[1] }
        : null,
      monthlyComparison,
      avgDailySpending,
      savingsRate,
      totalTransactions,
      totalIncome,
      totalExpenses,
    };
  }, [transactions]);

  const insightCards = [
    {
      icon: PieChart,
      label: 'Highest Spending Category',
      value: insights.highestSpendingCategory
        ? categoryLabels[insights.highestSpendingCategory.category]
        : 'N/A',
      subValue: insights.highestSpendingCategory
        ? `$${insights.highestSpendingCategory.amount.toFixed(2)}`
        : '',
      color: 'from-rose-500 to-orange-500',
    },
    {
      icon: Calendar,
      label: 'Monthly Expense Change',
      value: insights.monthlyComparison
        ? `${insights.monthlyComparison.direction === 'up' ? '+' : ''}${insights.monthlyComparison.percentChange.toFixed(1)}%`
        : 'N/A',
      subValue: insights.monthlyComparison
        ? `$${insights.monthlyComparison.current.toFixed(2)} vs $${insights.monthlyComparison.previous.toFixed(2)}`
        : '',
      color: insights.monthlyComparison && insights.monthlyComparison.direction === 'up'
        ? 'from-red-500 to-rose-600'
        : 'from-emerald-500 to-teal-600',
    },
    {
      icon: TrendingDown,
      label: 'Avg Daily Spending',
      value: `$${insights.avgDailySpending.toFixed(2)}`,
      subValue: 'per day',
      color: 'from-amber-500 to-yellow-600',
    },
    {
      icon: TrendingUp,
      label: 'Savings Rate',
      value: `${insights.savingsRate.toFixed(1)}%`,
      subValue: insights.savingsRate > 0 ? 'of income saved' : 'negative savings',
      color: insights.savingsRate >= 0
        ? 'from-emerald-500 to-teal-600'
        : 'from-red-500 to-rose-600',
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Financial Insights</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {insightCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl bg-gradient-to-br ${card.color} p-4 text-white`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">{card.label}</p>
                <p className="mt-1 text-2xl font-bold">{card.value}</p>
                <p className="mt-1 text-xs opacity-80">{card.subValue}</p>
              </div>
              <div className="rounded-full bg-white/20 p-2">
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50">
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Transactions</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{insights.totalTransactions}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Income / Expense</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ${insights.totalIncome.toFixed(0)} / ${insights.totalExpenses.toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
}