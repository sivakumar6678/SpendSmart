import React from 'react';
import { Typography, Box, Button } from '@mui/material';

const LogoutSection = ({ onCancel }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Are you sure you want to logout?
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="contained" onClick={handleLogout} color="error">
          Yes
        </Button>
        <Button variant="contained" onClick={onCancel}>
          No
        </Button>
      </Box>
    </Box>
  );
};

export default LogoutSection;