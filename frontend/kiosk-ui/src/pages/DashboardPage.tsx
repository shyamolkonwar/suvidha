import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Box,
} from '@mui/material';
import {
    Receipt,
    Payment,
    Report,
    Speed,
    AccountCircle,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

const serviceCards = [
    { key: 'bills', icon: Receipt, color: '#1976d2', path: '/bills' },
    { key: 'payments', icon: Payment, color: '#2e7d32', path: '/payments' },
    { key: 'complaints', icon: Report, color: '#d32f2f', path: '/complaints' },
    { key: 'meter_reading', icon: Speed, color: '#ed6c02', path: '/meter-reading' },
    { key: 'my_profile', icon: AccountCircle, color: '#9c27b0', path: '/profile' },
];

export const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {t('welcome')}, {user?.consumer_id}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('dashboard')}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {serviceCards.map((service) => (
                    <Grid item xs={12} sm={6} md={4} key={service.key}>
                        <Card>
                            <CardActionArea onClick={() => navigate(service.path)}>
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        py: 4,
                                    }}
                                >
                                    <service.icon
                                        sx={{
                                            fontSize: 60,
                                            color: service.color,
                                            mb: 2,
                                        }}
                                    />
                                    <Typography variant="h6">{t(service.key)}</Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};
