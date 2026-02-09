import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Computer, CheckCircle, Error as ErrorIcon, Refresh } from '@mui/icons-material';
import { monitorApi } from '../api';
import { format } from 'date-fns';

const MonitoringPage: React.FC = () => {
    const [tab, setTab] = useState(0);
    const [kiosks, setKiosks] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [tab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (tab === 0) {
                // Load kiosks
                const res = await monitorApi.getKiosks();
                if (res.data.success) {
                    setKiosks(res.data.data);
                }
            } else {
                // Load alerts
                const res = await monitorApi.getAlerts(false);
                if (res.data.success) {
                    setAlerts(res.data.data);
                }
            }
        } catch (error) {
            console.error('Failed to load monitoring data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveAlert = async (alertId: string) => {
        try {
            await monitorApi.resolveAlert(alertId);
            loadData(); // Reload
        } catch (error) {
            console.error('Failed to resolve alert:', error);
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'ONLINE' ? 'success' : 'error';
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'error';
            case 'HIGH': return 'warning';
            case 'MEDIUM': return 'info';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Kiosk Monitoring
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Monitor kiosk health and system alerts
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="Kiosks" icon={<Computer />} iconPosition="start" />
                    <Tab label="Alerts" icon={<ErrorIcon />} iconPosition="start" />
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {tab === 0 && (
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">All Kiosks</Typography>
                                    <Button startIcon={<Refresh />} onClick={loadData}>
                                        Refresh
                                    </Button>
                                </Box>

                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Kiosk ID</TableCell>
                                                <TableCell>Location</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Last Heartbeat</TableCell>
                                                <TableCell>Version</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {kiosks.map((kiosk) => (
                                                <TableRow key={kiosk.id}>
                                                    <TableCell>{kiosk.kiosk_id}</TableCell>
                                                    <TableCell>{kiosk.location || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={kiosk.status}
                                                            color={getStatusColor(kiosk.status)}
                                                            size="small"
                                                            icon={kiosk.status === 'ONLINE' ? <CheckCircle /> : <ErrorIcon />}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {kiosk.last_heartbeat
                                                            ? format(new Date(kiosk.last_heartbeat), 'MMM dd, yyyy HH:mm')
                                                            : 'Never'}
                                                    </TableCell>
                                                    <TableCell>{kiosk.version || 'N/A'}</TableCell>
                                                </TableRow>
                                            ))}
                                            {kiosks.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center">
                                                        No kiosks found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    )}

                    {tab === 1 && (
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">Active Alerts</Typography>
                                    <Button startIcon={<Refresh />} onClick={loadData}>
                                        Refresh
                                    </Button>
                                </Box>

                                {alerts.length === 0 ? (
                                    <Alert severity="success">No active alerts!</Alert>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Kiosk</TableCell>
                                                    <TableCell>Location</TableCell>
                                                    <TableCell>Type</TableCell>
                                                    <TableCell>Severity</TableCell>
                                                    <TableCell>Message</TableCell>
                                                    <TableCell>Created</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {alerts.map((alert) => (
                                                    <TableRow key={alert.id}>
                                                        <TableCell>{alert.kiosk_id}</TableCell>
                                                        <TableCell>{alert.location || 'N/A'}</TableCell>
                                                        <TableCell>{alert.alert_type}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={alert.severity}
                                                                color={getSeverityColor(alert.severity)}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>{alert.message}</TableCell>
                                                        <TableCell>
                                                            {format(new Date(alert.created_at), 'MMM dd, HH:mm')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={() => handleResolveAlert(alert.id)}
                                                            >
                                                                Resolve
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </Box>
    );
};

export default MonitoringPage;
