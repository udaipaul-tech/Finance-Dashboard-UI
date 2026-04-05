# Finance Dashboard

A modern, interactive finance dashboard built with React, TypeScript, and Tailwind CSS. This project demonstrates frontend development skills including component design, state management, data visualization, and responsive UI implementation.

## Features

### 1. Dashboard Overview
- **Summary Cards**: Display Total Balance, Income, and Expenses with animated gradient cards
- **Balance Trend Chart**: Area chart showing balance over time using Recharts
- **Spending Breakdown**: Pie chart visualizing expense categories

### 2. Transactions Section
- Complete transaction list with Date, Description, Category, Type, and Amount
- **Filtering**: Filter by transaction type (income/expense) and category
- **Search**: Search transactions by description or category
- **Sorting**: Sort by date or amount (ascending/descending)
- **Admin Features**: Add and delete transactions (Admin role only)

### 3. Role-Based UI
- **Viewer Role**: Read-only access to view data
- **Admin Role**: Full access to add and delete transactions
- Easy role switching via toggle in the header

### 4. Insights Section
- Highest spending category with amount
- Monthly expense comparison (percentage change)
- Average daily spending
- Savings rate calculation
- Total transaction count

### 5. State Management
- React Context API with useReducer for global state
- Local storage persistence for transactions, role, and dark mode
- Proper state handling for filters, sorting, and role switching

### 6. UI/UX Features
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Export Functionality**: Download data as JSON or CSV
- **Empty State Handling**: Graceful handling when no data matches filters
- **Smooth Transitions**: Subtle animations for better UX

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context + useReducer

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
src/
├── App.tsx                 # Main application component
├── main.tsx                # Entry point
├── context/
│   └── AppContext.tsx      # Global state management
├── components/
│   ├── Header.tsx          # Navigation and role switcher
│   ├── Dashboard.tsx      # Summary cards and charts
│   ├── Transactions.tsx   # Transaction list with filters
│   └── Insights.tsx       # Financial insights
└── index.css               # Global styles
```

## Design Decisions

1. **Component Structure**: Modular components for maintainability
2. **State Management**: Context API chosen for simplicity and built-in React support
3. **Data Persistence**: LocalStorage for demo purposes (simulating backend)
4. **Charts**: Recharts for responsive, customizable visualizations
5. **Color Scheme**: Professional violet/indigo gradient with semantic colors for income (green) and expense (red)
6. **Responsiveness**: Mobile-first approach with breakpoints for larger screens

## Screenshots

The dashboard features:
- Gradient summary cards with icons
- Interactive area and pie charts
- Filterable transaction table with sorting
- Role-based action buttons
- Dark mode toggle
- Export dropdown menu

## Notes

- This is a frontend-only demonstration
- Mock data is pre-populated on first load
- Data persists in localStorage across sessions
- No actual backend integration required for demo