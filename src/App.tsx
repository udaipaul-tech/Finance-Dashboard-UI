import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Plus,
  Eye,
  Settings,
  Moon,
  Sun,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Tag,
  ChevronDown,
  X,
  Check,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  TrendingUp as TrendingUpIcon,
} from 'lucide-react';

// Types
type TransactionType = 'income' | 'expense';
type UserRole = 'viewer' | 'admin';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
}

interface CategoryTotal {
  name: string;
  value: number;
  color: string;
}

// Mock data
const generateMockTransactions = (): Transaction[] => {
  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Rental'],
    expense: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education'],
  };

  const descriptions = {
    'Salary': ['Monthly salary deposit', 'Bi-weekly payroll', 'Base salary'],
    'Freelance': ['Web design project', 'Consulting fee', 'Development work'],
    'Investment': ['Dividend payment', 'Stock profit', 'Bond interest'],
    'Bonus': ['Performance bonus', 'Year-end bonus', 'Referral bonus'],
    'Rental': ['Rental income', 'Property lease'],
    'Food & Dining': ['Grocery store', 'Restaurant dinner', 'Coffee shop', 'Food delivery'],
    'Transportation': ['Gas station', 'Uber ride', 'Public transit', 'Car maintenance'],
    'Shopping': ['Amazon purchase', 'Clothing store', 'Electronics', 'Home goods'],
    'Entertainment': ['Netflix subscription', 'Movie tickets', 'Concert', 'Gym membership'],
    'Bills & Utilities': ['Electric bill', 'Internet', 'Phone plan', 'Rent payment'],
    'Healthcare': ['Pharmacy', 'Doctor visit', 'Dental care', 'Eye exam'],
    'Education': ['Online course', 'Book purchase', 'Tuition fee', 'Workshop'],
  };

  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const type = Math.random() > 0.3 ? 'expense' : 'income';
    const categoryList = type === 'income' ? categories.income : categories.expense;
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    const descList = descriptions[category as keyof typeof descriptions] || ['Transaction'];
    const description = descList[Math.floor(Math.random() * descList.length)];

    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));

    transactions.push({
      id: `tx-${i}`,
      date: date.toISOString().split('T')[0],
      description,
      category,
      type: type as TransactionType,
      amount: type === 'income'
        ? Math.floor(Math.random() * 3000) + 100
        : Math.floor(Math.random() * 200) + 10,
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [role, setRole] = useState<UserRole>('viewer');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'insights'>('overview');
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    category: '',
    type: 'expense' as TransactionType,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });

  // Load data from localStorage or generate mock data
  useEffect(() => {
    const savedTransactions = localStorage.getItem('finance-transactions');
    const savedRole = localStorage.getItem('finance-role') as UserRole;
    const savedDarkMode = localStorage.getItem('finance-darkmode');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      const mockData = generateMockTransactions();
      setTransactions(mockData);
      localStorage.setItem('finance-transactions', JSON.stringify(mockData));
    }

    if (savedRole) setRole(savedRole);
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('finance-transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance-role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('finance-darkmode', darkMode.toString());
  }, [darkMode]);

  // Derived values
  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return transactions.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  const categories = useMemo(() => {
    const catSet = new Set(transactions.map(tx => tx.category));
    return Array.from(catSet);
  }, [transactions]);

  // Chart data - balance trend over last 30 days
  const balanceTrendData = useMemo(() => {
    const last30Days = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTransactions = transactions.filter(tx => tx.date === dateStr);
      const dayIncome = dayTransactions.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
      const dayExpense = dayTransactions.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0);

      last30Days.push({
        date: dateStr.slice(5),
        income: dayIncome,
        expense: dayExpense,
        net: dayIncome - dayExpense,
      });
    }

    return last30Days;
  }, [transactions]);

  // Spending by category
  const spendingByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions.filter(tx => tx.type === 'expense').forEach(tx => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Monthly comparison
  const monthlyComparison = useMemo(() => {
    const monthly: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(tx => {
      const month = tx.date.slice(0, 7);
      if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
      if (tx.type === 'income') monthly[month].income += tx.amount;
      else monthly[month].expense += tx.amount;
    });

    return Object.entries(monthly)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        savings: data.income - data.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(tx => tx.category === filterCategory);
    }

    filtered = filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    return filtered;
  }, [transactions, searchTerm, filterType, filterCategory, sortBy, sortOrder]);

  // Insights
  const insights = useMemo(() => {
    const highestSpendingCategory = spendingByCategory[0]?.name || 'N/A';
    const highestSpendingAmount = spendingByCategory[0]?.value || 0;

    const monthlyData = monthlyComparison;
    const lastMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2];

    const monthlyChange = prevMonth && lastMonth
      ? ((lastMonth.expense - prevMonth.expense) / prevMonth.expense) * 100
      : 0;

    const avgDailySpending = totalExpenses / 90;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return {
      highestSpendingCategory,
      highestSpendingAmount,
      monthlyChange,
      avgDailySpending,
      savingsRate,
      totalTransactions: transactions.length,
    };
  }, [spendingByCategory, monthlyComparison, totalExpenses, totalIncome, transactions.length]);

  // Handlers
  const handleAddTransaction = () => {
    if (role !== 'admin') return;

    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      date: newTransaction.date,
      description: newTransaction.description,
      category: newTransaction.category,
      type: newTransaction.type,
      amount: newTransaction.amount,
    };

    setTransactions(prev => [transaction, ...prev]);
    setShowAddModal(false);
    setNewTransaction({
      description: '',
      category: '',
      type: 'expense',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeleteTransaction = (id: string) => {
    if (role !== 'admin') return;
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = filteredTransactions.map(tx =>
      [tx.date, tx.description, tx.category, tx.type, tx.amount].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const baseClasses = darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900';
  const cardClasses = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClasses = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputClasses = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  return (
    <div className={`min-h-screen ${baseClasses} transition-colors duration-300`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${cardClasses} border-b ${borderClasses} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">FinanceFlow</h1>
                <p className={`text-xs ${textMuted}`}>Smart Money Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Role Selector */}
              <div className="flex items-center gap-2">
                <span className={`text-sm ${textMuted}`}>Role:</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${inputClasses} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="viewer">👁️ Viewer</option>
                  <option value="admin">⚙️ Admin</option>
                </select>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className={`${cardClasses} border-b ${borderClasses}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'transactions', label: 'Transactions', icon: Clock },
              { id: 'insights', label: 'Insights', icon: TrendingUpIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : `border-transparent ${textMuted} hover:text-gray-700 dark:hover:text-gray-300`
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textMuted}`}>Total Balance</p>
                    <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-green-500 flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    +12.5%
                  </span>
                  <span className={textMuted}>vs last month</span>
                </div>
              </div>

              <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textMuted}`}>Total Income</p>
                    <p className="text-3xl font-bold mt-1 text-green-500">{formatCurrency(totalIncome)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-green-500 flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    +8.2%
                  </span>
                  <span className={textMuted}>vs last month</span>
                </div>
              </div>

              <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textMuted}`}>Total Expenses</p>
                    <p className="text-3xl font-bold mt-1 text-red-500">{formatCurrency(totalExpenses)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-red-500 flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4" />
                    -3.1%
                  </span>
                  <span className={textMuted}>vs last month</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Balance Trend */}
              <div className={`lg:col-span-2 ${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Balance Trend</h3>
                  <span className={`text-sm ${textMuted}`}>Last 30 days</span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={balanceTrendData}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                      <XAxis dataKey="date" stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                      <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                          border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={false}
                        fill="url(#incomeGradient)"
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={false}
                        fill="url(#expenseGradient)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className={`text-sm ${textMuted}`}>Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className={`text-sm ${textMuted}`}>Expenses</span>
                  </div>
                </div>
              </div>

              {/* Spending Breakdown */}
              <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Spending by Category</h3>
                  <PieChartIcon className={`w-5 h-5 ${textMuted}`} />
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {spendingByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                          border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
                  {spendingByCategory.slice(0, 5).map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className={textMuted}>{cat.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} hover:bg-opacity-100 transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.type === 'income'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className={`text-sm ${textMuted}`}>{tx.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <p className={`text-sm ${textMuted}`}>{tx.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className={`${cardClasses} rounded-2xl p-4 border ${borderClasses} shadow-sm`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`} />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                    className={`px-4 py-2.5 rounded-xl border ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`px-4 py-2.5 rounded-xl border ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [by, order] = e.target.value.split('-');
                      setSortBy(by as typeof sortBy);
                      setSortOrder(order as typeof sortOrder);
                    }}
                    className={`px-4 py-2.5 rounded-xl border ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="amount-desc">Amount (High → Low)</option>
                    <option value="amount-asc">Amount (Low → High)</option>
                  </select>
                  {role === 'admin' && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className={`${cardClasses} rounded-2xl border ${borderClasses} shadow-sm overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${textMuted}`}>Date</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${textMuted}`}>Description</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${textMuted}`}>Category</th>
                      <th className={`px-6 py-4 text-left text-sm font-semibold ${textMuted}`}>Type</th>
                      <th className={`px-6 py-4 text-right text-sm font-semibold ${textMuted}`}>Amount</th>
                      {role === 'admin' && (
                        <th className={`px-6 py-4 text-center text-sm font-semibold ${textMuted}`}>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={role === 'admin' ? 6 : 5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                              <Search className={`w-8 h-8 ${textMuted}`} />
                            </div>
                            <p className={textMuted}>No transactions found</p>
                            <p className={`text-sm ${textMuted}`}>Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id} className={`${darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className={`w-4 h-4 ${textMuted}`} />
                              <span>{tx.date}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">{tx.description}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Tag className={`w-4 h-4 ${textMuted}`} />
                              <span>{tx.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                tx.type === 'income'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              {tx.type === 'income' ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-semibold ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                          </td>
                          {role === 'admin' && (
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className={`px-6 py-4 border-t ${borderClasses}`}>
                <p className={`text-sm ${textMuted}`}>
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Key Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className={`text-sm ${textMuted}`}>Highest Spending</p>
                </div>
                <p className="text-xl font-bold">{insights.highestSpendingCategory}</p>
                <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(insights.highestSpendingAmount)}</p>
              </div>

              <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <TrendingUpIcon className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className={`text-sm ${textMuted}`}>Monthly Change</p>
                </div>
                <p className={`text-2xl font-bold ${insights.monthlyChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {insights.monthlyChange >= 0 ? '+' : ''}{insights.monthlyChange.toFixed(1)}%
                </p>
                <p className={`text-sm ${textMuted} mt-1`}>vs previous month</p>
              </div>

              <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className={`text-sm ${textMuted}`}>Avg Daily Spending</p>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(insights.avgDailySpending)}</p>
                <p className={`text-sm ${textMuted} mt-1`}>over last 90 days</p>
              </div>

              <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <p className={`text-sm ${textMuted}`}>Savings Rate</p>
                </div>
                <p className={`text-2xl font-bold ${insights.savingsRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {insights.savingsRate.toFixed(1)}%
                </p>
                <p className={`text-sm ${textMuted} mt-1`}>of income saved</p>
              </div>
            </div>

            {/* Monthly Comparison Chart */}
            <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
              <h3 className="text-lg font-semibold mb-6">Monthly Comparison</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                    <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="savings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className={`text-sm ${textMuted}`}>Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className={`text-sm ${textMuted}`}>Expenses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className={`text-sm ${textMuted}`}>Savings</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
              <h3 className="text-lg font-semibold mb-6">Spending Breakdown</h3>
              <div className="space-y-4">
                {spendingByCategory.map((cat) => {
                  const percentage = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatCurrency(cat.value)}</span>
                          <span className={`text-sm ${textMuted} ml-2`}>({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <p className={`text-sm ${textMuted} mb-2`}>Total Transactions</p>
                <p className="text-3xl font-bold">{insights.totalTransactions}</p>
              </div>
              <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <p className={`text-sm ${textMuted} mb-2`}>Net Savings</p>
                <p className={`text-3xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(totalIncome - totalExpenses)}
                </p>
              </div>
              <div className={`${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-sm`}>
                <p className={`text-sm ${textMuted} mb-2`}>Income to Expense Ratio</p>
                <p className="text-3xl font-bold">
                  {totalExpenses > 0 ? ((totalIncome / totalExpenses)).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className={`relative w-full max-w-md ${cardClasses} rounded-2xl p-6 border ${borderClasses} shadow-xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Add Transaction</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textMuted} mb-2`}>Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
                      newTransaction.type === 'expense'
                        ? 'bg-red-500 text-white'
                        : `${darkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:opacity-80`
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
                      newTransaction.type === 'income'
                        ? 'bg-green-500 text-white'
                        : `${darkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:opacity-80`
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textMuted} mb-2`}>Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="Enter description"
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textMuted} mb-2`}>Category</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textMuted} mb-2`}>Amount</label>
                <input
                  type="number"
                  value={newTransaction.amount || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                  placeholder="0.00"
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textMuted} mb-2`}>Date</label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2.5 rounded-xl font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTransaction}
                  disabled={!newTransaction.description || !newTransaction.category || !newTransaction.amount}
                  className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Indicator Banner */}
      <div className={`fixed bottom-4 left-4 ${cardClasses} rounded-xl px-4 py-2 border ${borderClasses} shadow-lg flex items-center gap-2 text-sm`}>
        {role === 'viewer' ? (
          <>
            <Eye className="w-4 h-4 text-blue-500" />
            <span className={textMuted}>Viewer Mode - Read Only</span>
          </>
        ) : (
          <>
            <Settings className="w-4 h-4 text-green-500" />
            <span className={textMuted}>Admin Mode - Full Access</span>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
