import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme
} from '@mui/material';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const DashboardOverview = ({ incomeData, expenseData }) => {
  const theme = useTheme();

  // Helper function to process data
  const aggregateData = (data, categoryKey, amountKey = 'amount') => {
    return (data || []).reduce((acc, item) => {
      const key = item[categoryKey];
      if (key) acc[key] = (acc[key] || 0) + item[amountKey];
      return acc;
    }, {});
  };

  const incomeCategories = aggregateData(incomeData?.recentIncome, 'source');
  const expenseCategories = aggregateData(expenseData?.recentExpenses, 'category');

  const chartColors = [
    '#2E3B55', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'
  ];

  const incomeChartData = {
    labels: Object.keys(incomeCategories),
    datasets: [{
      label: 'Income',
      data: Object.values(incomeCategories),
      backgroundColor: chartColors,
      borderRadius: 4,
    }],
  };

  const expenseChartData = {
    labels: Object.keys(expenseCategories),
    datasets: [{
      label: 'Expenses',
      data: Object.values(expenseCategories),
      backgroundColor: chartColors,
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  const RecentTransactionsTable = ({ data, type }) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(data || []).slice(0, 5).map((row, index) => (
            <TableRow key={index} hover>
              <TableCell>{row.date}</TableCell>
              <TableCell>
                <Chip
                  label={type === 'income' ? row.source : row.category}
                  size="small"
                  color={type === 'income' ? 'success' : 'primary'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: type === 'income' ? 'success.main' : 'error.main' }}>
                ₹{row.amount}
              </TableCell>
            </TableRow>
          ))}
          {(!data || data.length === 0) && (
            <TableRow>
              <TableCell colSpan={3} align="center">No recent transactions</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Grid container spacing={3}>
      {/* Stats Cards Row could go here if we calculated totals passed down */}

      {/* Income Section */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title="Income Overview" titleTypographyProps={{ variant: 'h6' }} />
          <CardContent>
            <Box height={300} mb={3}>
              <Bar data={incomeChartData} options={chartOptions} />
            </Box>
            <Typography variant="subtitle2" gutterBottom>Recent Income</Typography>
            <RecentTransactionsTable data={incomeData?.recentIncome} type="income" />
          </CardContent>
        </Card>
      </Grid>

      {/* Expense Section */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title="Expense Overview" titleTypographyProps={{ variant: 'h6' }} />
          <CardContent>
            <Box height={300} mb={3} display="flex" justifyContent="center">
              <Doughnut data={expenseChartData} options={chartOptions} />
            </Box>
            <Typography variant="subtitle2" gutterBottom>Recent Expenses</Typography>
            <RecentTransactionsTable data={expenseData?.recentExpenses} type="expense" />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardOverview;