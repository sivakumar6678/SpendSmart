import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  AppBar, 
  Toolbar, 
  Container,
  ListItemIcon,
  Divider,
  Button,
  Paper,
  Grid,
  TextField
} from '@mui/material';
import './Dashboard.css';
import IncomeForm from './Income';
import ExpenseForm from './Expense';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import userImage from '../assets/userimage.jpg';

// Import icons
import {
  Dashboard as DashboardIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  MonetizationOn as IncomeIcon,
  ShoppingCart as ExpenseIcon,
  Category as CategoryIcon,
  EmojiEvents as AchievementsIcon,
  Savings as SavingsIcon,
  AccountBalance as BudgetingIcon,
  Insights as InsightsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

// Import components
import DashboardOverview from './components/DashboardOverview';
import ProfileSection from './components/ProfileSection';
import EditProfileSection from './components/EditProfileSection';
import LogoutSection from './components/LogoutSection';

// Import custom hook for data fetching
import useDashboardData from './hooks/useDashboardData';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const drawerWidth = 240;

const Dashboard = () => {
  // Use the custom hook to fetch all data
  const { 
    userData, 
    incomeData, 
    expenseData, 
    isLoading, 
    error, 
    updateUserData, 
    refreshData 
  } = useDashboardData();
  
  const [activeSection, setActiveSection] = useState('Dashboard');

  // Handle section changes
  const handleSectionChange = (section) => setActiveSection(section);

  // Show loading state
  if (isLoading || !userData) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column'
        }}
      >
        <div className="loader"></div>
        <Typography variant="h6" sx={{ mt: 2 }}>Loading your dashboard...</Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  // Function to handle profile updates
  const handleProfileUpdate = async (e) => {
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
      
      if (!response.ok) throw new Error('Error updating profile');

      const updatedData = await response.json();
      updateUserData(updatedData);
      setActiveSection('Profile');
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again later.');
    }
  };

  // Render the appropriate section based on activeSection state
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'Dashboard':
        return <DashboardOverview incomeData={incomeData} expenseData={expenseData} />;
      
      case 'Expenses':
        return <ExpenseForm onSuccess={refreshData} />;
      
      case 'Income':
        return <IncomeForm onSuccess={refreshData} />;
      
      case 'Profile':
        return (
          <ProfileSection 
            userData={userData} 
            onEditProfile={() => setActiveSection('EditProfile')} 
          />
        );
      
      case 'EditProfile':
        return (
          <EditProfileSection 
            userData={userData} 
            onUpdateProfile={handleProfileUpdate} 
            onCancel={() => setActiveSection('Profile')} 
          />
        );
      
      case 'Categories':
        return (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
              <Typography variant="h5" gutterBottom>Categories</Typography>
              <Typography variant="body1">
                This feature is coming soon. You'll be able to create and manage custom categories for your income and expenses.
              </Typography>
            </Paper>
          </Box>
        );

      case 'Achievements':
        return (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
              <Typography variant="h5" gutterBottom>Achievements</Typography>
              <Typography variant="body1">
                Track your financial milestones and achievements. This feature is under development.
              </Typography>
            </Paper>
          </Box>
        );
      
      case 'Saving Goals':
        return (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
              <Typography variant="h5" gutterBottom>Saving Goals</Typography>
              <Typography variant="body1">
                Set and track your saving goals. This feature will be available soon.
              </Typography>
            </Paper>
          </Box>
        );
      
      case 'Budgeting':
        return (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
              <Typography variant="h5" gutterBottom>Budgeting</Typography>
              <Typography variant="body1">
                Create and manage your monthly budgets. This feature is coming soon.
              </Typography>
            </Paper>
          </Box>
        );
      
      case 'Insights':
        return (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
              <Typography variant="h5" gutterBottom>Financial Insights</Typography>
              <Typography variant="body1">
                Get personalized insights about your spending habits and financial health. This feature is under development.
              </Typography>
            </Paper>
          </Box>
        );
      
      case 'NotificationCenter':
        return (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
              <Typography variant="h5" gutterBottom>Notification Center</Typography>
              <Typography variant="body1">
                View all your important notifications and alerts in one place. This feature will be available soon.
              </Typography>
            </Paper>
          </Box>
        );
      
      case 'Logout':
        return (
          <LogoutSection 
            onCancel={() => setActiveSection('Dashboard')} 
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
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
          {[
            { text: 'Profile', icon: <ProfileIcon /> },
            { text: 'Dashboard', icon: <DashboardIcon /> },
            { text: 'Expenses', icon: <ExpenseIcon /> },
            { text: 'Income', icon: <IncomeIcon /> },
            { text: 'Categories', icon: <CategoryIcon /> },
            { text: 'Achievements', icon: <AchievementsIcon /> },
            { text: 'Saving Goals', icon: <SavingsIcon /> },
            { text: 'Budgeting', icon: <BudgetingIcon /> },
            { text: 'Insights', icon: <InsightsIcon /> },
            { text: 'NotificationCenter', icon: <NotificationsIcon /> },
            { text: 'Logout', icon: <LogoutIcon /> }
          ].map((item) => (
            <ListItem 
              button="true" 
              key={item.text} 
              onClick={() => handleSectionChange(item.text)}
              selected={activeSection === item.text}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                borderRadius: '8px',
                mb: 0.5,
                mx: 1
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      <Box component="main" className='dashboardcontent' sx={{ flexGrow: 1, p: 3, pl: 0, width: '86vw' }}>
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