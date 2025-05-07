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

const TransactionForm = ({ open, onClose, transaction = null, type = 'expense' }) => {
  const { updateTransaction, updateIncome } = useAppContext();
  const [formData, setFormData] = useState({
    category: transaction?.category || '',
    source: transaction?.source || '',
    amount: transaction?.amount || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    payment_method: transaction?.payment_method || 'Cash',
    notes: transaction?.notes || ''
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
      if (type === 'expense' && !formData.category) {
        throw new Error('Please select a category');
      }
      
      if (type === 'income' && !formData.source) {
        throw new Error('Please select a source');
      }
      
      if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (!formData.date) {
        throw new Error('Please select a date');
      }
      
      if (!formData.payment_method) {
        throw new Error('Please select a payment method');
      }

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (type === 'expense') {
        await updateTransaction(transaction.id, transactionData);
      } else {
        await updateIncome(transaction.id, transactionData);
      }

      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = [
    'Food',
    'Transport',
    'Entertainment',
    'Shopping',
    'Bills',
    'Health',
    'Education',
    'Others'
  ];

  const incomeSources = [
    'Salary',
    'Freelance',
    'Investments',
    'Business',
    'Gift',
    'Bonus',
    'From Person',
    'Other'
  ];

  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'UPI',
    'Net Banking',
    'Bank Transfer',
    'Other'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {type === 'expense' ? 'Edit Expense' : 'Edit Income'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {type === 'expense' ? (
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
                required
              >
                {expenseCategories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth margin="normal">
              <InputLabel id="source-label">Source</InputLabel>
              <Select
                labelId="source-label"
                name="source"
                value={formData.source}
                onChange={handleChange}
                label="Source"
                required
              >
                {incomeSources.map(source => (
                  <MenuItem key={source} value={source}>{source}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

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

          <TextField
            margin="normal"
            required
            fullWidth
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              label="Payment Method"
              required
            >
              {paymentMethods.map(method => (
                <MenuItem key={method} value={method}>{method}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            fullWidth
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={2}
          />

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
          {loading ? 'Saving...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionForm;