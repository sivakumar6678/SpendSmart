import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Box
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';

const BudgetForm = ({ open, onClose, budget = null }) => {
  const { addBudget, updateBudget } = useAppContext();
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    amount: budget?.amount || '',
    month: budget?.month || new Date().getMonth() + 1,
    year: budget?.year || new Date().getFullYear()
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (budget) {
        // Update existing budget
        await updateBudget(budget.id, budgetData);
      } else {
        // Create new budget
        await addBudget(budgetData);
      }

      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Food',
    'Transport',
    'Entertainment',
    'Shopping',
    'Bills',
    'Health',
    'Education',
    'Others'
  ];

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{budget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
            >
              <MenuItem value="">
                <em>Total Budget (All Categories)</em>
              </MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            required
            fullWidth
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="month-label">Month</InputLabel>
              <Select
                labelId="month-label"
                name="month"
                value={formData.month}
                onChange={handleChange}
                label="Month"
              >
                {months.map(month => (
                  <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 2020, max: 2030 } }}
            />
          </Box>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
        >
          {loading ? 'Saving...' : (budget ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetForm;