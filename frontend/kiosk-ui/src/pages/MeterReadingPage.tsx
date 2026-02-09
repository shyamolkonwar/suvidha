import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { utilityAPI } from '../api';
import { useAuthStore } from '../store/authStore';

const utilityTypes = [
    { value: 'electricity', label: 'Electricity' },
    { value: 'gas', label: 'Gas' },
    { value: 'water', label: 'Water' },
];

export const MeterReadingPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [utilityType, setUtilityType] = useState('electricity');
    const [readingValue, setReadingValue] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await utilityAPI.submitMeterReading({
                consumer_id: user!.consumer_id,
                utility_type: utilityType,
                reading_value: parseFloat(readingValue),
                notes,
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit reading');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                {t('submit_reading')}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Submit your meter reading to help us generate accurate bills
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
                    label={t('utility_type')}
                    value={utilityType}
                    onChange={(e) => setUtilityType(e.target.value)}
                    margin="normal"
                    required
                >
                    {utilityTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    fullWidth
                    type="number"
                    label={t('reading_value')}
                    value={readingValue}
                    onChange={(e) => setReadingValue(e.target.value)}
                    margin="normal"
                    required
                    inputProps={{ step: '0.01' }}
                    helperText="Enter the current reading shown on your meter"
                />

                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    margin="normal"
                    helperText="Add any additional information"
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
                message="Meter reading submitted successfully!"
            />
        </Container>
    );
};
