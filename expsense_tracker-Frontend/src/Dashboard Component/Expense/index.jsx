import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    Typography,
    Box,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Snackbar,
    Alert,
} from "@mui/material";
import '../../Dashboard Component/Dashboard.css';


const ExpenseForm = () => {
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
    const [totalMonthlyExpense,setTotalMonthlyExpense] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        month: "",
        category: "",
        paymentMethod: "",
    });
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [filteredTotal, setFilteredTotal] = useState(0);

    const userId = localStorage.getItem("userId");

    // Handle input change for the form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpense((prevExpense) => ({ ...prevExpense, [name]: value }));
    };

    // Handle form submission to add an expense
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("http://127.0.0.1:5000/api/add-expense", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...expense, userId }),
            });
            if (!response.ok) throw new Error("Failed to add expense");
            setMessage("Expense added successfully!");
            setSeverity("success");
            setExpense({ category: "", amount: "", date: "", paymentMethod: "", notes: "" });
            fetchUserExpenses();
        } catch (error) {
            setMessage(error.message || "Failed to add expense.");
            setSeverity("error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch user expenses
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
            calculateMonthlyTotal(data.recentExpenses, filters.month);
            calculateFilteredTotal(data.recentExpenses, filters);
            setTotalMonthlyExpense(data.totalMonthlyExpenses);
        } catch (error) {
            setMessage(error.message || "Failed to fetch expenses.");
            setSeverity("error");
        }
    };

    useEffect(() => {
        fetchUserExpenses();
    }, []);

    const calculateMonthlyTotal = (expenses, selectedMonth) => {
        const total = expenses
            .filter(
                (expense) =>
                    new Date(expense.date).getMonth() + 1 === parseInt(selectedMonth)
            )
            .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        setMonthlyTotal(total);
    };

    const calculateFilteredTotal = (expenses, filters) => {
        let filteredExpenses = [...expenses];
        if (filters.month) {
            filteredExpenses = filteredExpenses.filter(
                (expense) => new Date(expense.date).getMonth() + 1 === parseInt(filters.month)
            );
        }
        if (filters.category) {
            filteredExpenses = filteredExpenses.filter(
                (expense) => expense.category === filters.category
            );
        }
        if (filters.paymentMethod) {
            filteredExpenses = filteredExpenses.filter(
                (expense) => expense.paymentMethod === filters.paymentMethod
            );
        }
        const total = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        setFilteredTotal(total);
    };

    const handleFilterChange = (e, type) => {
        const value = e.target.value;
        setFilters((prevState) => ({ ...prevState, [type]: value }));
        const updatedFilters = { ...filters, [type]: value };
        filterExpenses(updatedFilters);
        if (type === "month") {
            calculateMonthlyTotal(originalExpenses, value);
        }
        calculateFilteredTotal(originalExpenses, updatedFilters);
    };

    const filterExpenses = (updatedFilters) => {
        let filteredExpenses = [...originalExpenses];
        if (updatedFilters.month) {
            filteredExpenses = filteredExpenses.filter(
                (expense) => new Date(expense.date).getMonth() + 1 === parseInt(updatedFilters.month)
            );
        }
        if (updatedFilters.category) {
            filteredExpenses = filteredExpenses.filter(
                (expense) => expense.category === updatedFilters.category
            );
        }
        if (updatedFilters.paymentMethod) {
            filteredExpenses = filteredExpenses.filter(
                (expense) => expense.paymentMethod === updatedFilters.paymentMethod
            );
        }
        setRecentExpenses(filteredExpenses);
    };

    const clearFilters = () => {
        setRecentExpenses(originalExpenses);
        calculateFilteredTotal(originalExpenses, { month: "", category: "", paymentMethod: "" });
        setFilteredTotal(0);
        setFilters({
            month: '',
            category: '',
            paymentMethod: '',
        });
    };

    return (
        <Box>
            {/* Monthly Expense Summary */}
            <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Monthly Expense Summary: ₹{totalMonthlyExpense}
            </Typography>
           

            {/* Filters Section */}
            <Box display="flex" alignItems="center" gap={2} marginBottom={2} className="filters">
                <TextField
                    select
                    label="Month"
                    className="filter-btn"
                    onChange={(e) => handleFilterChange(e, "month")}
                    value={filters.month}
                >
                    <MenuItem value="">Select Month</MenuItem>
                    {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    className="filter-btn"
                    label="Category"
                    onChange={(e) => handleFilterChange(e, "category")}
                    value={filters.category}
                >
                    <MenuItem value="">Select Category</MenuItem>
                    {["Food", "Transport", "Entertainment", "Shopping", "Bills", "Health", "Education", "Others"].map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    className="filter-btn"
                    label="Payment Method"
                    onChange={(e) => handleFilterChange(e, "paymentMethod")}
                    value={filters.paymentMethod}
                >
                    <MenuItem value="">Select Payment Method</MenuItem>
                    {["Cash", "Card", "UPI", "Bank Transfer"].map((method) => (
                        <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                </TextField>
                <Button variant="contained" onClick={clearFilters}>Clear Filters</Button>
                <Button variant="contained" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "Add Expense"}
                </Button>
            </Box>

            {showForm && (
                <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Category"
                            name="category"
                            value={expense.category}
                            onChange={handleChange}
                            fullWidth
                            select
                        >
                            <MenuItem value="">Select Category</MenuItem>
                            {["Food", "Transport", "Entertainment", "Shopping", "Bills", "Health", "Education", "Others"].map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Amount"
                            type="number"
                            name="amount"
                            value={expense.amount}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Date"
                            type="date"
                            name="date"
                            value={expense.date}
                            onChange={handleChange}
                            slotProps={{ inputLabel: { shrink: true } }}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Notes"
                            name="notes"
                            value={expense.notes}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Payment Method"
                            name="paymentMethod"
                            value={expense.paymentMethod}
                            onChange={handleChange}
                            fullWidth
                            select
                        >
                            <MenuItem value="">Select Payment Method</MenuItem>
                            {["Cash", "Card", "UPI", "Bank Transfer"].map((method) => (
                                <MenuItem key={method} value={method}>{method}</MenuItem>
                            ))}
                        </TextField>
                        <Button type="submit" variant="contained" disabled={loading}>Save Expense</Button>
                    </Box>
                </form>
            )}
            <Typography variant="h5" sx={{ marginBottom: 2 }}>
                Expense History:
            </Typography>
            <Typography variant="h5" sx={{ marginBottom: 2 }}>
                Filtered Expenses Summary: ₹{filteredTotal}
            </Typography>
            {/* Expenses Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Payment Method</TableCell>
                            <TableCell>Notes</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {recentExpenses.map((expense, index) => (
                            <TableRow key={index}>
                                <TableCell>{expense.category}</TableCell>
                                <TableCell>{expense.amount}</TableCell>
                                <TableCell>{expense.date}</TableCell>
                                <TableCell>{expense.paymentMethod}</TableCell>
                                <TableCell>{expense.notes}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Snackbar for success/error messages */}
            <Snackbar
                open={!!message}
                autoHideDuration={6000}
                onClose={() => setMessage("")}
            >
                <Alert onClose={() => setMessage("")} severity={severity}>
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ExpenseForm;
