import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Logout, Language } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BillsPage } from './pages/BillsPage';
import { PaymentPage } from './pages/PaymentPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { MeterReadingPage } from './pages/MeterReadingPage';
import { ProfilePage } from './pages/ProfilePage';
import { useAuthStore } from './store/authStore';
import { authAPI } from './api';

const App: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { isAuthenticated, logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logout();
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {isAuthenticated && (
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            SUVIDHA
                        </Typography>
                        <IconButton
                            color="inherit"
                            onClick={toggleLanguage}
                            sx={{ mr: 2 }}
                        >
                            <Language />
                        </IconButton>
                        <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
                            {t('logout')}
                        </Button>
                    </Toolbar>
                </AppBar>
            )}

            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
                <Routes>
                    <Route
                        path="/login"
                        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />}
                    />
                    <Route
                        path="/dashboard"
                        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/bills"
                        element={isAuthenticated ? <BillsPage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/payment"
                        element={isAuthenticated ? <PaymentPage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/complaints"
                        element={isAuthenticated ? <ComplaintsPage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/meter-reading"
                        element={isAuthenticated ? <MeterReadingPage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/profile"
                        element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/"
                        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
                    />
                </Routes>
            </Box>
        </Box>
    );
};

export default App;
