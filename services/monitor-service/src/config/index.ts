import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 8005,
    env: process.env.NODE_ENV || 'development',

    // Database
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5436'),
        database: process.env.DB_NAME || 'monitor_db',
        user: process.env.DB_USER || 'monitor_user',
        password: process.env.DB_PASSWORD || 'monitor_password',
    },

    // Auth service for JWT verification
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',

    // Alert thresholds
    alerts: {
        heartbeatTimeoutMinutes: parseInt(process.env.HEARTBEAT_TIMEOUT || '5'),
        cpuThreshold: parseInt(process.env.CPU_THRESHOLD || '80'),
        memoryThreshold: parseInt(process.env.MEMORY_THRESHOLD || '85'),
        diskThreshold: parseInt(process.env.DISK_THRESHOLD || '90'),
    }
};
