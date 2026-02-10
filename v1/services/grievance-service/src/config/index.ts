import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 8004,
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'grievance_db',
        user: process.env.DB_USER || 'grievance_user',
        password: process.env.DB_PASSWORD || 'grievance_password',
    },

    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    },

    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:8001',
};
