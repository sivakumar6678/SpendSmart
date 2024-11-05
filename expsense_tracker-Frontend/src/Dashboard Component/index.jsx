import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Drawer, List, ListItem, ListItemText, AppBar, Toolbar } from '@mui/material';
import './Dashboard.css';

const drawerWidth = 240;

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [activeSection, setActiveSection] = useState('Dashboard');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/user-data');
                if (!response.ok) throw new Error('Error fetching user data');
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    if (!userData) {
        return <Typography>Loading...</Typography>;
    }

    const handleSectionChange = (section) => setActiveSection(section);

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'Dashboard':
                return (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            Dashboard Overview
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                            Account Balance: <strong>${userData.accountBalance}</strong>
                        </Typography>
                        <Typography variant="h5" mt={2}>
                            Recent Transactions:
                        </Typography>
                        <ul>
                            {userData.recentTransactions.map((transaction, index) => (
                                <li key={index}>
                                    <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                        {transaction.description}: <strong>${transaction.amount}</strong>
                                    </Typography>
                                </li>
                            ))}
                        </ul>
                    </Box>
                );
            case 'Expenses':
                return (
                    <Box>
                        <Typography variant="h6">Expenses</Typography>
                        <Typography variant="body1">Total Expenses This Month: ${userData.totalMonthlyExpenses}</Typography>
                        <ul>
                            {userData.recentExpenses.map((expense, index) => (
                                <li key={index}>{expense.description}: ${expense.amount}</li>
                            ))}
                        </ul>
                    </Box>
                );
            case 'Income':
                return (
                    <Box>
                        <Typography variant="h6">Income</Typography>
                        <Typography variant="body1">Total Income This Month: ${userData.totalMonthlyIncome}</Typography>
                        <ul>
                            {userData.recentIncome.map((income, index) => (
                                <li key={index}>{income.description}: ${income.amount}</li>
                            ))}
                        </ul>
                    </Box>
                );
            case 'Profile':
                return (
                    <Box>
                        <Typography variant="h6">Profile Details</Typography>
                        <Typography variant="h6">Profile Image</Typography>
                        {userData.profileImage ? (
                            <img src={userData.profileImage} alt="Profile" style={{ width: '150px', height: '150px', borderRadius: '50%' }} />
                        ) : (
                            <Typography variant="body1">No profile image available</Typography>
                        )}
                        <Typography variant="body1">Name: {userData.fullName}</Typography>
                        <Typography variant="body1">Email: {userData.email}</Typography>
                        <Typography variant="body1">Gender: {userData.gender}</Typography>
                        <Typography variant="body1">Qualification: {userData.qualification}</Typography>
                        <Box mt={2}>
                            <button onClick={() => setActiveSection('EditProfile')}>Edit Profile</button>
                        </Box>
                    </Box>
                );
            case 'Categories':
                return <Box><Typography variant="h6">Categories</Typography></Box>;
            case 'EditProfile':
                return (
                    <Box>
                        <form>
                            {['Name', 'Email', 'Gender', 'Qualification'].map((field, index) => (
                                <Box mb={2} key={index}>
                                    <Typography variant="body1">{field}:</Typography>
                                    <input type={field === 'Email' ? 'email' : 'text'} defaultValue={userData[field.toLowerCase()]} />
                                </Box>
                            ))}
                            <Box mb={2}>
                                <Typography variant="body1">Profile Image:</Typography>
                                <input type="file" accept="image/*" />
                            </Box>
                            <button type="submit">Save Changes</button>
                        </form>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                        Welcome, {userData.fullName}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar />
                <List>
                    {['Profile', 'Dashboard', 'Expenses', 'Income', 'Categories'].map((text) => (
                        <ListItem button key={text} onClick={() => handleSectionChange(text)}>
                            <ListItemText primary={text} />
                        </ListItem>
                    ))}
                    <ListItem button>
                        <ListItemText primary="Logout" />
                    </ListItem>
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Container>
                    <Typography variant="h4" align="center" gutterBottom>
                        {activeSection}
                    </Typography>
                    {renderSectionContent()}
                </Container>
            </Box>
        </Box>
    );
}

export default Dashboard;
