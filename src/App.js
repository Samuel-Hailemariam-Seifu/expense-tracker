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
  { id: 'food', name: 'Food & Dining', icon: '🍽️' },
  { id: 'transport', name: 'Transportation', icon: '🚗' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'bills', name: 'Bills & Utilities', icon: '📱' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'other', name: 'Other', icon: '📦' }
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
      icon: "📊",
      content: (
        <div className="space-y-8 sm:space-y-12">
          {/* Charts */}
          <ExpenseCharts
            expenses={expenses}
            categoryTotals={stats.categoryTotals}
            formatCurrency={formatCurrency}
          />
          
          {/* Additional Analytics - Improved spacing for desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 max-w-5xl mx-auto">
            {/* Top Expenses Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 
                          transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-purple-500 mr-2">🔝</span>
                Top Expenses
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {filteredExpenses
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map(expense => (
                    <div key={expense.id} 
                      className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg hover:bg-blue-50/80 
                               transition-all duration-200 border border-gray-100">
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="text-lg sm:text-xl">
                          {EXPENSE_CATEGORIES.find(cat => cat.id === expense.category)?.icon || '📦'}
                        </span>
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
                    icon="📊" 
                  />
                )}
              </div>
            </div>

            {/* Insights Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100
                          transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-emerald-500 mr-2">💡</span>
                Insights
              </h2>
              <div className="space-y-4">
                {expenses.length > 0 ? (
                  <>
                    <div className="p-3 bg-blue-50/80 rounded-lg border border-blue-100">
                      <p className="font-medium text-sm sm:text-base text-blue-800">Monthly Average</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs sm:text-sm text-blue-600">
                          Your average monthly spending
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-blue-800">
                          {formatCurrency(stats.thisMonthTotal / 30)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-purple-50/80 rounded-lg border border-purple-100">
                      <p className="font-medium text-sm sm:text-base text-purple-800">Top Category</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center">
                          <span className="mr-1 text-lg">{stats.mostFrequentCategory?.icon}</span>
                          <p className="text-xs sm:text-sm text-purple-600">
                            {stats.mostFrequentCategory?.name || 'None'}
                          </p>
                        </div>
                        <p className="font-semibold text-sm sm:text-base text-purple-800">
                          {formatCurrency(Object.values(stats.categoryTotals)[0] || 0)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-100">
                      <p className="font-medium text-sm sm:text-base text-emerald-800">Monthly Change</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs sm:text-sm text-emerald-600">
                          {stats.monthlyChange >= 0 ? 'Increase' : 'Decrease'} from last month
                        </p>
                        <p className={`font-semibold text-sm sm:text-base ${stats.monthlyChange >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {stats.monthlyChange.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-100">
                      <p className="font-medium text-sm sm:text-base text-amber-800">Largest Expense</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs sm:text-sm text-amber-600 truncate max-w-[180px]">
                          {stats.highestExpense.description}
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-amber-800">
                          {formatCurrency(stats.highestExpense.amount)}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <EmptyState 
                    message="Add expenses to see insights" 
                    icon="💡" 
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
      icon: "📝",
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
              icon="🏷️"
            />
          )}
        </div>
      )
    },
    {
      label: "Summary",
      icon: "📋",
      content: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Overview</h2>
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
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Highest Expense</span>
                    <span className="font-semibold text-red-600">{formatCurrency(stats.highestExpense.amount)}</span>
                  </div>
                  <p className="text-sm text-gray-500">{stats.highestExpense.description}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Lowest Expense</span>
                    <span className="font-semibold text-green-600">{formatCurrency(stats.lowestExpense.amount)}</span>
                  </div>
                  <p className="text-sm text-gray-500">{stats.lowestExpense.description}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Average Expense</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(totalExpenses / (filteredExpenses.length || 1))}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Based on {filteredExpenses.length} expenses</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-4 sm:py-8 overflow-hidden">
      {/* Navigation Bar - Updated with glass effect */}
      <nav className="fixed top-0 left-0 right-0 backdrop-blur-md bg-gray-900/90 shadow-lg z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            {/* App Title with Logo */}
            <div className="flex items-center space-x-2">
              <Logo size={36} />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Expense Tracker</h1>
            </div>

            {/* Currency Selector */}
            <div className="w-full sm:w-auto max-w-[200px]">
              {loading ? (
                <span className="text-white text-sm">Loading rates...</span>
              ) : (
                <select
                  value={currency.code}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
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
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-24 sm:pt-20">
        {/* Stats Grid - Updated with glass effect cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
          {/* Stat Cards */}
          <StatCard
            title="This Month"
            value={formatCurrency(stats.thisMonthTotal)}
            subtext={`${stats.monthlyChange >= 0 ? '↑' : '↓'} ${Math.abs(stats.monthlyChange).toFixed(1)}% vs last month`}
            icon="📅"
            color={stats.monthlyChange >= 0 ? 'red' : 'green'}
          />
          <StatCard
            title="Daily Average"
            value={formatCurrency(stats.dailyAverage)}
            subtext="This month"
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Most Spent On"
            value={Object.entries(stats.categoryTotals)
              .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
            subtext="Top category"
            icon="🎯"
            color="purple"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            subtext="All time"
            icon="💰"
            color="green"
          />
        </div>


        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-10 mb-10">
          {/* Left Column - Add Expense Form */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Add New Expense</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you spend on?"
                  icon="📝"
                />
                <FormInput
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  icon="💰"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 
                           transition duration-200 ease-in-out focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center
                           text-sm sm:text-base"
                >
                  <span className="mr-2">💾</span>
                  Add Expense
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Tabbed View */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-10">
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
function StatCard({ title, value, subtext, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-white',
    green: 'from-emerald-500 to-emerald-600 text-white',
    red: 'from-rose-500 to-rose-600 text-white',
    purple: 'from-purple-500 to-purple-600 text-white'
  };

  return (
    <div className={`rounded-2xl shadow-xl p-4 sm:p-6 bg-gradient-to-br ${colorClasses[color]} 
                    hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
        <span className="text-xl sm:text-2xl opacity-90">{icon}</span>
      </div>
      <p className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 break-words">
        {value}
      </p>
      {subtext && (
        <p className="text-xs sm:text-sm opacity-80">{subtext}</p>
      )}
    </div>
  );
}

// Updated form input component
function FormInput({ label, type, value, onChange, placeholder, icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base sm:text-lg">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border border-gray-300 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                   text-sm sm:text-base"
        />
      </div>
    </div>
  );
}

// Component for filter selects
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="w-full sm:flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 sm:py-3 rounded-lg border border-gray-300 
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                 text-sm sm:text-base bg-white"
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.icon} {option.name}
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/90 rounded-xl 
                   hover:bg-blue-50 transition-all duration-200 space-y-2 sm:space-y-0 mb-3 sm:mb-4 
                   border border-gray-100 shadow-sm hover:shadow-md">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
          <span className="mr-2 flex-shrink-0">{category.icon}</span>
          <span className="truncate">{expense.description}</span>
        </p>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
          <span>{expense.date}</span>
          <span className="hidden sm:inline">•</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
            {category.name}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:space-x-3">
        <span className="text-base sm:text-lg font-semibold text-gray-800">
          {formatCurrency(expense.amount)}
        </span>
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => onEdit(expense)}
            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-full transition duration-200"
            aria-label="Edit expense"
          >
            <span className="text-lg sm:text-xl">✏️</span>
          </button>
          <button
            onClick={() => onDelete(expense.id)}
            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-full transition duration-200"
            aria-label="Delete expense"
          >
            <span className="text-lg sm:text-xl">🗑️</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Component for empty state
function EmptyState({ message, icon }) {
  return (
    <div className="text-center py-6 sm:py-8 text-gray-500">
      <span className="text-3xl sm:text-4xl block mb-3 sm:mb-4">{icon}</span>
      <p className="text-sm sm:text-base">{message}</p>
    </div>
  );
}

// New QuickActionButton component
function QuickActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full sm:w-auto space-x-2 px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 
                 rounded-lg transition duration-200 text-gray-700 text-xs sm:text-sm"
    >
      <span className="text-sm sm:text-lg">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

export default App;
