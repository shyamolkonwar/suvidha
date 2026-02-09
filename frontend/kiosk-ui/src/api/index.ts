import api from './client';

export interface LoginRequest {
    consumer_id: string;
    password: string;
    kiosk_id?: string;
}

export interface RegisterRequest {
    consumer_id: string;
    password: string;
    phone: string;
    email: string;
    language_preference: string;
}

export const authAPI = {
    login: async (data: LoginRequest) => {
        const response = await api.post('/api/auth/login', {
            ...data,
            kiosk_id: import.meta.env.VITE_KIOSK_ID || 'KIOSK_DEV_01',
        });
        return response.data;
    },

    register: async (data: RegisterRequest) => {
        const response = await api.post('/api/auth/register', data);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/api/auth/logout');
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },
};

export const utilityAPI = {
    getBills: async (consumerId: string, type?: string) => {
        const url = type
            ? `/api/utility/bills/${consumerId}?type=${type}`
            : `/api/utility/bills/${consumerId}`;
        const response = await api.get(url);
        return response.data;
    },

    submitMeterReading: async (data: any) => {
        const response = await api.post('/api/utility/meter-reading', data);
        return response.data;
    },

    getMeterReadings: async (consumerId: string) => {
        const response = await api.get(`/api/utility/meter-readings/${consumerId}`);
        return response.data;
    },
};

export const paymentAPI = {
    initiatePayment: async (data: any) => {
        const response = await api.post('/api/payment/initiate', data);
        return response.data;
    },

    verifyPayment: async (data: any) => {
        const response = await api.post('/api/payment/verify', data);
        return response.data;
    },

    getTransactions: async (consumerId: string) => {
        const response = await api.get(`/api/payment/transactions/${consumerId}`);
        return response.data;
    },
};

export const grievanceAPI = {
    fileComplaint: async (data: any) => {
        const response = await api.post('/api/grievance/complaints', data);
        return response.data;
    },

    getComplaints: async (consumerId: string, status?: string) => {
        const url = status
            ? `/api/grievance/complaints/${consumerId}?status=${status}`
            : `/api/grievance/complaints/${consumerId}`;
        const response = await api.get(url);
        return response.data;
    },

    createServiceRequest: async (data: any) => {
        const response = await api.post('/api/grievance/service-requests', data);
        return response.data;
    },

    getServiceRequests: async (consumerId: string) => {
        const response = await api.get(`/api/grievance/service-requests/${consumerId}`);
        return response.data;
    },
};
