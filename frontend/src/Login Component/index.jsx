import React, { useState } from 'react';
import {
    Button,
    TextField,
    Typography,
    Box,
    Paper,
    Fade,
    Snackbar,
    Alert,
    IconButton,
    InputAdornment,
    Grid,
    Link
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login_Register() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Form Data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        fullName: '',
        confirmPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleToggleMode = (mode) => {
        setFormData({
            email: '',
            password: '',
            username: '',
            fullName: '',
            confirmPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        });

        if (mode === 'login') {
            setIsLogin(true);
            setIsForgotPassword(false);
        } else if (mode === 'signup') {
            setIsLogin(false);
            setIsForgotPassword(false);
        } else if (mode === 'forgot') {
            setIsForgotPassword(true);
            setIsLogin(false);
        }
    };

    const showNotification = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const API_BASE_URL = 'http://127.0.0.1:5000/api'; // In real app, move to config

        try {
            let endpoint = '';
            let payload = {};

            if (isForgotPassword) {
                if (formData.newPassword !== formData.confirmNewPassword) {
                    showNotification("Passwords do not match", "error");
                    setLoading(false);
                    return;
                }
                endpoint = '/reset-password';
                payload = {
                    email: formData.email,
                    newPassword: formData.newPassword,
                    confirmNewPassword: formData.confirmNewPassword
                };
            } else if (isLogin) {
                endpoint = '/login';
                payload = { email: formData.email, password: formData.password };
            } else {
                if (formData.password !== formData.confirmPassword) {
                    showNotification("Passwords do not match", "error");
                    setLoading(false);
                    return;
                }
                endpoint = '/signup';
                payload = {
                    username: formData.username,
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password
                };
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            if (isLogin) {
                localStorage.setItem('token', data.token);
                showNotification("Welcome back! Redirecting...", "success");
                setTimeout(() => navigate('/dashboard'), 1500);
            } else if (isForgotPassword) {
                showNotification("Password reset successful! Please login.", "success");
                setTimeout(() => handleToggleMode('login'), 2000);
            } else {
                showNotification("Account created! Please login.", "success");
                setTimeout(() => handleToggleMode('login'), 2000);
            }

        } catch (error) {
            console.error(error);
            showNotification(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        if (isForgotPassword) {
            return (
                <>
                    <Typography variant="h4" fontWeight="700" color="primary" sx={{ mb: 1 }}>Reset Password</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Enter your email and new password</Typography>

                    <TextField
                        fullWidth label="Email Address" name="email" type="email"
                        value={formData.email} onChange={handleChange} margin="normal" required
                        InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}
                    />
                    <TextField
                        fullWidth label="New Password" name="newPassword" type={showPassword ? "text" : "password"}
                        value={formData.newPassword} onChange={handleChange} margin="normal" required
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                            endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                        }}
                    />
                    <TextField
                        fullWidth label="Confirm Password" name="confirmNewPassword" type="password"
                        value={formData.confirmNewPassword} onChange={handleChange} margin="normal" required
                        InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }}
                    />

                    <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? 'Processing...' : 'Reset Password'}
                    </Button>

                    <Box textAlign="center">
                        <Link component="button" variant="body2" onClick={() => handleToggleMode('login')} underline="hover">
                            Back to Login
                        </Link>
                    </Box>
                </>
            );
        }

        if (isLogin) {
            return (
                <>
                    <Typography variant="h4" fontWeight="700" color="primary" sx={{ mb: 1 }}>Welcome Back!</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Please sign in to continue</Typography>

                    <TextField
                        fullWidth label="Email Address" name="email" type="email"
                        value={formData.email} onChange={handleChange} margin="normal" required
                        InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}
                    />
                    <TextField
                        fullWidth label="Password" name="password" type={showPassword ? "text" : "password"}
                        value={formData.password} onChange={handleChange} margin="normal" required
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                            endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                        }}
                    />

                    <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
                        <Link component="button" variant="body2" onClick={() => handleToggleMode('forgot')} underline="hover">
                            Forgot Password?
                        </Link>
                    </Box>

                    <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>

                    <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account? {' '}
                            <Link component="button" variant="body2" fontWeight="600" onClick={() => handleToggleMode('signup')} underline="hover">
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                </>
            );
        }

        return (
            <>
                <Typography variant="h4" fontWeight="700" color="primary" sx={{ mb: 1 }}>Create Account</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Join SpendSmart today</Typography>

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth label="Username" name="username"
                            value={formData.username} onChange={handleChange} margin="dense" required
                            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth label="Full Name" name="fullName"
                            value={formData.fullName} onChange={handleChange} margin="dense" required
                        />
                    </Grid>
                </Grid>

                <TextField
                    fullWidth label="Email Address" name="email" type="email"
                    value={formData.email} onChange={handleChange} margin="dense" required
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}
                />
                <TextField
                    fullWidth label="Password" name="password" type={showPassword ? "text" : "password"}
                    value={formData.password} onChange={handleChange} margin="dense" required
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                        endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                    }}
                />
                <TextField
                    fullWidth label="Confirm Password" name="confirmPassword" type="password"
                    value={formData.confirmPassword} onChange={handleChange} margin="dense" required
                    InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }}
                />

                <Button type="submit" fullWidth variant="contained" color="secondary" size="large" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>

                <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                        Already have an account? {' '}
                        <Link component="button" variant="body2" fontWeight="600" onClick={() => handleToggleMode('login')} underline="hover">
                            Sign In
                        </Link>
                    </Typography>
                </Box>
            </>
        );
    };

    return (
        <div className="login-container-root">
            <Fade in={true} timeout={800}>
                <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 4, zIndex: 1 }}>
                    <form onSubmit={handleSubmit}>
                        {renderForm()}
                    </form>
                </Paper>
            </Fade>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default Login_Register;