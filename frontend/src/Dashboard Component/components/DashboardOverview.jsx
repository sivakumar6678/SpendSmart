import React from 'react';
import { Typography, Box, Paper, Grid } from '@mui/material';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  aggregateIncomeByCategory, 
  aggregateExpensesByCategory,
  createIncomeChartData,
  createExpenseChartData
} from '../utils/dataUtils';

const DashboardOverview = ({ incomeData, expenseData }) => {
  // Process data for charts
  const incomeCategoryTotals = aggregateIncomeByCategory(incomeData);
  const expenseCategoryTotals = aggregateExpensesByCategory(expenseData);
  const incomeChartData = createIncomeChartData(incomeCategoryTotals);
  const expenseChartData = createExpenseChartData(expenseCategoryTotals);

  if (!incomeData || !expenseData) {
    return <Typography>Loading data...</Typography>;
  }

  return (
    <Box sx={{ width: '1500px', ml: '-15%', pl: '-10%' }}>
      <Box>
        {/* Income Section */}
        <Typography variant="h4" gutterBottom>Income Overview</Typography>
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} className='dashboard_in_ex_table'>
              <table>
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
            <Paper elevation={3} style={{ padding: '20px', height: '400px' }}>
              <Bar 
                data={incomeChartData} 
                options={{ 
                  responsive: true, 
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
        <Typography variant="h4" style={{ marginTop: '40px' }}>Expenses Overview</Typography>
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} className='dashboard_in_ex_table'>
              <table>
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
            <Paper elevation={3} style={{ padding: '20px', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut 
                data={expenseChartData} 
                options={{ 
                  responsive: true, 
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