import React, { useState } from 'react';
import { Button, TextField, Typography, Container, Box, Paper, Collapse, Snackbar, Alert } from '@mui/material';
import './Login.css';

function Login_Register() {
    const [loginActive, setLoginActive] = useState(false);
    const [signupActive, setSignupActive] = useState(false);
    const [forgotPasswordActive, setForgotPasswordActive] = useState(false);
    const [severity, setSeverity] = useState("success");
    const [message, setMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar open state

    const [signupFormData, setSignupFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        passwordsMatch: true,
    });
    const [resetPasswordFormData, setResetPasswordFormData] = useState({
        email: '',
        newPassword: '',
        confirmNewPassword: '',
        passwordsMatch: true,
    });

    const handleLoginClick = () => {
        setLoginActive(!loginActive);
        setSignupActive(false);
        setForgotPasswordActive(false);
    };

    const handleSignupClick = () => {
        setSignupActive(!signupActive);
        setLoginActive(false);
        setForgotPasswordActive(false);
    };

    const handleForgotPasswordClick = () => {
        setForgotPasswordActive(!forgotPasswordActive);
        setLoginActive(false);
        setSignupActive(false);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;
        try {
            const response = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Login successful:', data);
                setMessage("User  Logged in successfully!");
                setSeverity("success");
                setSnackbarOpen(true); // Show Snackbar
                localStorage.setItem('token', data.token); // Store token in localStorage
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 3000);
            } else {
                console.error('Login error:', data.error);
                setMessage(data.error || "Login failed");
                setSeverity("error");
                setSnackbarOpen(true); // Show Snackbar
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage("An error occurred during login");
            setSeverity("error");
            setSnackbarOpen(true); // Show Snackbar
        }
    };

    const handleSignupSubmit = async (event) => {
        event.preventDefault();
        if (!signupFormData.passwordsMatch) {
            console.error("Passwords do not match");
            setMessage("Passwords do not match");
            setSeverity("error");
            setSnackbarOpen(true); // Show Snackbar
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:5000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupFormData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Signup error:', errorData.error || 'An error occurred');
                setMessage(errorData.error || "Signup failed");
                setSeverity("error");
                setSnackbarOpen(true); // Show Snackbar
                return;
            }
            setSignupActive(false);
            setTimeout(() => {
                
                setLoginActive(true);
            }, 2000);
            const data = await response.json().catch(() => ({}));
            setMessage("User  Registered successfully!");
            setSeverity("success");
            setSnackbarOpen(true); // Show Snackbar
            console.log('Signup successful :', data);
            setSignupFormData({
                username: '',
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                passwordsMatch: true,
            });
        } catch (error) {
            console.error('Signup error:', error);
            setMessage("Registration Error");
            setSeverity("error");
            setSnackbarOpen(true); // Show Snackbar
        }
    };

    const handleSignupChange = (event) => {
        const { name, value } = event.target;
        const updatedFormData = { ...signupFormData, [name]: value };

        if (name === "confirmPassword" || name === "password") {
            updatedFormData.passwordsMatch = updatedFormData.password === updatedFormData.confirmPassword;
        }

        setSignupFormData(updatedFormData);
    };

    const handleResetPasswordChange = (event) => {
        const { name, value } = event.target;
        const updatedFormData = { ...resetPasswordFormData, [name]: value };

        if (name === "confirmNewPassword" || name === "newPassword") {
            updatedFormData.passwordsMatch = updatedFormData.newPassword === updatedFormData.confirmNewPassword;
        }

        setResetPasswordFormData(updatedFormData);
    };

    const handleResetPasswordSubmit = async (event) => {
        event.preventDefault();
        if (!resetPasswordFormData.passwordsMatch) {
            console.error("Passwords do not match");
            setMessage("Passwords do not match");
            setSeverity("error");
            setSnackbarOpen(true); // Show Snackbar
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:5000/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resetPasswordFormData),
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Reset password successful:', data);
                setMessage("Reset password successfully!");
                setSeverity("success");
                setSnackbarOpen(true); // Show Snackbar
            } else {
                console.error('Reset password error:', data.error);
                setMessage("Reset password Error!");
                setSeverity("error");
                setSnackbarOpen(true); // Show Snackbar
            }
            setResetPasswordFormData({
                email: '',
                newPassword: '',
                confirmNewPassword: '',
                passwordsMatch: true,
            });
        } catch (error) {
            console.error('Reset password error:', error);
            setMessage("An error occurred during password reset");
            setSeverity("error");
            setSnackbarOpen(true); // Show Snackbar
        }
    };

    return (
        <Container style={{ maxWidth: '100%' }} className="login-register-container">
            <Box display="flex" justifyContent="center" mb={2}>
                <Button variant="contained" color="success" onClick={handleLoginClick}>Log In</Button>
                <Button variant="contained" color="success" onClick={handleSignupClick} sx={{ ml: 2 }}>Sign Up</Button>
            </Box>

            <Collapse in={loginActive}>
                <Paper component="form" onSubmit={handleLoginSubmit} className="form" sx={{ p: 2 }}>
                    <Typography variant="h5">Login</Typography>
                    <TextField name="email" type="email" label="Email" fullWidth required margin="normal" />
                    <TextField name="password" type="password" label="Password" fullWidth required margin="normal" />
                    <Button type="submit" variant="contained" color="secondary" fullWidth>Login</Button>
                    <Button type="button" onClick={handleForgotPasswordClick} fullWidth sx={{ mt: 1 }} color="secondary">Forgot Password?</Button>
                </Paper>
            </Collapse>

            <Collapse in={signupActive}>
                <Paper component="form" onSubmit={handleSignupSubmit} className="form" sx={{ p: 2 }}>
                    <Typography variant="h5">Sign Up</Typography>
                    <TextField name="username" label="Username" fullWidth onChange={handleSignupChange} margin="normal" />
                    <TextField name="fullName" label="Full Name" fullWidth onChange={handleSignupChange} margin="normal" />
                    <TextField name="email" label="Email" type="email" fullWidth onChange={handleSignupChange} margin="normal" />
                    <TextField name="password" label="Password" type="password" fullWidth onChange={handleSignupChange} margin="normal" />
                    <TextField name="confirmPassword" label="Confirm Password" type="password" fullWidth onChange={handleSignupChange} margin="normal" />
                    {!signupFormData.passwordsMatch && <Typography color="error">Passwords do not match</Typography>}
                    <Button type="submit" variant="contained" color="secondary" fullWidth>Register</Button>
                </Paper>
            </Collapse>

            <Collapse in={forgotPasswordActive}>
                <Paper component="form" onSubmit={handleResetPasswordSubmit} className="form" sx={{ p: 2 }}>
                    <Typography variant="h5">Reset Password</Typography>
                    <TextField name="email" label="Email" type="email" fullWidth onChange={handleResetPasswordChange} margin="normal" />
                    <TextField name="newPassword" label="New Password" type="password" fullWidth onChange={handleResetPasswordChange} margin="normal" />
                    <TextField name="confirmNewPassword" label="Confirm New Password" type="password" fullWidth onChange={handleResetPasswordChange} margin="normal" />
                    {!resetPasswordFormData.passwordsMatch && <Typography color="error">Passwords do not match</Typography>}
                    <Button type="submit" variant="contained" color="secondary" fullWidth>Reset Password</Button>
                </Paper>
            </Collapse>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default Login_Register;