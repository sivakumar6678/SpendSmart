import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    MenuItem,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Snackbar,
    Alert,
    InputAdornment,
    Chip,
    Collapse
} from '@mui/material';
import {
    Add as AddIcon,
    Clear as ClearIcon,
    MoneyOff as ExpenseIcon
} from '@mui/icons-material';

const ExpenseForm = ({ onSuccess }) => {
    const [expense, setExpense] = useState({
        category: "",
        amount: "",
        date: "",
        paymentMethod: "",
        notes: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState("success");
    const [originalExpenses, setOriginalExpenses] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [totalMonthlyExpense, setTotalMonthlyExpense] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        month: "",
        category: "",
        paymentMethod: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpense({ ...expense, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:5000/api/add-expense", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expense),
            });
            if (!response.ok) throw new Error("Failed to add expense");
            setMessage("Expense added successfully!");
            setSeverity("success");
            setExpense({ category: "", amount: "", date: "", paymentMethod: "", notes: "" });
            setShowForm(false);
            fetchUserExpenses();
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage(error.message || "Failed to add expense.");
            setSeverity("error");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserExpenses = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://127.0.0.1:5000/api/get-user-expenses", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch expenses");
            const data = await response.json();
            setOriginalExpenses(data.recentExpenses);
            setRecentExpenses(data.recentExpenses);
            setTotalMonthlyExpense(data.totalMonthlyExpenses);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUserExpenses();
    }, []);

    const handleFilterChange = (e, type) => {
        const value = e.target.value;
        const newFilters = { ...filters, [type]: value };
        setFilters(newFilters);

        let filtered = [...originalExpenses];
        if (newFilters.month) {
            filtered = filtered.filter(item => new Date(item.date).getMonth() + 1 === parseInt(newFilters.month));
        }
        if (newFilters.category) {
            filtered = filtered.filter(item => item.category === newFilters.category);
        }
        if (newFilters.paymentMethod) {
            filtered = filtered.filter(item => item.paymentMethod === newFilters.paymentMethod);
        }
        setRecentExpenses(filtered);
    };

    const clearFilters = () => {
        setFilters({ month: "", category: "", paymentMethod: "" });
        setRecentExpenses(originalExpenses);
    };

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">Total Monthly Expenses</Typography>
                                <Typography variant="h3" fontWeight="bold">
                                    ₹{totalMonthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Typography>
                            </Box>
                            <ExpenseIcon sx={{ fontSize: 60, opacity: 0.8 }} />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Expense Transactions</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={showForm ? <ClearIcon /> : <AddIcon />}
                                    onClick={() => setShowForm(!showForm)}
                                    color={showForm ? "secondary" : "primary"}
                                >
                                    {showForm ? 'Cancel' : 'Add New Expense'}
                                </Button>
                            </Box>

                            <Collapse in={showForm}>
                                <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField select fullWidth label="Category" name="category" value={expense.category} onChange={handleChange} required>
                                                {["Food", "Transport", "Entertainment", "Shopping", "Bills", "Health", "Education", "Others"].map(opt => (
                                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="Amount" name="amount" type="number" value={expense.amount} onChange={handleChange} required InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="Date" name="date" type="date" value={expense.date} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField select fullWidth label="Payment Method" name="paymentMethod" value={expense.paymentMethod} onChange={handleChange}>
                                                {["Cash", "Card", "UPI", "Bank Transfer"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Notes" name="notes" value={expense.notes} onChange={handleChange} multiline rows={2} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                                                {loading ? 'Adding...' : 'Save Expense'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Collapse>

                            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                <TextField select size="small" label="Month" value={filters.month} onChange={(e) => handleFilterChange(e, 'month')} sx={{ minWidth: 150 }}>
                                    <MenuItem value="">All Months</MenuItem>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <MenuItem key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en-US', { month: 'long' })}</MenuItem>
                                    ))}
                                </TextField>
                                <Button variant="outlined" startIcon={<ClearIcon />} onClick={clearFilters}>Clear Filters</Button>
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Method</TableCell>
                                            <TableCell>Notes</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentExpenses.map((row, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                                <TableCell><Chip label={row.category} color="primary" variant="outlined" size="small" /></TableCell>
                                                <TableCell>{row.paymentMethod}</TableCell>
                                                <TableCell sx={{ color: 'text.secondary', maxWidth: 200 }} noWrap>{row.notes}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                                    ₹{row.amount.toLocaleString('en-IN')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {recentExpenses.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">No records found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage("")}>
                <Alert onClose={() => setMessage("")} severity={severity} sx={{ width: '100%' }}>{message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ExpenseForm;
