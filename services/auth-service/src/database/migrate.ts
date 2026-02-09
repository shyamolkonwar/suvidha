import { db } from './index';
import logger from '../utils/logger';

async function migrate() {
    try {
        logger.info('Starting database migration...');

        // Create users table
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        consumer_id VARCHAR(50) UNIQUE NOT NULL,
        phone VARCHAR(15),
        email VARCHAR(100),
        password_hash VARCHAR(255) NOT NULL,
        language_preference VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP
      );
    `);

        logger.info('Created users table');

        // Create sessions table
        await db.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        jwt_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMP NOT NULL,
        kiosk_id VARCHAR(50),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        revoked BOOLEAN DEFAULT FALSE
      );
    `);

        logger.info('Created sessions table');

        // Create indexes
        await db.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_users_consumer_id ON users(consumer_id);
    `);

        logger.info('Created indexes');

        // Create refresh_tokens table
        await db.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        revoked BOOLEAN DEFAULT FALSE
      );
    `);

        logger.info('Created refresh_tokens table');

        logger.info('Migration completed successfully');
    } catch (error) {
        logger.error('Migration failed', error);
        throw error;
    } finally {
        await db.close();
    }
}

// Run migration if called directly
if (require.main === module) {
    migrate().catch(console.error);
}

export default migrate;
