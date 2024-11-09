import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, TextField, Button, Paper } from '@mui/material';
import './Dashboard.css';
import IncomeForm from './Income';
import ExpenseForm from './Expense';
import Dashboard_Data from '../Dashboard Component';

const drawerWidth = 240;

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [activeSection, setActiveSection] = useState('Dashboard');
   
    const fetchUserData = async () => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        if (!token) {
            console.error("No token found. Please log in.");
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/user-data', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            
            const data = await response.json();
            setUserData(data);
                                            
        } catch (error) {
            console.error('Error fetching user data ', error);
            alert('Failed to load data. Please try again later.');
        }
    };
    useEffect(() => {
        fetchUserData();
    }, []);
    
      
    if (!userData) {
        return <div className="loader"></div>;
    }

    const handleSectionChange = (section) => setActiveSection(section);

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'Dashboard':
                return (
                    <Box sx={{ mt: 3 }}>
                        <Dashboard_Data />
                    </Box>
                );
            case 'Expenses':
                return (
                    <ExpenseForm />
                );
            case 'Income':
                return (
                    <IncomeForm />
                );
                case 'Profile':
                    return (
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Paper elevation={3} sx={{ padding: 3, borderRadius: '16px', backgroundColor: '#f9f9f9' }}>
                                {userData.profilePic ? (
                                    <img
                                        src={userData.profilePic}
                                        alt="Profile"
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            marginBottom: '20px',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                ) : (
                                    <Typography variant="body1" sx={{ mb: 2 }}>No profile image available</Typography>
                                )}
                
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#3f51b5' }}>
                                    <b>Name :</b> {userData.fullName}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'gray', mb: 1 }}>
                                    <b>Email:</b> {userData.email}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Gender:</strong> {userData.gender || 'Not specified'}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Date Joined:</strong> {new Date(userData.createdAt).toLocaleDateString()}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2, color: '#4caf50' }}>
                                    Account Balance: ${userData.accountBalance.toFixed(2)}
                                </Typography>
                
                                <Box mt={3}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => setActiveSection('EditProfile')}
                                        sx={{ mr: 2, borderRadius: '8px', padding: '10px 20px' }}
                                    >
                                        Edit Profile
                                    </Button>
                                </Box>
                            </Paper>
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
                        const token = localStorage.getItem('token'); 
                        const response = await fetch('http://127.0.0.1:5000/api/update-profile', {
                            
                            method: 'POST',
                            body: formData,
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
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
                            <Button variant="outlined" onClick={() => setActiveSection('Profile')} sx={{ ml: 2 }}>Cancel</Button>
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
