import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 8002,
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'utility_db',
        user: process.env.DB_USER || 'utility_user',
        password: process.env.DB_PASSWORD || 'utility_password',
    },

    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:8001',
};
