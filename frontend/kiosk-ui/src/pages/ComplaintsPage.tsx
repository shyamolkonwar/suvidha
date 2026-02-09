import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    Alert,
    Snackbar,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { grievanceAPI } from '../api';
import { useAuthStore } from '../store/authStore';

const categories = [
    { value: 'billing', label: 'Billing Issues' },
    { value: 'supply', label: 'Supply Issues' },
    { value: 'quality', label: 'Quality Issues' },
    { value: 'meter', label: 'Meter Issues' },
    { value: 'connection', label: 'Connection Issues' },
    { value: 'other', label: 'Other' },
];

const priorities = [
    { value: 'LOW', label: 'Low' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
];

export const ComplaintsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [category, setCategory] = useState('billing');
    const [priority, setPriority] = useState('NORMAL');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await grievanceAPI.fileComplaint({
                consumer_id: user!.consumer_id,
                category,
                subject,
                description,
                priority,
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to file complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                {t('file_complaint')}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <TextField
                    select
                    fullWidth
                    label={t('complaint_category')}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    margin="normal"
                    required
                >
                    {categories.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    fullWidth
                    label={t('priority')}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    margin="normal"
                    required
                >
                    {priorities.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    fullWidth
                    label={t('complaint_subject')}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    margin="normal"
                    required
                />

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={t('complaint_description')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="normal"
                    required
                />

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        size="large"
                    >
                        {loading ? t('loading') : t('submit')}
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate('/dashboard')}
                        size="large"
                    >
                        {t('cancel')}
                    </Button>
                </Box>
            </Box>

            <Snackbar
                open={success}
                autoHideDuration={2000}
                message="Complaint filed successfully!"
            />
        </Container>
    );
};
