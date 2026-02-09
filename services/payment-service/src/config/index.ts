import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 8003,
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'payment_db',
        user: process.env.DB_USER || 'payment_user',
        password: process.env.DB_PASSWORD || 'payment_password',
    },

    payment: {
        gateway: process.env.PAYMENT_GATEWAY || 'mock', // 'razorpay' or 'mock'
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
        currency: process.env.PAYMENT_CURRENCY || 'INR',
    },

    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:8001',
    utilityServiceUrl: process.env.UTILITY_SERVICE_URL || 'http://utility-service:8002',
};
