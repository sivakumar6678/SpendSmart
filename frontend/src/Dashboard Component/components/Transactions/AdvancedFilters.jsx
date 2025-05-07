import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';

const AdvancedFilters = ({ type = 'expense', onFilterResults }) => {
  const { filterTransactions, filterIncomes } = useAppContext();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: '',
    category: '',
    source: '',
    payment_method: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      min_amount: '',
      max_amount: '',
      category: '',
      source: '',
      payment_method: ''
    });
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      // Remove empty filters
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      let results;
      if (type === 'expense') {
        results = await filterTransactions(activeFilters);
      } else {
        results = await filterIncomes(activeFilters);
      }
      
      onFilterResults(results);
    } catch (error) {
      console.error('Error applying filters:', error);
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
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h3">
          <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Advanced Filters
        </Typography>
        <Button
          color="primary"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          {filtersOpen ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>
      
      <Collapse in={filtersOpen}>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="start_date"
                type="date"
                value={filters.start_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="end_date"
                type="date"
                value={filters.end_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Min Amount"
                name="min_amount"
                type="number"
                value={filters.min_amount}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Amount"
                name="max_amount"
                type="number"
                value={filters.max_amount}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="payment-method-label">Payment Method</InputLabel>
                <Select
                  labelId="payment-method-label"
                  name="payment_method"
                  value={filters.payment_method}
                  onChange={handleChange}
                  label="Payment Method"
                >
                  <MenuItem value="">All</MenuItem>
                  {paymentMethods.map(method => (
                    <MenuItem key={method} value={method}>{method}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              {type === 'expense' ? (
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    <MenuItem value="">All</MenuItem>
                    {expenseCategories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl fullWidth>
                  <InputLabel id="source-label">Source</InputLabel>
                  <Select
                    labelId="source-label"
                    name="source"
                    value={filters.source}
                    onChange={handleChange}
                    label="Source"
                  >
                    <MenuItem value="">All</MenuItem>
                    {incomeSources.map(source => (
                      <MenuItem key={source} value={source}>{source}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleApplyFilters}
              disabled={loading}
            >
              {loading ? 'Filtering...' : 'Apply Filters'}
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AdvancedFilters;