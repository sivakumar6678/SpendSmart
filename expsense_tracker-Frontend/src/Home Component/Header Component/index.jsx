import React, { useState } from 'react';
import { AppBar, Button, Toolbar, Typography,Collapse } from '@mui/material';
import Login_Register from '../../Login Component';
import './Header.css';

function HeaderComponent() {
    const [showLogin, setShowLogin] = useState(false);

    const handleLoginClick = () => {
        setShowLogin(!showLogin);
    };

    return (
        <header>
            <nav>
                <AppBar id='header' color='none'>
                    <Toolbar>
                        <Typography id='brand' variant="h4" component="div" sx={{ flexGrow: 1 }}>
                            Welcome to SpendSmart
                        </Typography>
                        
                        <Button
                            id='login'
                            color="secondary"
                            size='medium'
                            onClick={handleLoginClick}
                        >
                            Login
                        </Button>
                    </Toolbar>
                </AppBar>
            </nav>
            <Collapse in={showLogin}>
               <Login_Register />
            </Collapse>
        </header>
    );
}

export default HeaderComponent;