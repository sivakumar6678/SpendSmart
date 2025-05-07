import React from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import userImage from '../../assets/userimage.jpg';

const ProfileSection = ({ userData, onEditProfile }) => {
  return (
    <Box sx={{ textAlign: 'center', mt: 3 }}>
      <Paper elevation={3} sx={{ padding: 3, borderRadius: '16px', backgroundColor: '#f9f9f9' }}>
        <img
          src={userImage}
          alt="Profile"
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            marginBottom: '20px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#3f51b5' }}>
          <b>Name:</b> {userData.fullName}
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
          Account Balance: ₹ {userData.accountBalance.toFixed(2)}
        </Typography>

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={onEditProfile}
            sx={{ mr: 2, borderRadius: '8px', padding: '10px 20px' }}
          >
            Edit Profile
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileSection;