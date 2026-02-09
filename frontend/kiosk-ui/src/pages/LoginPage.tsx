import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    MenuItem,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../api';
import { useAuthStore } from '../store/authStore';

const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
];

export const LoginPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const [consumerId, setConsumerId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login({
                consumer_id: consumerId,
                password: password,
            });

            if (response.success) {
                login(response.data.user, response.data.token);
                navigate('/dashboard');
            } else {
                setError(response.error || 'Login failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Card sx={{ width: '100%', mt: 1 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography component="h1" variant="h4" fontWeight="bold">
                                {t('welcome')}
                            </Typography>
                            <TextField
                                select
                                size="small"
                                value={i18n.language}
                                onChange={(e) => changeLanguage(e.target.value)}
                                sx={{ width: 120 }}
                            >
                                {languages.map((lang) => (
                                    <MenuItem key={lang.code} value={lang.code}>
                                        {lang.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="consumer_id"
                                label={t('consumer_id')}
                                name="consumer_id"
                                autoFocus
                                value={consumerId}
                                onChange={(e) => setConsumerId(e.target.value)}
                                disabled={loading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label={t('password')}
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                                disabled={loading}
                            >
                                {loading ? t('loading') : t('login')}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};
