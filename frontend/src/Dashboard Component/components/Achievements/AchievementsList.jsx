import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  AttachMoney as MoneyIcon,
  Savings as SavingsIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';

const AchievementsList = () => {
  const { achievements, loading } = useAppContext();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No achievements unlocked yet. Keep using the app to earn badges!
        </Typography>
      </Paper>
    );
  }

  // Get icon and color based on badge type
  const getBadgeProps = (type) => {
    switch (type) {
      case 'budget_master':
        return { icon: <MoneyIcon />, color: '#4caf50', label: 'Budget Master' };
      case 'saving_goal_achieved':
        return { icon: <SavingsIcon />, color: '#2196f3', label: 'Goal Achieved' };
      case 'streak_master':
        return { icon: <TrendingUpIcon />, color: '#ff9800', label: 'Streak Master' };
      case 'perfect_month':
        return { icon: <CheckCircleIcon />, color: '#9c27b0', label: 'Perfect Month' };
      default:
        return { icon: <TrophyIcon />, color: '#f44336', label: 'Achievement' };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Your Achievements
      </Typography>
      
      <Grid container spacing={3}>
        {achievements.map((achievement) => {
          const { icon, color, label } = getBadgeProps(achievement.badge_type);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={achievement.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: color,
                        width: 56,
                        height: 56,
                        mr: 2
                      }}
                    >
                      {icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3">
                        {achievement.title}
                      </Typography>
                      <Chip
                        label={label}
                        size="small"
                        sx={{ mt: 0.5, bgcolor: `${color}20`, color: color }}
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {achievement.description}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    Earned on {formatDate(achievement.date_earned)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default AchievementsList;