import db from './index';
import logger from '../utils/logger';

const migrations = [
    {
        name: 'create_kiosks_table',
        sql: `
      CREATE TABLE IF NOT EXISTS kiosks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kiosk_id VARCHAR(50) UNIQUE NOT NULL,
        location VARCHAR(255),
        ip_address VARCHAR(45),
        status VARCHAR(20) DEFAULT 'OFFLINE',
        last_heartbeat TIMESTAMP,
        version VARCHAR(20),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_kiosks_kiosk_id ON kiosks(kiosk_id);
      CREATE INDEX IF NOT EXISTS idx_kiosks_status ON kiosks(status);
    `
    },
    {
        name: 'create_kiosk_metrics_table',
        sql: `
      CREATE TABLE IF NOT EXISTS kiosk_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kiosk_id UUID REFERENCES kiosks(id) ON DELETE CASCADE,
        cpu_usage DECIMAL(5,2),
        memory_usage DECIMAL(5,2),
        disk_usage DECIMAL(5,2),
        network_latency INT,
        active_users INT DEFAULT 0,
        temperature DECIMAL(5,2),
        uptime_seconds BIGINT,
        recorded_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_metrics_kiosk_id ON kiosk_metrics(kiosk_id);
      CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON kiosk_metrics(recorded_at);
    `
    },
    {
        name: 'create_kiosk_alerts_table',
        sql: `
      CREATE TABLE IF NOT EXISTS kiosk_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kiosk_id UUID REFERENCES kiosks(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        message TEXT,
        details JSONB,
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP,
        resolved_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_alerts_kiosk_id ON kiosk_alerts(kiosk_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON kiosk_alerts(resolved);
      CREATE INDEX IF NOT EXISTS idx_alerts_severity ON kiosk_alerts(severity);
    `
    },
    {
        name: 'create_system_events_table',
        sql: `
      CREATE TABLE IF NOT EXISTS system_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kiosk_id UUID REFERENCES kiosks(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_events_kiosk_id ON system_events(kiosk_id);
      CREATE INDEX IF NOT EXISTS idx_events_type ON system_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_events_created_at ON system_events(created_at);
    `
    }
];

export async function runMigrations() {
    logger.info('Starting database migrations...');

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

// Run migrations if executed directly
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
