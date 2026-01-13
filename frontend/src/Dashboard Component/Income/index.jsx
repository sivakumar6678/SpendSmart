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
    Paper,
    Snackbar,
    Alert,
    InputAdornment,
    Chip,
    IconButton,
    Collapse
} from '@mui/material';
import {
    Add as AddIcon,
    FilterList as FilterListIcon,
    Clear as ClearIcon,
    AttachMoney as MoneyIcon,
    DateRange as DateIcon,
    Description as NoteIcon
} from '@mui/icons-material';

const IncomeForm = ({ onSuccess }) => {
    const [income, setIncome] = useState({
        source: "",
        amount: "",
        date: "",
        paymentMethod: "Bank Transfer",
        notes: "",
        otherSource: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState("success");
    const [originalIncome, setOriginalIncome] = useState([]);
    const [recentIncome, setRecentIncome] = useState([]);
    const [totalMonthlyIncome, setTotalMonthlyIncome] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        month: '',
        category: '',
        paymentMethod: '',
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setIncome((prevIncome) => ({
            ...prevIncome,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:5000/api/add-income', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(income),
            });

            if (!response.ok) throw new Error('Failed to add income');

            setMessage("Income added successfully!");
            setSeverity("success");
            setIncome({
                source: "",
                amount: "",
                date: "",
                paymentMethod: "Bank Transfer",
                notes: "",
                otherSource: "",
            });
            setShowForm(false);
            fetchUserIncome(); // Refresh local data
            if (onSuccess) onSuccess(); // Notify parent to refresh global data if needed

        } catch (error) {
            setMessage(error.message || "Request failed.");
            setSeverity("error");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserIncome = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:5000/api/get-user-income', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch income data');

            const data = await response.json();
            setOriginalIncome(data.recentIncome);
            setRecentIncome(data.recentIncome);
            setTotalMonthlyIncome(data.totalMonthlyIncome);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUserIncome();
    }, []);

    const handleResetFilters = () => {
        setFilters({ month: '', category: '', paymentMethod: '' });
        setRecentIncome(originalIncome);
    };

    const handleFilterChange = (e, type) => {
        const value = e.target.value;
        const newFilters = { ...filters, [type]: value };
        setFilters(newFilters);

        let filtered = [...originalIncome];
        if (newFilters.month) {
            filtered = filtered.filter(item => new Date(item.date).getMonth() + 1 === parseInt(newFilters.month));
        }
        if (newFilters.category) {
            filtered = filtered.filter(item => item.source === newFilters.category);
        }
        if (newFilters.paymentMethod) {
            filtered = filtered.filter(item => item.paymentMethod === newFilters.paymentMethod);
        }
        setRecentIncome(filtered);
    };

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">Total Monthly Income</Typography>
                                <Typography variant="h3" fontWeight="bold">
                                    ₹{totalMonthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Typography>
                            </Box>
                            <MoneyIcon sx={{ fontSize: 60, opacity: 0.8 }} />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Income Transactions</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={showForm ? <ClearIcon /> : <AddIcon />}
                                    onClick={() => setShowForm(!showForm)}
                                    color={showForm ? "error" : "primary"}
                                >
                                    {showForm ? 'Cancel' : 'Add New Income'}
                                </Button>
                            </Box>

                            <Collapse in={showForm}>
                                <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField select fullWidth label="Source" name="source" value={income.source} onChange={handleChange} required>
                                                {["Salary", "From Person", "Freelance", "Business", "Investments", "Gift", "Bonus", "Other"].map(opt => (
                                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="Amount" name="amount" type="number" value={income.amount} onChange={handleChange} required InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="Date" name="date" type="date" value={income.date} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField select fullWidth label="Payment Method" name="paymentMethod" value={income.paymentMethod} onChange={handleChange}>
                                                {["Bank Transfer", "Cash", "Check"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Notes" name="notes" value={income.notes} onChange={handleChange} multiline rows={2} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                                                {loading ? 'Adding...' : 'Save Income'}
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
                                <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleResetFilters}>Clear Filters</Button>
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Source</TableCell>
                                            <TableCell>Method</TableCell>
                                            <TableCell>Notes</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentIncome.map((row, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                                <TableCell><Chip label={row.source} color="success" variant="outlined" size="small" /></TableCell>
                                                <TableCell>{row.paymentMethod}</TableCell>
                                                <TableCell sx={{ color: 'text.secondary', maxWidth: 200 }} noWrap>{row.notes}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                                    ₹{row.amount.toLocaleString('en-IN')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {recentIncome.length === 0 && (
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

export default IncomeForm;