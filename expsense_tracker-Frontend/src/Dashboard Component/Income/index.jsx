import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Typography,
    Container,
    Snackbar,
    Alert,
    Box,
} from '@mui/material';
import '../../Dashboard Component/Dashboard.css';

const IncomeForm = () => {
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
    const [originalIncome, setOriginalIncome] = useState([]); // Store original income data
    const [recentIncome, setRecentIncome] = useState([]);
    const [totalMonthlyIncome, setTotalMonthlyIncome] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        month: '',
        category: '',
        paymentMethod: '',
    });

    const userId = localStorage.getItem('userId');  // Assuming userId is stored in localStorage after login

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
            const response = await fetch('http://127.0.0.1:5000/api/add-income', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...income,
                    userId: userId, // Sending userId along with income data
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add income');
            }

            const data = await response.json();
            setMessage("Income added successfully!");
            setSeverity("success");
            setIncome({
                source: "",
                amount: "",
                date: "",
                paymentMethod: "Bank Transfer",
                notes: "",
                otherSource: "",
            }); // Clear form after success
            fetchUserIncome(); // Fetch updated income data

        } catch (error) {
            setMessage(error.message || "There was a problem with the request.");
            setSeverity("error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch user income data
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

            if (!response.ok) {
              throw new Error('Failed to fetch user income data');
            }
        
            const data = await response.json();
            setOriginalIncome(data.recentIncome); // Store original income data
            setRecentIncome(data.recentIncome); // Set recent income data
            setTotalMonthlyIncome(data.totalMonthlyIncome);
              
        } catch (error) {
            setMessage(error.message || "There was a problem with the request.");
            setSeverity("error");
        }
    };

    useEffect(() => {
        fetchUserIncome();
    }, []);

    const handleResetFilters = () => {
        setFilters({
            month: '',
            category: '',
            paymentMethod: '',
        });
        setRecentIncome(originalIncome); // Reset to original income data
    };

    const handleFilterChange = (e, type) => {
        const value = e.target.value;
        setFilters(prevState => {
            const newFilters = {
                ...prevState,
                [type]: value,
            };

            // Create a filtered array based on the original income data
            let filteredIncome = [...originalIncome];

            // Apply filters
            if (newFilters.month) {
                filteredIncome = filteredIncome.filter(income =>
                    new Date(income.date).getMonth() + 1 === parseInt(newFilters.month)
                );
            }

            if (newFilters.category) {
                filteredIncome = filteredIncome.filter(income =>
                    income.source === newFilters.category
                );
            }

            if (newFilters.paymentMethod) {
                filteredIncome = filteredIncome.filter(income =>
                    income.paymentMethod === newFilters.paymentMethod
                );
            }

            setRecentIncome(filteredIncome);

            return newFilters; // Return the new filters state
        });
    };

    return (
        <Box className="incomesection">
            <Typography variant="h4" className="total-income">
                Income Overview: <span style={{ color: 'green' }}>₹{totalMonthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
            </Typography>

            <Box className="filters">
                <TextField
                    select
                    variant="outlined"
                    SelectProps={{ native: true }}
                    value={filters.month}
                    onChange={(e) => handleFilterChange(e, 'month')}
                >
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option value={i + 1} key={i}>
                            {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                        </option>
                    ))}
                </TextField>

                <TextField
                    select
                    variant="outlined"
                    SelectProps={{ native: true }}
                    value={filters.category}
                    onChange={(e) => handleFilterChange(e, 'category')}
                >
                    <option value="">Select Category</option>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investments">Investments</option>
                    <option value="Business">Business</option>
                    <option value="Gift">Gift</option>
                    <option value="Bonus">Bonus</option>
                    <option value="From Person">From Person</option>
                    <option value="Other">Other</option>
                </TextField>

                <TextField
                    select
                    variant="outlined"
                    SelectProps={{ native: true }}
                    value={filters.paymentMethod}
                    onChange={(e) => handleFilterChange(e, 'paymentMethod')}
                >
                    <option value="">Select Payment Method</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                </TextField>

                <Button variant="outlined" onClick={handleResetFilters}>
                    Clear Filters
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Hide Income Form' : 'Add Income'}
                </Button>
            </Box>
            {showForm && (
                <Box sx={{ width: '60%', margin: '1rem auto' }}>
                    <Typography variant="h4" gutterBottom>
                        Income Entry
                    </Typography>

                    {/* Display success/error messages */}
                    <Snackbar open={message !== ""} autoHideDuration={6000} onClose={() => setMessage("")}>
                        <Alert severity={severity} onClose={() => setMessage("")} sx={{ width: '100%' }}>
                            {message}
                        </Alert>
                    </Snackbar>

                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel htmlFor="source">Income Source</InputLabel>
                            <Select
                                labelId="source-label"
                                id="source"
                                name="source"
                                value={income.source}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="Salary">Salary</MenuItem>
                                <MenuItem value="From Person">From Person</MenuItem>
                                <MenuItem value="Freelance">Freelance</MenuItem>
                                <MenuItem value="Business">Business</MenuItem>
                                <MenuItem value="Investments">Investments</MenuItem>
                                <MenuItem value="Gift">Gift</MenuItem>
                                <MenuItem value="Bonus">Bonus</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>

                        {income.source === "Other" && (
                            <TextField
 fullWidth
                                margin="normal"
                                label="Other Income Source"
                                id="otherSource"
                                name="otherSource"
                                value={income.otherSource}
                                onChange={handleChange}
                                placeholder="Please specify"
                            />
                        )}

                        <TextField
                            fullWidth
                            margin="normal"
                            label="Amount"
                            type="number"
                            id="amount"
                            name="amount"
                            value={income.amount}
                            onChange={handleChange}
                            placeholder="e.g., 5000"
                            required
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            label="Date Received"
                            type="date"
                            id="date"
                            name="date"
                            value={income.date}
                            onChange={handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            required
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel htmlFor="paymentMethod">Payment Method</InputLabel>
                            <Select
                                labelId="paymentMethod-label"
                                id="paymentMethod"
                                name="paymentMethod"
                                value={income.paymentMethod}
                                onChange={handleChange}
                            >
                                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                                <MenuItem value="Cash">Cash</MenuItem>
                                <MenuItem value="Check">Check</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            margin="normal"
                            label="Notes (Optional)"
                            id="notes"
                            name="notes"
                            value={income.notes}
                            onChange={handleChange}
                            placeholder="e.g., Freelance project payment"
                            multiline
                            rows={4}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? 'Adding Income...' : 'Submit'}
                        </Button>
                    </form>
                </Box>
            )}

            <Typography variant="h6" className="recent-income-title">
            Income History:
            </Typography>
            <Typography variant="h6" className="filtered-income-title">
            Income Summary for Filters: <span style={{ color: 'green' }}>₹{recentIncome.reduce((acc, income) => acc + parseFloat(income.amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
            </Typography>

            <Box className="income-table-container">
                <table className="income-table">
                    <thead>
                        <tr>
                            <th>Source</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Payment Method</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentIncome.length > 0 ? (
                            recentIncome.map((income, index) => (
                                <tr key={index}>
                                    <td>{income.source}</td>
                                    <td style={{ color: 'blue' }}>₹{income.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td>{new Date(income.date).toLocaleDateString()}</td>
                                    <td>{income.paymentMethod}</td>
                                    <td>{income.notes}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-income">
                                    No recent income transactions available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Box>
        </Box>
    );
};

export default IncomeForm;