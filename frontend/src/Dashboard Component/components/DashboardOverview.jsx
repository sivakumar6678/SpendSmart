import React from 'react';
import { Typography, Box, Paper, Grid } from '@mui/material';
import { Bar, Doughnut } from 'react-chartjs-2';

const DashboardOverview = ({ incomeData, expenseData }) => {
  // Process data for charts
  const aggregateIncomeByCategory = (incomeData) => {
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

  const aggregateExpensesByCategory = (expenseData) => {
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

  const incomeCategoryTotals = aggregateIncomeByCategory(incomeData);
  const expenseCategoryTotals = aggregateExpensesByCategory(expenseData);
  
  const incomeChartData = {
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
  
  const expenseChartData = {
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

  if (!incomeData || !expenseData) {
    return <Typography>Loading data...</Typography>;
  }

  return (
    <Box sx={{ width: { xs: '100%', md: '1500px' }, ml: { xs: 0, md: '-15%' }, pl: { xs: 0, md: '-10%' } }}>
      <Box>
        {/* Income Section */}
        <Typography variant="h4" gutterBottom>Income Overview</Typography>
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} className='dashboard_in_ex_table' sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeData.recentIncome.slice(0, 10).map((income, index) => (
                    <tr key={index}>
                      <td>{income.date}</td>
                      <td>{income.source}</td>
                      <td>{income.amount}</td>
                      <td>{income.paymentMethod}</td>
                      <td>{income.notes || 'No notes'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: '20px', height: '400px' }}>
              <Bar 
                data={incomeChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { 
                    title: { 
                      display: true, 
                      text: 'Income Distribution' 
                    } 
                  } 
                }} 
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Expense Section */}
        <Typography variant="h4" sx={{ marginTop: '40px' }}>Expenses Overview</Typography>
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} className='dashboard_in_ex_table' sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseData.recentExpenses.slice(0, 10).map((expense, index) => (
                    <tr key={index}>
                      <td>{expense.category}</td>
                      <td>{expense.amount}</td>
                      <td>{expense.date}</td>
                      <td>{expense.paymentMethod}</td>
                      <td>{expense.notes || 'No notes'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ 
              padding: '20px', 
              height: '400px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <Doughnut 
                data={expenseChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { 
                    title: { 
                      display: true, 
                      text: 'Expense Distribution' 
                    } 
                  } 
                }} 
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardOverview;