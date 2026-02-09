import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 8006,
    env: process.env.NODE_ENV || 'development',

    // Database
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5437'),
        database: process.env.DB_NAME || 'cms_db',
        user: process.env.DB_USER || 'cms_user',
        password: process.env.DB_PASSWORD || 'cms_password',
    },

    // Auth service
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',

    // File upload
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    }
};
