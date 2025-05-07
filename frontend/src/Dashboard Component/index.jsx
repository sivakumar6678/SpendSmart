import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  AppBar, 
  Toolbar, 
  Container 
} from '@mui/material';
import './Dashboard.css';
import IncomeForm from './Income';
import ExpenseForm from './Expense';
import AchievementsList from '../components/Achievements/AchievementsList';
import SavingGoalList from '../components/SavingGoals/SavingGoalList';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Import custom components
import DashboardOverview from './components/DashboardOverview';
import ProfileSection from './components/ProfileSection';
import EditProfileSection from './components/EditProfileSection';
import LogoutSection from './components/LogoutSection';

// Import custom hook for data fetching
import useDashboardData from './hooks/useDashboardData';

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
    return <div className="loader"></div>;
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

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
            onUpdateProfile={(updatedData) => {
              updateUserData(updatedData);
              setActiveSection('Profile');
            }} 
            onCancel={() => setActiveSection('Profile')} 
          />
        );

      case 'Achievements':
          return <AchievementsList achievements={userData.achievements} />;

      case 'Savings':
        return <SavingGoalList userData={userData} />;
      
      case 'Logout':
        return (
          <LogoutSection 
            onCancel={() => setActiveSection('Dashboard')} 
          />
        );
      
      case 'Categories':
        return <Box><Typography variant="h6">Categories</Typography></Box>;
      
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
          {['Profile', 'Dashboard', 'Expenses', 'Income', 'Logout'].map((text) => (
            <ListItem button="true" key={text} onClick={() => handleSectionChange(text)}>
              <ListItemText primary={text} />
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
};

export default Dashboard;