import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  useTheme,
  useMediaQuery,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalanceWallet as IncomeIcon,
  ShoppingCart as ExpenseIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Category as CategoryIcon,
  EmojiEvents as AchievementsIcon,
  Savings as SavingsIcon,
  Insights as InsightsIcon,
  Notifications as NotificationsIcon,
  AccountBalance as BudgetIcon,
} from '@mui/icons-material';

// Components
import DashboardOverview from './components/DashboardOverview';
import IncomeForm from './Income';
import ExpenseForm from './Expense';
import ProfileSection from './components/ProfileSection';
import EditProfileSection from './components/EditProfileSection';
import LogoutSection from './components/LogoutSection';
import useDashboardData from './hooks/useDashboardData';

// Feature Components
import { AppProvider, useAppContext } from './context/AppContext';
import BudgetList from './components/Budget/BudgetList';
import SavingGoalList from './components/SavingGoals/SavingGoalList';
import AchievementsList from './components/Achievements/AchievementsList';
import FinancialInsights from './components/Insights/FinancialInsights';
import NotificationCenter from './components/Notifications/NotificationCenter';
import CategoriesSection from './components/Categories/CategoriesSection';

const drawerWidth = 280;

function DashboardContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Dashboard');
  const { userData, incomeData, expenseData, isLoading, error, updateUserData, refreshData } = useDashboardData();
  const { unreadNotifications } = useAppContext();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (isMobile) setMobileOpen(false);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, section: 'Dashboard' },
    { text: 'Profile', icon: <ProfileIcon />, section: 'Profile' },
    { text: 'Income', icon: <IncomeIcon />, section: 'Income' },
    { text: 'Expenses', icon: <ExpenseIcon />, section: 'Expenses' },
    { type: 'divider' },
    { text: 'Categories', icon: <CategoryIcon />, section: 'Categories' },
    { text: 'Budgeting', icon: <BudgetIcon />, section: 'Budgeting' },
    { text: 'Saving Goals', icon: <SavingsIcon />, section: 'Saving Goals' },
    { text: 'Achievements', icon: <AchievementsIcon />, section: 'Achievements' },
    { text: 'Insights', icon: <InsightsIcon />, section: 'Insights' },
    { text: 'Notifications', icon: <NotificationsIcon />, section: 'NotificationCenter' },
    { type: 'divider' },
    { text: 'Logout', icon: <LogoutIcon />, section: 'Logout', color: 'error.main' },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          SpendSmart
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={userData?.profilePic ? `http://127.0.0.1:5000/${userData.profilePic}` : undefined}
          sx={{ width: 48, height: 48 }}
        >
          {userData?.fullName?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="600" noWrap>
            {userData?.fullName || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {userData?.email}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 2 }}>
        {menuItems.map((item, index) => {
          if (item.type === 'divider') return <Divider key={index} sx={{ my: 1 }} />;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={activeSection === item.section}
                onClick={() => handleSectionChange(item.section)}
                sx={{
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                    '&:hover': { backgroundColor: 'primary.main' }
                  }
                }}
              >
                <ListItemIcon sx={{ color: item.color || 'inherit', minWidth: 40 }}>
                  {item.section === 'NotificationCenter' ? (
                    <Badge badgeContent={unreadNotifications} color="error" max={9}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: activeSection === item.section ? 600 : 400,
                    color: item.color || 'inherit'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  const renderContent = () => {
    if (isLoading) return <Box p={4} textAlign="center"><Typography>Loading...</Typography></Box>;
    if (error) return <Box p={4} textAlign="center" color="error.main"><Typography>Error: {error}</Typography></Box>;

    switch (activeSection) {
      case 'Dashboard':
        return <DashboardOverview incomeData={incomeData} expenseData={expenseData} />;
      case 'Income':
        return <IncomeForm onSuccess={refreshData} />;
      case 'Expenses':
        return <ExpenseForm onSuccess={refreshData} />;
      case 'Profile':
        return <ProfileSection userData={userData} onEditProfile={() => setActiveSection('EditProfile')} />;
      case 'EditProfile':
        return <EditProfileSection userData={userData} onUpdateProfile={refreshData} onCancel={() => setActiveSection('Profile')} />;
      case 'Logout':
        return <LogoutSection onCancel={() => setActiveSection('Dashboard')} />;
      case 'Categories':
        return <CategoriesSection />;
      case 'Budgeting':
        return <BudgetList />;
      case 'Saving Goals':
        return <SavingGoalList />;
      case 'Achievements':
        return <AchievementsList />;
      case 'Insights':
        return <FinancialInsights />;
      case 'NotificationCenter':
        return <NotificationCenter />;
      default:
        return <DashboardOverview incomeData={incomeData} expenseData={expenseData} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {activeSection === 'NotificationCenter' ? 'Notifications' : activeSection}
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => handleSectionChange('NotificationCenter')}
          >
            <Badge badgeContent={unreadNotifications} color="error" max={9}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(0,0,0,0.08)' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, overflow: 'auto' }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
}

function Dashboard() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}

export default Dashboard;