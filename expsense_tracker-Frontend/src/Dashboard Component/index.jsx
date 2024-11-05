import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, TextField, Button } from '@mui/material';
import './Dashboard.css';

const drawerWidth = 240;

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [activeSection, setActiveSection] = useState('Dashboard');

   // Example for Error Handling in fetchUserData
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000//api/user-data');
                if (!response.ok) throw new Error('Failed to fetch user data');
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
                alert('Failed to load user data. Please try again later.');
            }
        };

        fetchUserData();
}, []);


    if (!userData) {
        return <div className="loader">Loading...</div>;
    }

    const handleSectionChange = (section) => setActiveSection(section);

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'Dashboard':
                return (
                    <Box sx={{ mt: 3 }}>
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
 {userData.profilePic ? (
    <img src={userData.profilePic} alt="Profile" style={{ width: '150px', height: '150px', borderRadius: '50%' }} />
) : (
    <Typography variant="body1">No profile image available</Typography>
)}

                        <Typography variant="body1">Name: {userData.fullName}</Typography>
                        <Typography variant="body1">Email: {userData.email}</Typography>
                        <Typography variant="body1">Gender: {userData.gender}</Typography>
                        <Typography variant="body1">Date Joined: {userData.createdAt}</Typography>
                        <Typography variant="body1">Account Balance: ${userData.accountBalance}</Typography>
                        <Box mt={2}>
                            <Button variant="contained" onClick={() => setActiveSection('EditProfile')}>Edit Profile</Button>
                        </Box>
                    </Box>
                );
            case 'Categories':
                return <Box><Typography variant="h6">Categories</Typography></Box>;
            case 'EditProfile':
                const updateProfileData = async (e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('fullName', e.target.fullName.value);
                    formData.append('email', e.target.email.value);
                    if (e.target.profileImage.files.length > 0) {
                        formData.append('profileImage', e.target.profileImage.files[0]);
                    }
                    formData.append('gender', e.target.gender.value);

                    try {
                        const response = await fetch('/api/update-profile', {
                            method: 'POST',
                            body: formData,
                        });
                        console.log("formData", formData);
                        console.log("response", response);
                        if (!response.ok) throw new Error('Error updating profile');

                        const updatedData = await response.json();
                        setUserData(updatedData);
                        setActiveSection('Profile');
                    } catch (error) {
                        console.error('Error updating profile:', error);
                    }
                }

                return (
                    <Box>
                        <form onSubmit={updateProfileData}>
                            <Box mb={2}>
                                <TextField
                                    label="Name"
                                    name="fullName"
                                    defaultValue={userData.fullName}
                                    variant="outlined"
                                    fullWidth
                                    required
                                />
                            </Box>
                            <Box mb={2}>
                                <TextField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    defaultValue={userData.email}
                                    variant="outlined"
                                    fullWidth
                                    required
                                />
                            </Box>
                            <Box mb={2}>
                                <Typography variant="body1">Gender:</Typography>
                                <label>
                                    <input type="radio" name="gender" value="Male" defaultChecked={userData.gender === 'Male'} /> Male
                                </label>
                                <label>
                                    <input type="radio" name="gender" value="Female" defaultChecked={userData.gender === 'Female'} /> Female
                                </label>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="body1">Profile Image:</Typography>
                                <input type="file" name="profileImage" accept="image/*" />
                            </Box>
                            <Box mb={2}>
                                <Typography variant="body1">Date Joined: {userData.createdAt}</Typography>
                            </Box>
                            <Button type="submit" variant="contained">Save Changes</Button>
                        </form>
                    </Box>
                );
            case 'Logout':
                const handleLogout = () => {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                };

                return (
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Are you sure you want to logout?</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Button variant="contained" onClick={handleLogout} color="error">Yes</Button>
                            <Button variant="contained" onClick={() => setActiveSection('Dashboard')}>No</Button>
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ display: 'flex', width: '100%', bgcolor: '#f5f5f5' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, width: '100%' }}>
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
                <List className='sidebar'>
                    {['Profile', 'Dashboard', 'Expenses', 'Income', 'Categories', 'Logout'].map((text) => (
                        <ListItem button key={text} onClick={() => handleSectionChange(text)}>
                            <ListItemText primary={text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box component="main" className='dashboardcontent' sx={{ flexGrow: 1, p: 3, pl: 0, width: '86vw', bgcolor: '#ffffff' }}>
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
