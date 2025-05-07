import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Paper
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
  EmojiEvents as AchievementIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';

const NotificationCenter = () => {
  const { notifications, unreadNotifications, markNotificationsAsRead } = useAppContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // If there are unread notifications, mark them as read when opening the menu
    if (unreadNotifications > 0) {
      markNotificationsAsRead();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'budget_warning':
      case 'budget_exceeded':
      case 'budget_alert':
        return <WarningIcon color="error" />;
      case 'goal_progress':
      case 'goal_created':
        return <InfoIcon color="info" />;
      case 'goal_completed':
        return <CheckCircleIcon color="success" />;
      case 'achievement':
        return <AchievementIcon color="secondary" />;
      case 'budget_created':
        return <InfoIcon color="primary" />;
      default:
        return <LightbulbIcon color="primary" />;
    }
  };

  // Format notification date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        color="inherit"
      >
        <Badge badgeContent={unreadNotifications} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 350,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {notifications.length > 0 && (
            <Button
              startIcon={<MarkReadIcon />}
              size="small"
              onClick={() => markNotificationsAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    backgroundColor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={formatDate(notification.created_at)}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: notification.read ? 'normal' : 'medium'
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary'
                    }}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;