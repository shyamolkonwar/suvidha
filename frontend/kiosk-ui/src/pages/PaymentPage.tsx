import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { utilityAPI, paymentAPI } from '../api';
import { useAuthStore } from '../store/authStore';

interface Bill {
    id: string;
    billing_period: string;
    units_consumed: number;
    amount_due: number;
    due_date: string;
    status: string;
}

export const PaymentPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = useAuthStore((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [bills, setBills] = useState<Bill[]>([]);
    const [selectedBills, setSelectedBills] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchPendingBills();
        const billId = searchParams.get('bill');
        if (billId) {
            setSelectedBills([billId]);
        }
    }, []);

    const fetchPendingBills = async () => {
        setLoading(true);
        try {
            const response = await utilityAPI.getBills(user!.consumer_id);
            if (response.success) {
                const allBills = [
                    ...(response.data.electricity || []),
                    ...(response.data.gas || []),
                    ...(response.data.water || []),
                ].filter((bill: Bill) => bill.status === 'PENDING');
                setBills(allBills);
            }
        } catch (err) {
            setError('Failed to load bills');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBill = (billId: string) => {
        setSelectedBills((prev) =>
            prev.includes(billId)
                ? prev.filter((id) => id !== billId)
                : [...prev, billId]
        );
    };

    const calculateTotal = () => {
        return bills
            .filter((bill) => selectedBills.includes(bill.id))
            .reduce((sum, bill) => sum + bill.amount_due, 0);
    };

    const handlePayment = async () => {
        if (selectedBills.length === 0) {
            setError('Please select at least one bill');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            // Initiate payment
            const initResponse = await paymentAPI.initiatePayment({
                consumer_id: user!.consumer_id,
                amount: calculateTotal(),
                bill_ids: selectedBills,
                payment_method: 'MOCK',
                kiosk_id: import.meta.env.VITE_KIOSK_ID || 'KIOSK_DEV_01',
            });

            if (initResponse.success) {
                // Immediately verify (for mock gateway)
                const verifyResponse = await paymentAPI.verifyPayment({
                    transaction_id: initResponse.data.transaction_id,
                    payment_id: `MOCK_PAY_${Date.now()}`,
                });

                if (verifyResponse.success && verifyResponse.data.success) {
                    setSuccess(true);
                    setTimeout(() => {
                        navigate('/bills');
                    }, 2000);
                } else {
                    setError('Payment verification failed');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                {t('pay_bills')}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {t('payment_success')}! Redirecting...
                </Alert>
            )}

            {bills.length === 0 ? (
                <Alert severity="info">No pending bills to pay</Alert>
            ) : (
                <>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {t('select_bills')}
                    </Typography>

                    {bills.map((bill) => (
                        <Card key={bill.id} sx={{ mb: 2 }}>
                            <CardContent>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedBills.includes(bill.id)}
                                            onChange={() => handleToggleBill(bill.id)}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="h6">₹{bill.amount_due.toFixed(2)}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Period: {new Date(bill.billing_period).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Due: {new Date(bill.due_date).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </CardContent>
                        </Card>
                    ))}

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5">{t('total_amount')}:</Typography>
                        <Typography variant="h5" color="primary">
                            ₹{calculateTotal().toFixed(2)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handlePayment}
                            disabled={processing || selectedBills.length === 0}
                        >
                            {processing ? <CircularProgress size={24} /> : t('proceed_to_pay')}
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            size="large"
                            onClick={() => navigate('/dashboard')}
                        >
                            {t('cancel')}
                        </Button>
                    </Box>
                </>
            )}
        </Container>
    );
};
