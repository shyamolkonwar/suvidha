import apiClient from './client';

// Auth APIs
export const authApi = {
    login: (consumerId: string, password: string) =>
        apiClient.post('/auth/login', { consumer_id: consumerId, password }),

    verify: () =>
        apiClient.get('/auth/verify'),
};

// Monitor APIs
export const monitorApi = {
    getKiosks: (status?: string) =>
        apiClient.get('/monitor/kiosks', { params: { status } }),

    getKioskDetails: (kioskId: string) =>
        apiClient.get(`/monitor/kiosks/${kioskId}`),

    getAlerts: (resolved?: boolean, severity?: string) =>
        apiClient.get('/monitor/alerts', { params: { resolved, severity } }),

    resolveAlert: (alertId: string) =>
        apiClient.put(`/monitor/alerts/${alertId}/resolve`),

    getStats: () =>
        apiClient.get('/monitor/stats'),
};

// CMS APIs
export const cmsApi = {
    // Announcements
    getAnnouncements: (active?: boolean, type?: string) =>
        apiClient.get('/cms/announcements', { params: { active, type } }),

    createAnnouncement: (data: any) =>
        apiClient.post('/cms/announcements', data),

    updateAnnouncement: (id: string, data: any) =>
        apiClient.put(`/cms/announcements/${id}`, data),

    deleteAnnouncement: (id: string) =>
        apiClient.delete(`/cms/announcements/${id}`),

    // Banners
    getBanners: (active?: boolean, position?: string) =>
        apiClient.get('/cms/banners', { params: { active, position } }),

    createBanner: (data: any) =>
        apiClient.post('/cms/banners', data),

    updateBanner: (id: string, data: any) =>
        apiClient.put(`/cms/banners/${id}`, data),

    deleteBanner: (id: string) =>
        apiClient.delete(`/cms/banners/${id}`),
};

// Analytics APIs
export const analyticsApi = {
    getDashboard: () =>
        apiClient.get('/analytics/dashboard'),

    getTransactions: (startDate: string, endDate: string) =>
        apiClient.get('/analytics/transactions', { params: { start_date: startDate, end_date: endDate } }),

    getRevenue: (startDate: string, endDate: string) =>
        apiClient.get('/analytics/revenue', { params: { start_date: startDate, end_date: endDate } }),

    getServices: (startDate: string, endDate: string) =>
        apiClient.get('/analytics/services', { params: { start_date: startDate, end_date: endDate } }),

    getDemographics: () =>
        apiClient.get('/analytics/demographics'),

    exportCsv: (reportType: string, startDate: string, endDate: string) =>
        apiClient.get('/analytics/export/csv', {
            params: { report_type: reportType, start_date: startDate, end_date: endDate },
            responseType: 'blob',
        }),
};

// Utility APIs (for admin use)
export const utilityApi = {
    getBills: (consumerId: string, utilityType?: string) =>
        apiClient.get('/utility/bills', { params: { consumer_id: consumerId, utility_type: utilityType } }),
};

// Grievance APIs (for admin use)
export const grievanceApi = {
    getComplaints: (status?: string) =>
        apiClient.get('/grievance/complaints', { params: { status } }),

    updateComplaintStatus: (id: string, status: string, resolution?: string) =>
        apiClient.put(`/grievance/complaints/${id}/status`, { status, resolution }),
};
