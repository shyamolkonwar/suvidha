import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 8007,
    env: process.env.NODE_ENV || 'development',

    // Database connections
    db: {
        // Analytics DB for aggregated data
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5438'),
        database: process.env.DB_NAME || 'analytics_db',
        user: process.env.DB_USER || 'analytics_user',
        password: process.env.DB_PASSWORD || 'analytics_password',
    },

    // Other service databases for data aggregation
    services: {
        auth: process.env.AUTH_DB_URL || 'postgresql://auth_user:auth_password@localhost:5432/auth_db',
        utility: process.env.UTILITY_DB_URL || 'postgresql://utility_user:utility_password@localhost:5433/utility_db',
        payment: process.env.PAYMENT_DB_URL || 'postgresql://payment_user:payment_password@localhost:5434/payment_db',
        grievance: process.env.GRIEVANCE_DB_URL || 'postgresql://grievance_user:grievance_password@localhost:5435/grievance_db',
    },

    // Auth service
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
};
