import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';


const SavingGoalForm = ({ open, onClose, goal = null }) => {
  const { addSavingGoal, updateSavingGoal } = useAppContext();
  const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    target_amount: goal?.target_amount || '',
    current_amount: goal?.current_amount || '0',
    target_date: goal?.target_date || defaultDate
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
      if (!formData.title.trim()) {
        throw new Error('Please enter a title for your goal');
      }

      if (!formData.target_amount || isNaN(formData.target_amount) || parseFloat(formData.target_amount) <= 0) {
        throw new Error('Please enter a valid target amount');
      }

      if (parseFloat(formData.current_amount) < 0) {
        throw new Error('Current amount cannot be negative');
      }

      if (parseFloat(formData.current_amount) > parseFloat(formData.target_amount)) {
        throw new Error('Current amount cannot be greater than target amount');
      }

      if (!formData.target_date || new Date(formData.target_date) < new Date()) {
        throw new Error('Please select a future target date');
      }

      const goalData = {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount),
        target_date: formData.target_date // Already in YYYY-MM-DD format
      };

      if (goal) {
        // Update existing goal
        await updateSavingGoal(goal.id, goalData);
      } else {
        // Create new goal
        await addSavingGoal(goalData);
      }

      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{goal ? 'Edit Saving Goal' : 'Create New Saving Goal'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Goal Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., New Laptop, Emergency Fund, Vacation"
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Target Amount"
            name="target_amount"
            type="number"
            value={formData.target_amount}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
          />

          {goal && (
            <TextField
              margin="normal"
              fullWidth
              label="Current Amount"
              name="current_amount"
              type="number"
              value={formData.current_amount}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              helperText="How much have you saved so far?"
            />
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="Target Date"
            name="target_date"
            type="date"
            value={formData.target_date}
            onChange={handleChange}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
            InputLabelProps={{ shrink: true }}
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
          {loading ? 'Saving...' : (goal ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavingGoalForm;