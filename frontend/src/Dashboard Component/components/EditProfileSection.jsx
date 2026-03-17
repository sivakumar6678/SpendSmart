import React, { useState } from 'react';
import {
  Typography, Box, TextField, Button, MenuItem,
  Avatar, Alert, CircularProgress, Paper, Grid
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, PhotoCamera as CameraIcon } from '@mui/icons-material';

const EditProfileSection = ({ userData, onUpdateProfile, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    email: userData?.email || '',
    gender: userData?.gender || '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    userData?.profilePic ? `http://127.0.0.1:5000/${userData.profilePic}` : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated. Please log in again.');

      // Use FormData because the route accepts multipart (for image upload)
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('gender', formData.gender);
      if (profileImage) {
        data.append('profileImage', profileImage);
      }

      const response = await fetch('http://127.0.0.1:5000/api/update-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set Content-Type — browser sets it automatically with boundary for FormData
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      // Notify parent to refresh user data
      if (onUpdateProfile) onUpdateProfile();

      // Go back to profile view after short delay
      setTimeout(() => onCancel?.(), 1200);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Edit Profile
      </Typography>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Avatar upload */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar
              src={previewUrl}
              sx={{ width: 100, height: 100, fontSize: 40, bgcolor: 'primary.main' }}
            >
              {formData.fullName?.charAt(0)}
            </Avatar>
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CameraIcon />}
                size="small"
              >
                Change Photo
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                JPG, PNG up to 5MB
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              >
                <MenuItem value="">Prefer not to say</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditProfileSection;