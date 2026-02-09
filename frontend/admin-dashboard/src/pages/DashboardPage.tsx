import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
} from '@mui/material';
import {
    People,
    AttachMoney,
    Receipt,
    Warning,
    Computer,
} from '@mui/icons-material';
import { analyticsApi, monitorApi } from '../api';

interface DashboardStats {
    totalTransactions: number;
    totalRevenue: number;
    totalUsers: number;
    pendingBills: number;
    activeComplaints: number;
    onlineKiosks: number;
    totalKiosks: number;
    activeAlerts: number;
}

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [analyticsRes, monitorRes] = await Promise.all([
                analyticsApi.getDashboard(),
                monitorApi.getStats(),
            ]);

            if (analyticsRes.data.success && monitorRes.data.success) {
                const analytics = analyticsRes.data.data.totals;
                const monitor = monitorRes.data.data;

                setStats({
                    totalTransactions: analytics.transactions || 0,
                    totalRevenue: parseFloat(analytics.revenue || '0'),
                    totalUsers: analytics.users || 0,
                    pendingBills: analytics.pending_bills || 0,
                    activeComplaints: analytics.active_complaints || 0,
                    onlineKiosks: parseInt(monitor.online_kiosks || '0'),
                    totalKiosks: parseInt(monitor.total_kiosks || '0'),
                    activeAlerts: parseInt(monitor.active_alerts || '0'),
                });
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    const StatCard = ({ title, value, icon, color }: any) => (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography color="text.secondary" gutterBottom variant="overline">
                            {title}
                        </Typography>
                        <Typography variant="h4">
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{ color, opacity: 0.7 }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Overview of your SUVIDHA kiosk system
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats?.totalRevenue.toLocaleString()}`}
                        icon={<AttachMoney sx={{ fontSize: 40 }} />}
                        color="success.main"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Transactions"
                        value={stats?.totalTransactions.toLocaleString()}
                        icon={<Receipt sx={{ fontSize: 40 }} />}
                        color="primary.main"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers.toLocaleString()}
                        icon={<People sx={{ fontSize: 40 }} />}
                        color="info.main"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Alerts"
                        value={stats?.activeAlerts}
                        icon={<Warning sx={{ fontSize: 40 }} />}
                        color="error.main"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Online Kiosks"
                        value={`${stats?.onlineKiosks} / ${stats?.totalKiosks}`}
                        icon={<Computer sx={{ fontSize: 40 }} />}
                        color="success.main"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Pending Bills"
                        value={stats?.pendingBills.toLocaleString()}
                        icon={<Receipt sx={{ fontSize: 40 }} />}
                        color="warning.main"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Active Complaints"
                        value={stats?.activeComplaints}
                        icon={<Warning sx={{ fontSize: 40 }} />}
                        color="error.main"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
