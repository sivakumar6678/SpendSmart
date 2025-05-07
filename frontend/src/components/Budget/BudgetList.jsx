import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  LinearProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import BudgetForm from './BudgetForm';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

const BudgetList = () => {
  const { budgets, budgetAnalysis, deleteBudget } = useAppContext();
  const [openForm, setOpenForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setOpenForm(true);
  };

  const handleDelete = (budget) => {
    setBudgetToDelete(budget);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteBudget(budgetToDelete.id);
      setOpenDeleteDialog(false);
      setBudgetToDelete(null);
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleAddNew = () => {
    setSelectedBudget(null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedBudget(null);
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  // Filter budgets by selected month and year
  const filteredBudgets = budgets.filter(
    budget => budget.month === month && budget.year === year
  );

  // Get budget analysis for each budget
  const getBudgetAnalysis = (category) => {
    return budgetAnalysis.find(analysis => analysis.category === (category || 'Total'));
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Budget Planning
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add New Budget
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id="month-select-label">Month</InputLabel>
            <Select
              labelId="month-select-label"
              value={month}
              label="Month"
              onChange={handleMonthChange}
            >
              {months.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id="year-select-label">Year</InputLabel>
            <Select
              labelId="year-select-label"
              value={year}
              label="Year"
              onChange={handleYearChange}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {filteredBudgets.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No budgets found for {months.find(m => m.value === month)?.label} {year}.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{ mt: 2 }}
          >
            Create Your First Budget
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell align="right">Budgeted</TableCell>
                <TableCell align="right">Spent</TableCell>
                <TableCell align="right">Remaining</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBudgets.map((budget) => {
                const analysis = getBudgetAnalysis(budget.category);
                const spent = analysis?.spent || 0;
                const remaining = analysis?.remaining || budget.amount;
                const percentage = analysis?.percentage || 0;
                
                // Determine color based on percentage
                let progressColor = 'success';
                if (percentage >= 90) progressColor = 'error';
                else if (percentage >= 75) progressColor = 'warning';
                
                return (
                  <TableRow key={budget.id}>
                    <TableCell>{budget.category || 'Total Budget'}</TableCell>
                    <TableCell align="right">₹{budget.amount.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{spent.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Typography 
                        color={remaining < 0 ? 'error' : 'inherit'}
                        fontWeight={remaining < 0 ? 'bold' : 'normal'}
                      >
                        ₹{remaining.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(percentage, 100)} 
                            color={progressColor}
                            sx={{ height: 10, borderRadius: 5 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {percentage.toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(budget)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(budget)} size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Budget Form Dialog */}
      <BudgetForm
        open={openForm}
        onClose={handleCloseForm}
        budget={selectedBudget}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Budget"
        content={`Are you sure you want to delete the ${budgetToDelete?.category || 'total'} budget?`}
      />
    </Box>
  );
};

export default BudgetList;