import db from './index';
import logger from '../utils/logger';

const migrations = [
    {
        name: 'create_daily_stats_table',
        sql: `
      CREATE TABLE IF NOT EXISTS daily_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL UNIQUE,
        total_transactions INT DEFAULT 0,
        total_revenue DECIMAL(12,2) DEFAULT 0,
        total_bills_paid INT DEFAULT 0,
        total_complaints INT DEFAULT 0,
        total_service_requests INT DEFAULT 0,
        unique_users INT DEFAULT 0,
        avg_transaction_value DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
    `
    },
    {
        name: 'create_service_usage_table',
        sql: `
      CREATE TABLE IF NOT EXISTS service_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_type VARCHAR(50) NOT NULL,
        usage_count INT DEFAULT 0,
        date DATE NOT NULL,
        hour INT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_service_usage_date ON service_usage(date);
      CREATE INDEX IF NOT EXISTS idx_service_usage_type ON service_usage(service_type);
    `
    },
    {
        name: 'create_revenue_breakdown_table',
        sql: `
      CREATE TABLE IF NOT EXISTS revenue_breakdown (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        utility_type VARCHAR(50),
        revenue DECIMAL(12,2) DEFAULT 0,
        transaction_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_revenue_date ON revenue_breakdown(date);
      CREATE INDEX IF NOT EXISTS idx_revenue_utility ON revenue_breakdown(utility_type);
    `
    },
    {
        name: 'create_user_demographics_table',
        sql: `
      CREATE TABLE IF NOT EXISTS user_demographics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        language_preference VARCHAR(10),
        user_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_demographics_date ON user_demographics(date);
    `
    }
];

export async function runMigrations() {
    logger.info('Starting analytics database migrations...');

    for (const migration of migrations) {
        try {
            logger.info(`Running migration: ${migration.name}`);
            await db.query(migration.sql);
            logger.info(`✓ Migration ${migration.name} completed`);
        } catch (error) {
            logger.error(`✗ Migration ${migration.name} failed:`, error);
            throw error;
        }
    }

    logger.info('All migrations completed successfully');
}

if (require.main === module) {
    runMigrations()
        .then(() => {
            logger.info('Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Migration script failed:', error);
            process.exit(1);
        });
}
