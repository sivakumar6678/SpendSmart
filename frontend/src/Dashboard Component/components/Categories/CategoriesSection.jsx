import React from 'react';
import { useAppContext } from '../../context/AppContext';
import {
    Box,
    Typography,
    Paper,
    Grid,
    LinearProgress,
    Card,
    CardContent,
    Chip,
} from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

function CategoriesSection() {
    const { expenseData, incomeData } = useAppContext();

    const expenses = expenseData?.recentExpenses || [];
    const incomes = incomeData?.recentIncome || [];

    // Aggregate expenses by category
    const expenseByCategory = {};
    let totalExpenses = 0;
    expenses.forEach((exp) => {
        const cat = exp.category || 'Other';
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + exp.amount;
        totalExpenses += exp.amount;
    });

    const expenseCategories = Object.keys(expenseByCategory).sort(
        (a, b) => expenseByCategory[b] - expenseByCategory[a]
    );

    // Aggregate income by source
    const incomeBySource = {};
    let totalIncome = 0;
    incomes.forEach((inc) => {
        const src = inc.source || 'Other';
        incomeBySource[src] = (incomeBySource[src] || 0) + inc.amount;
        totalIncome += inc.amount;
    });

    const incomeSources = Object.keys(incomeBySource).sort(
        (a, b) => incomeBySource[b] - incomeBySource[a]
    );

    const expenseChartData = {
        labels: expenseCategories,
        datasets: [
            {
                data: expenseCategories.map((cat) => expenseByCategory[cat]),
                backgroundColor: CATEGORY_COLORS.slice(0, expenseCategories.length),
                borderWidth: 2,
                borderColor: '#1a1a2e',
            },
        ],
    };

    const incomeChartData = {
        labels: incomeSources,
        datasets: [
            {
                data: incomeSources.map((src) => incomeBySource[src]),
                backgroundColor: CATEGORY_COLORS.slice(0, incomeSources.length).reverse(),
                borderWidth: 2,
                borderColor: '#1a1a2e',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    font: { size: 12 },
                },
            },
        },
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Categories
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Breakdown of your spending and income by category
            </Typography>

            <Grid container spacing={3}>
                {/* Expense Categories Chart */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            height: '100%',
                        }}
                    >
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                            Expense Categories
                        </Typography>
                        {expenseCategories.length > 0 ? (
                            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                                <Doughnut data={expenseChartData} options={chartOptions} />
                            </Box>
                        ) : (
                            <Box textAlign="center" py={4}>
                                <Typography color="text.secondary">No expense data yet</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Income Sources Chart */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            height: '100%',
                        }}
                    >
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                            Income Sources
                        </Typography>
                        {incomeSources.length > 0 ? (
                            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                                <Doughnut data={incomeChartData} options={chartOptions} />
                            </Box>
                        ) : (
                            <Box textAlign="center" py={4}>
                                <Typography color="text.secondary">No income data yet</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Expense Category Breakdown */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                            Expense Breakdown
                        </Typography>
                        {expenseCategories.map((cat, index) => {
                            const amount = expenseByCategory[cat];
                            const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                            return (
                                <Box key={cat} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                                                }}
                                            />
                                            <Typography variant="body2" fontWeight="500">
                                                {cat}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" fontWeight="600">
                                                ₹{amount.toFixed(2)}
                                            </Typography>
                                            <Chip
                                                label={`${percentage.toFixed(1)}%`}
                                                size="small"
                                                sx={{
                                                    bgcolor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] + '22',
                                                    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={percentage}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: 'action.hover',
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 3,
                                                bgcolor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                                            },
                                        }}
                                    />
                                </Box>
                            );
                        })}
                        {expenseCategories.length === 0 && (
                            <Typography color="text.secondary" textAlign="center" py={2}>
                                No expenses recorded yet
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Income Source Breakdown */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                            Income Breakdown
                        </Typography>
                        {incomeSources.map((src, index) => {
                            const amount = incomeBySource[src];
                            const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
                            return (
                                <Box key={src} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: CATEGORY_COLORS[(CATEGORY_COLORS.length - 1 - index) % CATEGORY_COLORS.length],
                                                }}
                                            />
                                            <Typography variant="body2" fontWeight="500">
                                                {src}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" fontWeight="600">
                                                ₹{amount.toFixed(2)}
                                            </Typography>
                                            <Chip
                                                label={`${percentage.toFixed(1)}%`}
                                                size="small"
                                                sx={{
                                                    bgcolor: CATEGORY_COLORS[(CATEGORY_COLORS.length - 1 - index) % CATEGORY_COLORS.length] + '22',
                                                    color: CATEGORY_COLORS[(CATEGORY_COLORS.length - 1 - index) % CATEGORY_COLORS.length],
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={percentage}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: 'action.hover',
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 3,
                                                bgcolor: CATEGORY_COLORS[(CATEGORY_COLORS.length - 1 - index) % CATEGORY_COLORS.length],
                                            },
                                        }}
                                    />
                                </Box>
                            );
                        })}
                        {incomeSources.length === 0 && (
                            <Typography color="text.secondary" textAlign="center" py={2}>
                                No income recorded yet
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default CategoriesSection;
