import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2E3B55', // Deep Royal Blue
            light: '#536894',
            dark: '#1C2538',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#10B981', // Vibrant Emerald
            light: '#34D399',
            dark: '#059669',
            contrastText: '#ffffff',
        },
        background: {
            default: '#F3F4F6', // Light Gray for depth
            paper: '#FFFFFF',
        },
        text: {
            primary: '#111827', // Nearly black
            secondary: '#6B7280', // Cool gray
        },
        error: {
            main: '#EF4444',
        },
        warning: {
            main: '#F59E0B',
        },
        info: {
            main: '#3B82F6',
        },
        success: {
            main: '#10B981',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
            letterSpacing: '-0.01em',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        },
        button: {
            textTransform: 'none', // Remove uppercase from buttons
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12, // More rounded corners
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    padding: '8px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #2E3B55 0%, #1C2538 100%)',
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Remove default gradient in dark mode if switched
                },
                elevation1: {
                    boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.05)', // Soft shadow
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '& fieldset': {
                            borderColor: '#E5E7EB',
                        },
                        '&:hover fieldset': {
                            borderColor: '#2E3B55',
                        },
                    },
                },
            },
        },
    },
});

export default theme;
