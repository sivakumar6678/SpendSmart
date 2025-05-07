import React from 'react';
import { Typography, Box, TextField, Button } from '@mui/material';

const EditProfileSection = ({ userData, onUpdateProfile, onCancel }) => {
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

      if (!response.ok) throw new Error('Error updating profile');

      const updatedData = await response.json();
      onUpdateProfile(updatedData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again later.');
    }
  };

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