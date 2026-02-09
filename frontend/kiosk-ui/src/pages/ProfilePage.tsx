import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

export const ProfilePage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                {t('my_profile')}
            </Typography>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="overline" color="text.secondary">
                            Consumer ID
                        </Typography>
                        <Typography variant="h6">{user?.consumer_id}</Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="overline" color="text.secondary">
                            Email
                        </Typography>
                        <Typography variant="body1">{user?.email || 'Not provided'}</Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="overline" color="text.secondary">
                            Phone
                        </Typography>
                        <Typography variant="body1">{user?.phone || 'Not provided'}</Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="overline" color="text.secondary">
                            Preferred Language
                        </Typography>
                        <Typography variant="body1">
                            {user?.language_preference === 'en' ? 'English' : 'Hindi'}
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        onClick={() => navigate('/dashboard')}
                        sx={{ mt: 2 }}
                    >
                        {t('back')}
                    </Button>
                </CardContent>
            </Card>
        </Container>
    );
};
