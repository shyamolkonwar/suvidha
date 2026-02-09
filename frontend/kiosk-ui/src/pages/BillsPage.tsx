import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { utilityAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface Bill {
    id: string;
    billing_period: string;
    units_consumed: number;
    amount_due: number;
    due_date: string;
    status: string;
}

export const BillsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [bills, setBills] = useState<{
        electricity: Bill[];
        gas: Bill[];
        water: Bill[];
    }>({ electricity: [], gas: [], water: [] });

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const response = await utilityAPI.getBills(user!.consumer_id);
            if (response.success) {
                setBills(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'OVERDUE':
                return 'error';
            default:
                return 'default';
        }
    };

    const renderBillsList = (billsList: Bill[]) => {
        if (billsList.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">{t('no_data')}</Typography>
                </Box>
            );
        }

        return (
            <Grid container spacing={2}>
                {billsList.map((bill) => (
                    <Grid item xs={12} key={bill.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">
                                        ₹{bill.amount_due.toFixed(2)}
                                    </Typography>
                                    <Chip
                                        label={bill.status}
                                        color={getStatusColor(bill.status)}
                                        size="small"
                                    />
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Billing Period
                                        </Typography>
                                        <Typography variant="body1">
                                            {new Date(bill.billing_period).toLocaleDateString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            {t('due_date')}
                                        </Typography>
                                        <Typography variant="body1">
                                            {new Date(bill.due_date).toLocaleDateString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Units Consumed
                                        </Typography>
                                        <Typography variant="body1">
                                            {bill.units_consumed}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        {bill.status === 'PENDING' && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                fullWidth
                                                onClick={() => navigate(`/payment?bill=${bill.id}`)}
                                            >
                                                {t('pay_now')}
                                            </Button>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
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
                {t('bills')}
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, v: number) => setTabValue(v)}>
                    <Tab label={t('electricity')} />
                    <Tab label={t('gas')} />
                    <Tab label={t('water')} />
                </Tabs>
            </Box>

            {tabValue === 0 && renderBillsList(bills.electricity)}
            {tabValue === 1 && renderBillsList(bills.gas)}
            {tabValue === 2 && renderBillsList(bills.water)}
        </Container>
    );
};
