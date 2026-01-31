import { useState, useEffect } from 'react';
import { ExpenseCharts } from './components/ExpenseCharts.js';
import { TabView } from './components/TabView.js';
import { useCurrencyConverter } from './hooks/useCurrencyConverter.js';
import { EditExpenseModal } from './components/EditExpenseModal.js';
import { Logo } from './components/Logo.js';

// Move constants to a separate config file later
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Dining' },
  { id: 'transport', name: 'Transportation' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'bills', name: 'Bills & Utilities' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'other', name: 'Other' }
];

const TIME_PERIODS = [
  { id: 'all', name: 'All Time' },
  { id: 'week', name: 'Past Week' },
  { id: 'month', name: 'Past Month' },
  { id: 'year', name: 'Past Year' }
];

function App() {
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('currency');
    return savedCurrency ? JSON.parse(savedCurrency) : CURRENCIES[0];
  });
  const [previousCurrency, setPreviousCurrency] = useState(CURRENCIES[0]);
  const { convertAmount, loading } = useCurrencyConverter();
  const [editingExpense, setEditingExpense] = useState(null);

  // Save to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Save currency to localStorage
  useEffect(() => {
    localStorage.setItem('currency', JSON.stringify(currency));
  }, [currency]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    
    const newExpense = {
      id: Date.now(),
      description,
      amount: Number(amount),
      category,
      date: dateStr // Use consistent date format
    };

    console.log('Adding new expense:', newExpense);
    setExpenses(prev => {
      const updated = [...prev, newExpense];
      console.log('Updated expenses:', updated);
      return updated;
    });
    
    setDescription('');
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0].id);
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const getFilteredExpenses = () => {
    let filtered = [...expenses];

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }

    // Filter by date range
    const today = new Date();
    switch (dateRange) {
      case 'week':
        const weekAgo = new Date(today.setDate(today.getDate() - 7));
        filtered = filtered.filter(expense => new Date(expense.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
        filtered = filtered.filter(expense => new Date(expense.date) >= monthAgo);
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredExpenses = getFilteredExpenses();
  const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);

  // Add currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code
    }).format(amount);
  };

  // Enhanced statistics calculation
  const calculateStats = () => {
    const monthlyExpenses = {};
    const categoryTotals = {};
    let thisMonthTotal = 0;
    let lastMonthTotal = 0;
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1)).toISOString().slice(0, 7);
    
    // Initialize stats
    let highestExpense = { amount: 0, description: 'N/A' };
    let lowestExpense = { amount: Infinity, description: 'N/A' };
    
    expenses.forEach(expense => {
      // Monthly totals
      const monthYear = expense.date.substring(0, 7);
      monthlyExpenses[monthYear] = (monthlyExpenses[monthYear] || 0) + expense.amount;
      
      // Current and last month totals
      if (monthYear === currentMonth) thisMonthTotal += expense.amount;
      if (monthYear === lastMonth) lastMonthTotal += expense.amount;
      
      // Category totals
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;

      // Track highest and lowest expenses
      if (expense.amount > highestExpense.amount) {
        highestExpense = { amount: expense.amount, description: expense.description };
      }
      if (expense.amount < lowestExpense.amount) {
        lowestExpense = { amount: expense.amount, description: expense.description };
      }
    });

    // Calculate month-over-month change
    const monthlyChange = lastMonthTotal ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Calculate daily average for current month
    const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const dailyAverage = thisMonthTotal / daysInCurrentMonth;

    // Get most frequent category
    const mostFrequentCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      monthlyExpenses,
      categoryTotals,
      thisMonthTotal,
      lastMonthTotal,
      monthlyChange,
      dailyAverage,
      highestExpense,
      lowestExpense,
      mostFrequentCategory: mostFrequentCategory ? EXPENSE_CATEGORIES.find(cat => cat.id === mostFrequentCategory[0]) : null
    };
  };

  const stats = calculateStats();

  const tabs = [
    {
      label: "Analytics",
      content: (
        <div className="space-y-8 sm:space-y-12">
          {/* Charts */}
          <ExpenseCharts
            expenses={expenses}
            categoryTotals={stats.categoryTotals}
            formatCurrency={formatCurrency}
          />
          
          {/* Additional Analytics - Improved spacing for desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Top Expenses Card */}
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100 
                          transition-all duration-300 hover:shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                Top Expenses
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {filteredExpenses
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map(expense => (
                    <div key={expense.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 
                               transition-all duration-200 border border-gray-200">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base text-gray-900 truncate">
                            {expense.description}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {expense.date}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-gray-900 ml-4">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                {filteredExpenses.length === 0 && (
                  <EmptyState 
                    message="No expenses to show"
                  />
                )}
              </div>
            </div>

            {/* Insights Card */}
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100
                          transition-all duration-300 hover:shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                Insights
              </h2>
              <div className="space-y-4">
                {expenses.length > 0 ? (
                  <>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="font-medium text-sm sm:text-base text-blue-900">Monthly Average</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs sm:text-sm text-blue-700">
                          Your average monthly spending
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-blue-900">
                          {formatCurrency(stats.thisMonthTotal / 30)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="font-medium text-sm sm:text-base text-indigo-900">Top Category</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center">
                          <p className="text-xs sm:text-sm text-indigo-700">
                            {stats.mostFrequentCategory?.name || 'None'}
                          </p>
                        </div>
                        <p className="font-semibold text-sm sm:text-base text-indigo-900">
                          {formatCurrency(Object.values(stats.categoryTotals)[0] || 0)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="font-medium text-sm sm:text-base text-emerald-900">Monthly Change</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs sm:text-sm text-emerald-700">
                          {stats.monthlyChange >= 0 ? 'Increase' : 'Decrease'} from last month
                        </p>
                        <p className={`font-semibold text-sm sm:text-base ${stats.monthlyChange >= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {stats.monthlyChange.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="font-medium text-sm sm:text-base text-slate-900">Largest Expense</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs sm:text-sm text-slate-600 truncate max-w-[180px]">
                          {stats.highestExpense.description}
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-slate-900">
                          {formatCurrency(stats.highestExpense.amount)}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <EmptyState 
                    message="Add expenses to see insights"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      label: "Expenses List",
      content: (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onDelete={handleDelete}
              onEdit={setEditingExpense}
              formatCurrency={formatCurrency}
            />
          ))}
          {filteredExpenses.length === 0 && (
            <EmptyState
              message="No expenses found. Add some expenses to get started!"
            />
          )}
        </div>
      )
    },
    {
      label: "Summary",
      content: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Monthly Overview
              </h2>
              <div className="space-y-3">
                {Object.entries(stats.monthlyExpenses)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([month, amount]) => (
                    <div key={month} className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {new Date(month).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="font-semibold">{formatCurrency(amount)}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Statistics
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium">Highest Expense</span>
                    <span className="font-semibold text-rose-600">{formatCurrency(stats.highestExpense.amount)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{stats.highestExpense.description}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium">Lowest Expense</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(stats.lowestExpense.amount)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{stats.lowestExpense.description}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium">Average Expense</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(totalExpenses / (filteredExpenses.length || 1))}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Based on {filteredExpenses.length} expenses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Update the currency change handler
  const handleCurrencyChange = (newCurrency) => {
    const newCurrencyObj = CURRENCIES.find(c => c.code === newCurrency);
    if (!newCurrencyObj) return;

    try {
      // Convert all expenses to new currency
      const updatedExpenses = expenses.map(expense => {
        const convertedAmount = convertAmount(
          expense.amount,
          previousCurrency.code,
          newCurrencyObj.code
        );
        
        return {
          ...expense,
          amount: convertedAmount
        };
      });

      console.log('Currency conversion:', {
        from: previousCurrency.code,
        to: newCurrencyObj.code,
        sample: expenses[0]?.amount,
        converted: updatedExpenses[0]?.amount
      });

      setExpenses(updatedExpenses);
      setCurrency(newCurrencyObj);
      setPreviousCurrency(newCurrencyObj);
    } catch (error) {
      console.error('Currency conversion error:', error);
      // Optionally show an error message to the user
    }
  };

  const handleEdit = (updatedExpense) => {
    setExpenses(expenses.map(expense => 
      expense.id === updatedExpense.id ? updatedExpense : expense
    ));
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-8 overflow-hidden">
      {/* Navigation Bar - Professional glass effect */}
      <nav className="fixed top-0 left-0 right-0 backdrop-blur-lg bg-white/80 border-b border-gray-200/50 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            {/* App Title with Logo */}
            <div className="flex items-center space-x-3">
              <Logo size={40} />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Expense Tracker
              </h1>
            </div>

            {/* Currency Selector */}
            <div className="w-full sm:w-auto max-w-[220px]">
              {loading ? (
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span>Loading rates...</span>
                </div>
              ) : (
                <select
                  value={currency.code}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full bg-white text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium border border-gray-300 shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {CURRENCIES.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Container - Increased max width for desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-24">
        {/* Stats Grid - Professional stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Stat Cards */}
          <StatCard
            title="This Month"
            value={formatCurrency(stats.thisMonthTotal)}
            subtext={`${stats.monthlyChange >= 0 ? '↑' : '↓'} ${Math.abs(stats.monthlyChange).toFixed(1)}% vs last month`}
            color={stats.monthlyChange >= 0 ? 'red' : 'green'}
          />
          <StatCard
            title="Daily Average"
            value={formatCurrency(stats.dailyAverage)}
            subtext="This month"
            color="blue"
          />
          <StatCard
            title="Most Spent On"
            value={Object.entries(stats.categoryTotals)
              .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
            subtext="Top category"
            color="purple"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            subtext="All time"
            color="green"
          />
        </div>


        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-10 mb-10">
          {/* Left Column - Add Expense Form */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-7 lg:sticky lg:top-24 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">
                Add New Expense
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you spend on?"
                />
                <FormInput
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-white shadow-sm hover:border-gray-400 transition-all duration-200"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 
                           transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:ring-offset-2
                           text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Add Expense
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Tabbed View */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <FilterSelect
                  label="Category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  options={[
                    { id: 'all', name: 'All Categories' },
                    ...EXPENSE_CATEGORIES
                  ]}
                />
                <FilterSelect
                  label="Time Period"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  options={TIME_PERIODS}
                />
              </div>
            </div>

            {/* Tabbed Content */}
            <TabView tabs={tabs} />
          </div>
        </div>
      </div>

      {/* Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          categories={EXPENSE_CATEGORIES}
          onSave={handleEdit}
          onCancel={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}

// Updated component with responsive classes
function StatCard({ title, value, subtext, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-white',
    green: 'from-emerald-500 to-emerald-600 text-white',
    red: 'from-rose-500 to-rose-600 text-white',
    purple: 'from-purple-500 to-purple-600 text-white'
  };

  return (
    <div className={`rounded-2xl shadow-lg p-5 sm:p-6 bg-gradient-to-br ${colorClasses[color]} 
                    hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20`}>
      <div className="mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold opacity-95">{title}</h2>
      </div>
      <p className="text-2xl sm:text-3xl font-bold mb-2 break-words leading-tight">
        {value}
      </p>
      {subtext && (
        <p className="text-xs sm:text-sm opacity-90 font-medium">{subtext}</p>
      )}
    </div>
  );
}

// Updated form input component
function FormInput({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 text-sm sm:text-base transition-all duration-200 bg-white
                 hover:border-gray-400 shadow-sm"
      />
    </div>
  );
}

// Component for filter selects
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="w-full sm:flex-1">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 text-sm sm:text-base bg-white shadow-sm hover:border-gray-400 transition-all duration-200"
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// Component for expense items
function ExpenseItem({ expense, onDelete, onEdit, formatCurrency }) {
  const category = EXPENSE_CATEGORIES.find(cat => cat.id === expense.category) || EXPENSE_CATEGORIES[6];
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white rounded-xl 
                   hover:bg-blue-50 transition-all duration-200 space-y-3 sm:space-y-0 mb-3 sm:mb-4 
                   border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-800 text-sm sm:text-base">
          <span className="truncate">{expense.description}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
          <span className="font-medium">{expense.date}</span>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {category.name}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:space-x-3">
        <span className="text-base sm:text-lg font-semibold text-gray-800">
          {formatCurrency(expense.amount)}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(expense)}
            className="px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-300 hover:border-blue-400 transition duration-200"
            aria-label="Edit expense"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(expense.id)}
            className="px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-300 hover:border-rose-400 transition duration-200"
            aria-label="Delete expense"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Component for empty state
function EmptyState({ message }) {
  return (
    <div className="text-center py-8 sm:py-12 text-gray-500">
      <p className="text-sm sm:text-base font-medium">{message}</p>
    </div>
  );
}


export default App;
