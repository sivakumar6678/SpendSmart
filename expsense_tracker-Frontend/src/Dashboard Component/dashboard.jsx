import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard_Data = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        // Static data to test if the chart renders
        const incomeData = {
            labels: ['January', 'February', 'March', 'April', 'May'],
            datasets: [
                {
                    label: 'Monthly Income',
                    data: [5000, 6000, 7000, 8000, 9000],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        };

        setChartData(incomeData);
    }, []); // Empty dependency array ensures this only runs once on mount

    if (!chartData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="chart">
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Monthly Income',
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default Dashboard_Data;
