import React, { useState } from "react";
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
} from '@mui/material';

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
            console.log(response);

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

        } catch (error) {
            setMessage(error.message || "There was a problem with the request.");
            setSeverity("error");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <Container maxWidth="sm">
            
            

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
                        <MenuItem value="FromPerson">From Person</MenuItem>
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
        </Container>
    );
};

export default IncomeForm;
