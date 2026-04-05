import { User, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function RoleSwitcher() {
  const { state, dispatch } = useApp();
  const { role } = state;

  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-700">
      <button
        onClick={() => dispatch({ type: 'SET_ROLE', payload: 'viewer' })}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
          role === 'viewer'
            ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-600 dark:text-white'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
        }`}
      >
        <User className="h-4 w-4" />
        Viewer
      </button>
      <button
        onClick={() => dispatch({ type: 'SET_ROLE', payload: 'admin' })}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
          role === 'admin'
            ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-600 dark:text-white'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
        }`}
      >
        <Shield className="h-4 w-4" />
        Admin
      </button>
    </div>
  );
}

export function Header() {
  const { state, dispatch } = useApp();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M10 4v4" />
              <path d="M2 8h20" />
              <path d="M6 4v4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Finance Dashboard</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track your finances</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <RoleSwitcher />
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            {state.darkMode ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}