import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const EXPENSE_CATEGORIES = {
  food: 'Food & Dining',
  transport: 'Transportation',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  entertainment: 'Entertainment',
  healthcare: 'Healthcare',
  other: 'Other'
};

export function ExpenseCharts({ expenses, categoryTotals, formatCurrency }) {
  const processExpenseData = () => {
    if (!expenses || expenses.length === 0) {
      console.log('No expenses provided');
      return [];
    }

    // Debug the incoming expenses
    console.log('Processing expenses:', expenses.map(e => ({
      date: e.date,
      amount: e.amount,
      monthKey: e.date.slice(0, 7)
    })));

    const today = new Date();
    const months = [];
    
    // Get the earliest and latest dates from expenses
    const dates = expenses.map(e => new Date(e.date));
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));

    console.log('Date range:', {
      earliest: earliestDate.toISOString(),
      latest: latestDate.toISOString()
    });

    // Initialize months array based on actual expense date range
    for (let d = new Date(earliestDate); d <= latestDate; d.setMonth(d.getMonth() + 1)) {
      const monthKey = d.toISOString().slice(0, 7);
      months.push({
        key: monthKey,
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        amount: 0,
        expenses: [],
      });
    }

    console.log('Initialized months:', months);

    // Group expenses by month
    expenses.forEach(expense => {
      try {
        const monthKey = expense.date.slice(0, 7);
        const monthIndex = months.findIndex(m => m.key === monthKey);
        
        console.log('Processing expense:', {
          monthKey,
          monthIndex,
          amount: expense.amount,
          found: monthIndex !== -1
        });

        if (monthIndex !== -1) {
          months[monthIndex].amount += Number(expense.amount);
          months[monthIndex].expenses.push(expense);
        }
      } catch (error) {
        console.error('Error processing expense:', error);
      }
    });

    // Calculate running total
    let runningTotal = 0;
    const processedMonths = months.map(month => {
      runningTotal += month.amount;
      return {
        ...month,
        runningTotal
      };
    });

    console.log('Final processed months:', processedMonths);
    return processedMonths;
  };

  // Calculate month-over-month growth
  const calculateGrowth = (data) => {
    return data.map((month, index) => {
      if (index === 0) return 0;
      const previousMonth = data[index - 1].amount;
      if (previousMonth === 0) return 0;
      const growth = ((month.amount - previousMonth) / previousMonth) * 100;
      return Number(growth.toFixed(1));
    });
  };

  const monthlyData = processExpenseData();
  const growthData = calculateGrowth(monthlyData);
  const hasData = monthlyData.some(month => month.amount > 0);

  // Debug logs
  console.log('Raw Expenses:', expenses);
  console.log('Monthly Data:', monthlyData);
  console.log('Growth Data:', growthData);

  // Create chart data only if we have data
  const chartData = {
    labels: monthlyData.map(month => month.label),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: monthlyData.map(month => month.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y',
      },
      {
        label: 'Running Total',
        data: monthlyData.map(month => month.runningTotal),
        borderColor: 'rgb(16, 185, 129)',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
        yAxisID: 'y1',
      }
    ],
  };

  // Prepare category data
  const categoryData = {
    labels: Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([category]) => EXPENSE_CATEGORIES[category] || category),
    datasets: [
      {
        data: Object.entries(categoryTotals)
          .sort(([, a], [, b]) => b - a)
          .map(([, amount]) => amount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // blue
          'rgba(239, 68, 68, 0.8)',   // red
          'rgba(16, 185, 129, 0.8)',  // green
          'rgba(245, 158, 11, 0.8)',  // yellow
          'rgba(99, 102, 241, 0.8)',  // indigo
          'rgba(236, 72, 153, 0.8)',  // pink
          'rgba(139, 92, 246, 0.8)',  // purple
        ],
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const renderMonthDetails = (tooltipItems) => {
    const monthIndex = tooltipItems[0].dataIndex;
    const monthExpenses = monthlyData[monthIndex].expenses;
    if (monthExpenses.length === 0) return '';

    return [
      '',
      'Top Expenses:',
      ...monthExpenses
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)
        .map(exp => `${exp.description}: ${formatCurrency(exp.amount)}`)
    ];
  };

  return (
    <div className="space-y-6 sm:space-y-10 max-w-5xl mx-auto overflow-hidden">
      {/* Expense Trend Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-6">
          Expense Trend
        </h2>
        <div className="h-[220px] sm:h-[300px] lg:h-[450px] relative">
          {!hasData ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          ) : (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: window.innerWidth < 640 ? 'bottom' : 'top',
                    align: 'start',
                    labels: {
                      boxWidth: window.innerWidth < 640 ? 12 : 20,
                      padding: window.innerWidth < 640 ? 8 : 15,
                      font: {
                        size: window.innerWidth < 640 ? 10 : 12
                      }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: window.innerWidth < 640 ? 8 : 12,
                    titleFont: {
                      size: window.innerWidth < 640 ? 12 : 14,
                      weight: 'bold',
                    },
                    bodyFont: {
                      size: window.innerWidth < 640 ? 11 : 13,
                    },
                    displayColors: window.innerWidth >= 640,
                    callbacks: {
                      label: (context) => {
                        const label = context.dataset.label;
                        const value = context.raw;
                        const growth = growthData[context.dataIndex];
                        
                        if (label === 'Monthly Expenses' && context.dataIndex > 0) {
                          return [
                            `${label}: ${formatCurrency(value)}`,
                            `Growth: ${growth.toFixed(1)}%`
                          ];
                        }
                        return `${label}: ${formatCurrency(value)}`;
                      },
                      afterBody: renderMonthDetails,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      maxRotation: window.innerWidth < 640 ? 90 : 45,
                      minRotation: window.innerWidth < 640 ? 90 : 45,
                      font: {
                        size: window.innerWidth < 640 ? 8 : 12
                      },
                      maxTicksLimit: window.innerWidth < 640 ? 6 : 12
                    }
                  },
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => {
                        if (window.innerWidth < 640) {
                          // Shorter format for mobile
                          return formatCurrency(value).replace(/\.00$/, '');
                        }
                        return formatCurrency(value);
                      },
                      font: { size: window.innerWidth < 640 ? 10 : 12 },
                      maxTicksLimit: window.innerWidth < 640 ? 5 : 8
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                    title: {
                      display: window.innerWidth >= 640,
                      text: 'Monthly Amount'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: window.innerWidth >= 640, // Hide on mobile
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      callback: (value) => formatCurrency(value),
                      font: { size: window.innerWidth < 640 ? 10 : 12 },
                      maxTicksLimit: window.innerWidth < 640 ? 5 : 8
                    },
                    title: {
                      display: window.innerWidth >= 640,
                      text: 'Running Total'
                    }
                  },
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Analytics Grid - Improved layout for desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        {/* Category Distribution Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-6">Category Distribution</h2>
          <div className="h-[220px] sm:h-[300px] relative">
            {total === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                No expense data available
              </div>
            ) : (
              <Doughnut
                data={categoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: window.innerWidth < 640 ? 'bottom' : 'right',
                      align: 'center',
                      labels: {
                        boxWidth: 20,
                        padding: window.innerWidth < 640 ? 10 : 15,
                        font: {
                          size: window.innerWidth < 640 ? 11 : 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        weight: 'bold',
                      },
                      bodyFont: {
                        size: 13,
                      },
                      callbacks: {
                        label: (context) => {
                          const value = context.raw;
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${formatCurrency(value)} (${percentage}%)`;
                        },
                      },
                    },
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Category List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-6">Category Breakdown</h2>
          <div className="space-y-2 max-h-[220px] sm:max-h-[300px] overflow-y-auto pr-2">
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const percentage = ((amount / total) * 100).toFixed(1);
                return (
                  <div key={category} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base text-gray-900 truncate">
                          {EXPENSE_CATEGORIES[category]?.name || category}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {percentage}% of total
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-gray-900 ml-4">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 