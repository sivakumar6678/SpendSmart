import React from 'react';
import { Typography, Box, TextField, Button } from '@mui/material';

const EditProfileSection = ({ userData, onUpdateProfile, onCancel }) => {
  // Create a wrapper function to handle form submission
  const handleSubmit = (e) => {
    // Prevent default form submission
    e.preventDefault();
    
    // Call the parent's onUpdateProfile function with the event
    onUpdateProfile(e);
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
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
          <label style={{ marginRight: '20px' }}>
            <input 
              type="radio" 
              name="gender" 
              value="Male" 
              defaultChecked={userData.gender === 'Male'} 
            /> Male
          </label>
          <label>
            <input 
              type="radio" 
              name="gender" 
              value="Female" 
              defaultChecked={userData.gender === 'Female'} 
            /> Female
          </label>
        </Box>
        <Box mb={2}>
          <Typography variant="body1">Profile Image:</Typography>
          <input type="file" name="profileImage" accept="image/*" />
        </Box>
        <Box mb={2}>
          <Typography variant="body1">
            Date Joined: {userData.createdAt}
          </Typography>
        </Box>
        <Button type="submit" variant="contained">Save Changes</Button>
        <Button 
          variant="outlined" 
          onClick={onCancel} 
          sx={{ ml: 2 }}
        >
          Cancel
        </Button>
      </form>
    </Box>
  );
};

export default EditProfileSection;