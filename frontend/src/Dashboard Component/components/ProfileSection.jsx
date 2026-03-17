import React from 'react';
import {
  Typography, Box, Paper, Button, Avatar,
  Grid, Card, CardContent, Divider, Chip
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const StatCard = ({ label, value, color, icon: Icon }) => (
  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 48, height: 48, borderRadius: 2,
          bgcolor: `${color}.light`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}
      >
        <Icon sx={{ color: `${color}.main` }} />
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="h6" fontWeight="bold" color={`${color}.main`}>
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const ProfileSection = ({ userData, onEditProfile }) => {
  if (!userData) return null;

  const balance = (userData.accountBalance ?? (userData.totalIncome - userData.totalExpenses)) || 0;
  const totalIncome = userData.totalIncome || userData.totalMonthlyIncome || 0;
  const totalExpenses = userData.totalExpenses || userData.totalMonthlyExpenses || 0;
  const balanceColor = balance >= 0 ? 'success' : 'error';

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <Box>
      {/* Header card */}
      <Paper
        elevation={0}
        sx={{
          p: 4, mb: 3, borderRadius: 3,
          border: '1px solid', borderColor: 'divider',
          display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' }, gap: 3
        }}
      >
        <Avatar
          src={userData.profilePic ? `http://127.0.0.1:5000/${userData.profilePic}` : undefined}
          sx={{ width: 100, height: 100, fontSize: 40, bgcolor: 'primary.main' }}
        >
          {userData.fullName?.charAt(0)}
        </Avatar>

        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {userData.fullName}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">{userData.email}</Typography>
            </Box>
            {userData.gender && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">{userData.gender}</Typography>
              </Box>
            )}
            {userData.createdAt && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Joined {new Date(userData.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                </Typography>
              </Box>
            )}
          </Box>

          {userData.qualifications && (
            <Chip label={userData.qualifications} size="small" variant="outlined" sx={{ mr: 1 }} />
          )}

          <Box mt={2}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={onEditProfile}
              sx={{ borderRadius: 2 }}
            >
              Edit Profile
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Financial summary */}
      <Typography variant="h6" fontWeight="600" gutterBottom>
        Financial Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Net Balance (All Time)"
            value={fmt(balance)}
            color={balanceColor}
            icon={WalletIcon}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Total Income (All Time)"
            value={fmt(totalIncome)}
            color="success"
            icon={IncomeIcon}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Total Expenses (All Time)"
            value={fmt(totalExpenses)}
            color="error"
            icon={ExpenseIcon}
          />
        </Grid>
      </Grid>

      {/* Monthly comparison */}
      {(userData.totalMonthlyIncome !== undefined || userData.totalMonthlyExpenses !== undefined) && (
        <Paper
          elevation={0}
          sx={{ p: 3, mt: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
        >
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            This Month
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Income</Typography>
              <Typography variant="h6" color="success.main" fontWeight="bold">
                {fmt(userData.totalMonthlyIncome || 0)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Expenses</Typography>
              <Typography variant="h6" color="error.main" fontWeight="bold">
                {fmt(userData.totalMonthlyExpenses || 0)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default ProfileSection;