import { useMemo, useState } from 'react';
import { Search, ArrowUpDown, Trash2, Plus, X } from 'lucide-react';
import { useApp, Transaction, categoryLabels, categoryColors, Category, TransactionType } from '../context/AppContext';

export function TransactionsList() {
  const { state, dispatch } = useApp();
  const { transactions, filter, sort, role } = state;
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply type filter
    if (filter.type !== 'all') {
      result = result.filter(t => t.type === filter.type);
    }

    // Apply category filter
    if (filter.category !== 'all') {
      result = result.filter(t => t.category === filter.category);
    }

    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sort.field === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sort.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sort.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

    return result;
  }, [transactions, filter, sort]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    }
  };

  const handleSort = (field: 'date' | 'amount') => {
    dispatch({
      type: 'SET_SORT',
      payload: {
        field,
        direction: sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc',
      },
    });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Transactions</h3>
        
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={filter.search}
              onChange={(e) => dispatch({ type: 'SET_FILTER', payload: { search: e.target.value } })}
              className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filter.type}
            onChange={(e) => dispatch({ type: 'SET_FILTER', payload: { type: e.target.value as TransactionType | 'all' } })}
            className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-800 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category Filter */}
          <select
            value={filter.category}
            onChange={(e) => dispatch({ type: 'SET_FILTER', payload: { category: e.target.value as Category | 'all' } })}
            className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-800 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Add Button (Admin only) */}
          {role === 'admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="pb-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="pb-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Description</th>
              <th className="pb-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Category</th>
              <th className="pb-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
              <th className="pb-3 text-right text-sm font-medium text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Amount
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              {role === 'admin' && (
                <th className="pb-3 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={role === 'admin' ? 6 : 5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                >
                  <td className="py-3 text-sm text-slate-600 dark:text-slate-300">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 text-sm text-slate-800 dark:text-white">{transaction.description}</td>
                  <td className="py-3">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${categoryColors[transaction.category]}20`,
                        color: categoryColors[transaction.category],
                      }}
                    >
                      {categoryLabels[transaction.category]}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}
                    >
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </td>
                  <td className={`py-3 text-right text-sm font-medium ${
                    transaction.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </td>
                  {role === 'admin' && (
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'other' as Category,
    type: 'expense' as TransactionType,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      description: formData.description,
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Add Transaction</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="Enter description"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
}