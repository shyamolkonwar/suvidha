import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
    const [consumerId, setConsumerId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authApi.login(consumerId, password);

            if (response.data.success) {
                const { user, token } = response.data.data;
                setAuth(user, token);
                navigate('/');
            } else {
                setError(response.data.error || 'Login failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Card sx={{ width: '100%', maxWidth: 500 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <LoginIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" gutterBottom>
                                Admin Login
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                SUVIDHA Kiosk Management System
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Admin ID"
                                value={consumerId}
                                onChange={(e) => setConsumerId(e.target.value)}
                                required
                                margin="normal"
                                autoFocus
                            />

                            <TextField
                                fullWidth
                                type="password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                margin="normal"
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 3 }}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>

                        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block', textAlign: 'center' }}>
                            For admin access only
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default LoginPage;
