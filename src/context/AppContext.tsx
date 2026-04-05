import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export type TransactionType = 'income' | 'expense';
export type Category = 'salary' | 'investment' | 'food' | 'transport' | 'shopping' | 'entertainment' | 'bills' | 'healthcare' | 'other';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: Category;
  type: TransactionType;
  description: string;
}

export type Role = 'viewer' | 'admin';

interface AppState {
  transactions: Transaction[];
  role: Role;
  darkMode: boolean;
  filter: {
    type: TransactionType | 'all';
    category: Category | 'all';
    search: string;
  };
  sort: {
    field: 'date' | 'amount';
    direction: 'asc' | 'desc';
  };
}

type Action =
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_FILTER'; payload: Partial<AppState['filter']> }
  | { type: 'SET_SORT'; payload: Partial<AppState['sort']> };

const initialState: AppState = {
  transactions: [],
  role: 'viewer',
  darkMode: false,
  filter: {
    type: 'all',
    category: 'all',
    search: '',
  },
  sort: {
    field: 'date',
    direction: 'desc',
  },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case 'SET_ROLE':
      return { ...state, role: action.payload };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, ...action.payload } };
    case 'SET_SORT':
      return { ...state, sort: { ...state.sort, ...action.payload } };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('financeDashboard');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.transactions) {
          dispatch({ type: 'SET_TRANSACTIONS', payload: parsed.transactions });
        }
        if (parsed.role) {
          dispatch({ type: 'SET_ROLE', payload: parsed.role });
        }
        if (parsed.darkMode !== undefined) {
          if (parsed.darkMode) {
            dispatch({ type: 'TOGGLE_DARK_MODE' });
          }
        }
      } catch (e) {
        console.error('Error loading saved state:', e);
      }
    } else {
      // Set default mock data
      dispatch({ type: 'SET_TRANSACTIONS', payload: mockTransactions });
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('financeDashboard', JSON.stringify({
      transactions: state.transactions,
      role: state.role,
      darkMode: state.darkMode,
    }));
  }, [state.transactions, state.role, state.darkMode]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Mock data
export const mockTransactions: Transaction[] = [
  { id: '1', date: '2026-03-28', amount: 5000, category: 'salary', type: 'income', description: 'Monthly Salary' },
  { id: '2', date: '2026-03-27', amount: 45.50, category: 'food', type: 'expense', description: 'Grocery Shopping' },
  { id: '3', date: '2026-03-26', amount: 1500, category: 'investment', type: 'income', description: 'Stock Dividends' },
  { id: '4', date: '2026-03-25', amount: 35, category: 'transport', type: 'expense', description: 'Gas Station' },
  { id: '5', date: '2026-03-24', amount: 89.99, category: 'shopping', type: 'expense', description: 'Online Purchase' },
  { id: '6', date: '2026-03-23', amount: 15, category: 'entertainment', type: 'expense', description: 'Movie Tickets' },
  { id: '7', date: '2026-03-22', amount: 120, category: 'bills', type: 'expense', description: 'Electric Bill' },
  { id: '8', date: '2026-03-21', amount: 2500, category: 'salary', type: 'income', description: 'Freelance Work' },
  { id: '9', date: '2026-03-20', amount: 65, category: 'healthcare', type: 'expense', description: 'Doctor Visit' },
  { id: '10', date: '2026-03-19', amount: 28.50, category: 'food', type: 'expense', description: 'Restaurant' },
  { id: '11', date: '2026-03-18', amount: 200, category: 'investment', type: 'income', description: 'Interest Income' },
  { id: '12', date: '2026-03-17', amount: 55, category: 'entertainment', type: 'expense', description: 'Concert' },
  { id: '13', date: '2026-03-16', amount: 180, category: 'bills', type: 'expense', description: 'Internet Bill' },
  { id: '14', date: '2026-03-15', amount: 5000, category: 'salary', type: 'income', description: 'Monthly Salary' },
  { id: '15', date: '2026-03-14', amount: 42, category: 'food', type: 'expense', description: 'Grocery Shopping' },
  { id: '16', date: '2026-03-13', amount: 75, category: 'shopping', type: 'expense', description: 'Clothing' },
  { id: '17', date: '2026-03-12', amount: 30, category: 'transport', type: 'expense', description: 'Uber Ride' },
  { id: '18', date: '2026-03-11', amount: 1000, category: 'investment', type: 'income', description: 'Crypto Gains' },
  { id: '19', date: '2026-03-10', amount: 85, category: 'healthcare', type: 'expense', description: 'Pharmacy' },
  { id: '20', date: '2026-03-09', amount: 22, category: 'food', type: 'expense', description: 'Coffee Shop' },
];

export const categoryLabels: Record<Category, string> = {
  salary: 'Salary',
  investment: 'Investment',
  food: 'Food & Dining',
  transport: 'Transport',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  bills: 'Bills & Utilities',
  healthcare: 'Healthcare',
  other: 'Other',
};

export const categoryColors: Record<Category, string> = {
  salary: '#22c55e',
  investment: '#8b5cf6',
  food: '#f97316',
  transport: '#06b6d4',
  shopping: '#ec4899',
  entertainment: '#eab308',
  bills: '#ef4444',
  healthcare: '#14b8a6',
  other: '#6b7280',
};