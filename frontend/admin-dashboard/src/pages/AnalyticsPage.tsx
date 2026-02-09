import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    MenuItem,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../api';
import { format, subDays } from 'date-fns';

const AnalyticsPage: React.FC = () => {
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [transactionData, setTransactionData] = useState<any[]>([]);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [serviceData, setServiceData] = useState<any[]>([]);
    const [demographicsData, setDemographicsData] = useState<any[]>([]);

    useEffect(() => {
        loadAnalytics();
    }, [startDate, endDate]);

    const loadAnalytics = async () => {
        try {
            const [txRes, revRes, svcRes, demRes] = await Promise.all([
                analyticsApi.getTransactions(startDate, endDate),
                analyticsApi.getRevenue(startDate, endDate),
                analyticsApi.getServices(startDate, endDate),
                analyticsApi.getDemographics(),
            ]);

            if (txRes.data.success) {
                setTransactionData(txRes.data.data);
            }
            if (revRes.data.success) {
                setRevenueData(revRes.data.data);
            }
            if (svcRes.data.success) {
                setServiceData(svcRes.data.data);
            }
            if (demRes.data.success) {
                setDemographicsData(demRes.data.data);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    };

    const handleExport = async (reportType: string) => {
        try {
            const response = await analyticsApi.exportCsv(reportType, startDate, endDate);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportType}_${startDate}_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export data:', error);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Analytics & Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Analyze system performance and generate reports
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            type="date"
                            label="Start Date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type="date"
                            label="End Date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => handleExport('transactions')}
                        >
                            Export Transactions
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => handleExport('revenue')}
                        >
                            Export Revenue
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Transaction Trends
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={transactionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="Transactions" />
                                    <Line type="monotone" dataKey="total" stroke="#82ca9d" name="Revenue (₹)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Revenue by Utility Type
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="utility_type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue (₹)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                User Language Preferences
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={demographicsData}
                                        dataKey="count"
                                        nameKey="language_preference"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {demographicsData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Service Usage
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={serviceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="service" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#82ca9d" name="Usage Count" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnalyticsPage;
