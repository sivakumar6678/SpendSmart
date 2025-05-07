/**
 * Utility functions for data processing in the dashboard
 */

/**
 * Aggregates income data by category
 * @param {Object} incomeData - The income data object
 * @returns {Object} Aggregated income by category
 */
export const aggregateIncomeByCategory = (incomeData) => {
  const categories = [
    "Salary",
    "Freelance",
    "Investments",
    "Business",
    "Gift",
    "Bonus",
    "From Person",
    "Other"
  ];

  const categoryTotals = categories.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {});

  incomeData?.recentIncome.forEach((income) => {
    if (income.source && categoryTotals.hasOwnProperty(income.source)) {
      categoryTotals[income.source] += income.amount;
    }
  });

  return categoryTotals;
};

/**
 * Aggregates expense data by category
 * @param {Object} expenseData - The expense data object
 * @returns {Object} Aggregated expenses by category
 */
export const aggregateExpensesByCategory = (expenseData) => {
  const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Shopping",
    "Bills",
    "Health",
    "Education",
    "Others"
  ];

  const categoryTotals = categories.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {});

  expenseData?.recentExpenses.forEach((expense) => {
    if (expense.category && categoryTotals.hasOwnProperty(expense.category)) {
      categoryTotals[expense.category] += expense.amount;
    }
  });

  return categoryTotals;
};

/**
 * Creates chart data for income visualization
 * @param {Object} incomeCategoryTotals - Aggregated income by category
 * @returns {Object} Chart data for income
 */
export const createIncomeChartData = (incomeCategoryTotals) => {
  return {
    labels: Object.keys(incomeCategoryTotals),
    datasets: [
      {
        label: 'Total Income by Category',
        data: Object.values(incomeCategoryTotals),
        backgroundColor: [
          '#4caf50', '#ff9800', '#2196f3', '#9c27b0', '#ffeb3b', '#00bcd4', '#8bc34a', '#f44336',
        ],
        borderColor: [
          '#4caf50', '#ff9800', '#2196f3', '#9c27b0', '#ffeb3b', '#00bcd4', '#8bc34a', '#f44336',
        ],
        borderWidth: 1,
      },
    ],
  };
};

/**
 * Creates chart data for expense visualization
 * @param {Object} expenseCategoryTotals - Aggregated expenses by category
 * @returns {Object} Chart data for expenses
 */
export const createExpenseChartData = (expenseCategoryTotals) => {
  return {
    labels: Object.keys(expenseCategoryTotals),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(expenseCategoryTotals),
        backgroundColor: [
          '#ff5722', '#9e9e9e', '#3f51b5', '#e91e63', '#009688', '#c2185b', '#8bc34a', '#607d8b',
        ],
        borderColor: [
          '#ff5722', '#9e9e9e', '#3f51b5', '#e91e63', '#009688', '#c2185b', '#8bc34a', '#607d8b',
        ],
        borderWidth: 1,
      },
    ],
  };
};